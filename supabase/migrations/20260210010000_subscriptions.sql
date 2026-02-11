-- Abonnemang: en rad per användare (user_id = auth.users.id)
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

-- Användare läser/uppdaterar sin egen subscription
create policy "User can read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "User can update own subscription"
  on public.subscriptions for update
  using (auth.uid() = user_id);

-- Användare får skapa sin egen rad (vid ensure/fallback)
create policy "User can insert own subscription"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

-- Admin kan läsa alla (valfritt)
create policy "Admin can read all subscriptions"
  on public.subscriptions for select
  using (public.is_admin());

-- Trigger: när en profil skapas, skapa free subscription-rad
create or replace function public.create_subscription_for_new_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
  for each row
  execute function public.create_subscription_for_new_profile();

-- Uppdatera updated_at vid ändring
create or replace function public.subscriptions_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.subscriptions_updated_at();
