-- Fix: Säkerställ att order_status_history har alla nödvändiga kolumner
-- innan constraints och policies som refererar till dem.
-- Denna migration körs efter order_status_history_steps och fixar eventuella
-- beroendeproblem om allow_guest kördes för tidigt.

-- Lägg till kolumner om de saknas (idempotent)
alter table public.order_status_history add column if not exists user_id uuid references public.profiles (id);
alter table public.order_status_history add column if not exists guest_lead_id uuid references public.guest_leads (id);
alter table public.order_status_history add column if not exists customer_email text;
alter table public.order_status_history add column if not exists event_type text;
alter table public.order_status_history add column if not exists details jsonb;

-- Uppdatera event_type för befintliga rader om den är null
update public.order_status_history
set event_type = status
where event_type is null and status is not null;

-- Constraint: minst en ägareidentifierare krävs
alter table public.order_status_history
  drop constraint if exists order_status_history_has_owner;

alter table public.order_status_history
  add constraint order_status_history_has_owner
  check (
    order_id is not null
    or user_id is not null
    or guest_lead_id is not null
    or customer_email is not null
  );
