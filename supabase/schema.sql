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

create policy "Användare kan läsa sin profil"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Användare kan uppdatera sin profil"
  on public.profiles
  for update
  using (auth.uid() = id);

create policy "Admin kan läsa alla profiler"
  on public.profiles
  for select
  using (exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

-- ORDERS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id),
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
  using (exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

-- Alla (även gäster) får skapa orders
create policy "Alla kan skapa orders"
  on public.orders
  for insert
  with check (customer_email is not null);

-- Admin kan uppdatera alla orders
create policy "Admin kan uppdatera alla orders"
  on public.orders
  for update
  using (exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

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

