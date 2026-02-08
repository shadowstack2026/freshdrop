-- Lägg till kolumner först (krävs för constraint nedan)
alter table public.order_status_history add column if not exists guest_lead_id uuid references public.guest_leads (id);
alter table public.order_status_history add column if not exists customer_email text;
alter table public.order_status_history add column if not exists event_type text;

alter table public.order_status_history
  alter column order_id drop not null;

alter table public.order_status_history
  drop constraint if exists order_status_history_has_owner;

alter table public.order_status_history
  add constraint order_status_history_has_owner
  check (
    order_id is not null
    or guest_lead_id is not null
    or customer_email is not null
  );

drop policy if exists "Public can insert booking preferences" on public.order_status_history;

create policy "Public can insert booking preferences"
  on public.order_status_history
  for insert
  with check (
    order_id is null
    and event_type = 'booking_preferences'
    and status = 'BOOKING_DATA'
  );
