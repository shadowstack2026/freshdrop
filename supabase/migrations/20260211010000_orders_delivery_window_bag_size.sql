-- Leverans som tidsintervall (samma logik som upphämtning) och påsstorlek istället för vikt i UI
alter table public.orders
  add column if not exists delivery_window text,
  add column if not exists bag_size text;

comment on column public.orders.delivery_window is 'Leveranstid som intervall, t.ex. 08:00-11:00';
comment on column public.orders.bag_size is 'Vald påsstorlek: small, medium, large';
