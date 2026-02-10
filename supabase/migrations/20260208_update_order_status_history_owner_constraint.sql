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
