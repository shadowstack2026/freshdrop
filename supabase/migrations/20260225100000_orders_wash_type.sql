-- Spara typ av tvätt (grovtvätt, vardagstvätt, mattvätt) på order
alter table public.orders
  add column if not exists wash_type text;

comment on column public.orders.wash_type is 'Typ av tvätt: grovtvatt, vardagstvatt, mattvatt';
