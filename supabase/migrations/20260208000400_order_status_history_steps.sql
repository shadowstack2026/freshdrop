alter table public.order_status_history
  add column if not exists user_id uuid references public.profiles (id),
  add column if not exists guest_lead_id uuid references public.guest_leads (id),
  add column if not exists customer_email text,
  add column if not exists event_type text,
  add column if not exists details jsonb;

update public.order_status_history
set event_type = status
where event_type is null;

alter table public.order_status_history
  alter column event_type set not null;

-- RLS: no insert policy (service role only), owners/admin can read
drop policy if exists "Ägare och admin kan se status-historik" on public.order_status_history;

create policy "Ägare och admin kan se status-historik"
  on public.order_status_history
  for select
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and (
          o.user_id = auth.uid()
          or exists (
            select 1
            from public.profiles p
            where p.id = auth.uid() and p.role = 'admin'
          )
        )
    )
  );
