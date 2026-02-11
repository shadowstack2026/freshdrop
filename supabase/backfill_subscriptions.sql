-- Kör denna EN GÅNG i Supabase SQL Editor.
-- Skapar en free subscription-rad för alla som har profil men saknar rad i subscriptions.

INSERT INTO public.subscriptions (
  user_id,
  plan,
  status,
  credits_remaining,
  period_start,
  period_end
)
SELECT
  p.id,
  'free',
  'active',
  0,
  current_date,
  current_date
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions s WHERE s.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;
