alter table public.guest_leads enable row level security;

drop policy if exists "Allow public to insert guest leads" on public.guest_leads;

create policy "Allow public to insert guest leads"
  on public.guest_leads
  for insert
  with check (true);
