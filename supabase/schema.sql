-- FreshDrop datamodell för Supabase (Postgres)

-- PROFILER
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  address_line1 text,
  address_line2 text,
  postal_code text,
  city text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

create policy "Användare kan läsa sin profil"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Användare kan uppdatera sin profil"
  on public.profiles
  for update
  using (auth.uid() = id);

create policy "Användare kan skapa sin profil"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Admin kan läsa alla profiler"
  on public.profiles
  for select
  using (public.is_admin());

-- GUEST LEADS (måste skapas före orders - orders refererar hit)
create table if not exists public.guest_leads (
  id uuid primary key default gen_random_uuid(),
  email text,
  full_name text,
  phone text,
  address_line1 text,
  address_line2 text,
  postal_code text,
  city text,
  created_at timestamptz not null default now()
);

alter table public.guest_leads enable row level security;

create policy "Allow public to insert guest leads"
  on public.guest_leads
  for insert
  with check (true);

create policy "Prevent select on guest leads"
  on public.guest_leads
  for select
  using (false);

-- ORDERS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id),
  guest_lead_id uuid references public.guest_leads (id),
  customer_email text not null,
  customer_name text not null,
  customer_phone text,
  address_line1 text not null,
  address_line2 text,
  postal_code text not null,
  city text not null,
  pickup_date date not null,
  pickup_window text not null,
  estimated_weight_kg numeric not null,
  price_per_kg numeric not null default 60,
  estimated_total_price numeric not null,
  delivery_estimate_at timestamptz not null,
  status text not null default 'MOTTAGEN',
  payment_status text not null default 'unpaid',
  stripe_checkout_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
  add constraint orders_single_owner
  check (
    (user_id is not null and guest_lead_id is null) or
    (user_id is null and guest_lead_id is not null)
  );

alter table public.orders enable row level security;

-- Vanliga användare får läsa sina egna orders (kopplade via user_id)
create policy "Användare kan läsa sina egna orders"
  on public.orders
  for select
  using (auth.uid() = user_id);

-- Admin kan läsa alla orders
create policy "Admin kan läsa alla orders"
  on public.orders
  for select
  using (public.is_admin());

-- Alla (även gäster) får skapa orders
create policy "Alla kan skapa orders"
  on public.orders
  for insert
  with check (
    customer_email is not null
    and (
      (user_id = auth.uid() and guest_lead_id is null)
      or (user_id is null and guest_lead_id is not null)
    )
  );

-- Admin kan uppdatera alla orders
create policy "Admin kan uppdatera alla orders"
  on public.orders
  for update
  using (public.is_admin());

-- Inloggad användare kan uppdatera sina egna orders (t.ex. betalningsstatus via success-sida)
create policy "Användare kan uppdatera sina egna orders"
  on public.orders
  for update
  using (auth.uid() = user_id);

-- ORDER STATUS HISTORIK (valfri men inkluderad)
create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.order_status_history enable row level security;

create policy "Ägare och admin kan se status-historik"
  on public.order_status_history
  for select
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or
             exists (
               select 1
               from public.profiles p
               where p.id = auth.uid() and p.role = 'admin'
             ))
    )
  );

-- SUBSCRIPTIONS (abonnemang: en rad per användare)
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'standard_biweekly', 'premium_weekly')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  credits_remaining int not null default 0 check (credits_remaining >= 0),
  period_start date not null default current_date,
  period_end date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "User can read own subscription"
  on public.subscriptions for select using (auth.uid() = user_id);

create policy "User can update own subscription"
  on public.subscriptions for update using (auth.uid() = user_id);

create policy "User can insert own subscription"
  on public.subscriptions for insert with check (auth.uid() = user_id);

create policy "Admin can read all subscriptions"
  on public.subscriptions for select using (public.is_admin());

-- Trigger: skapa free subscription när ny profil skapas
create or replace function public.create_subscription_for_new_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.subscriptions (user_id, plan, status, credits_remaining, period_start, period_end)
  values (new.id, 'free', 'active', 0, current_date, current_date)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_created_create_subscription on public.profiles;
create trigger on_profile_created_create_subscription
  after insert on public.profiles
  for each row execute function public.create_subscription_for_new_profile();

