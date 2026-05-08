-- Kundens önskemål/notering på order
alter table public.orders
  add column if not exists customer_note text;

comment on column public.orders.customer_note is 'Kundens önskemål/notering som skrivs vid beställning';

