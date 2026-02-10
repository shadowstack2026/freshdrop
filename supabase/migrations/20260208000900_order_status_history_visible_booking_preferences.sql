-- Visa bokningsförfrågningar (event_type = booking_preferences) i Table Editor.
-- Utan denna policy döljer RLS raderna så att tabellen ser tom ut.
drop policy if exists "Visa bokningsförfrågningar i Table Editor" on public.order_status_history;
create policy "Visa bokningsförfrågningar i Table Editor"
  on public.order_status_history
  for select
  using (event_type = 'booking_preferences');
