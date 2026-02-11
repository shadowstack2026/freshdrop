-- Vy så att du i Table Editor ser vilket konto varje subscription tillhör (namn, e-post, telefon).

create or replace view public.subscriptions_with_profile as
select
  s.user_id,
  s.plan,
  s.status,
  s.credits_remaining,
  s.period_start,
  s.period_end,
  s.created_at,
  s.updated_at,
  p.full_name,
  p.email,
  p.phone
from public.subscriptions s
left join public.profiles p on p.id = s.user_id;

comment on view public.subscriptions_with_profile is 'Subscription med profilinfo (namn, e-post, telefon) för enklare översikt i Table Editor';

-- Gör vyn läsbar för alla som kan läsa subscriptions/profiles (admin ser alla via is_admin)
grant select on public.subscriptions_with_profile to authenticated;
grant select on public.subscriptions_with_profile to service_role;
