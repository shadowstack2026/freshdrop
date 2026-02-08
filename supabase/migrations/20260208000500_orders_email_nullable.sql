alter table public.orders
  alter column customer_email drop not null;

drop policy if exists "Alla kan skapa orders" on public.orders;

create policy "Alla kan skapa orders"
  on public.orders
  for insert
  with check (
    (customer_email is not null or customer_phone is not null)
    and (
      (user_id = auth.uid() and guest_lead_id is null)
      or (user_id is null and guest_lead_id is not null)
    )
  );
