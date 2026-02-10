-- =========================================
-- Kör denna i Supabase SQL Editor (en gång)
-- så att bokningsdata sparas i order_status_history.
-- =========================================

-- 1) Säkerställ att kolumnerna finns
ALTER TABLE public.order_status_history
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles (id),
  ADD COLUMN IF NOT EXISTS guest_lead_id uuid REFERENCES public.guest_leads (id),
  ADD COLUMN IF NOT EXISTS customer_email text,
  ADD COLUMN IF NOT EXISTS event_type text,
  ADD COLUMN IF NOT EXISTS details jsonb;

-- 2) Sätt default på event_type för befintliga rader (om några saknar det)
UPDATE public.order_status_history
SET event_type = COALESCE(event_type, 'STATUS_UPDATE')
WHERE event_type IS NULL;

-- 3) order_id får vara null (för bokningsförfrågningar utan order ännu)
ALTER TABLE public.order_status_history
  ALTER COLUMN order_id DROP NOT NULL;

-- 4) Constraint: minst en av order_id, user_id, guest_lead_id, customer_email
ALTER TABLE public.order_status_history
  DROP CONSTRAINT IF EXISTS order_status_history_has_owner;
ALTER TABLE public.order_status_history
  ADD CONSTRAINT order_status_history_has_owner
  CHECK (
    order_id IS NOT NULL
    OR user_id IS NOT NULL
    OR guest_lead_id IS NOT NULL
    OR customer_email IS NOT NULL
  );

-- 5) Policy så att alla (inkl. anonyma) kan skicka in bokningsdata
--    Kräver: order_id = null, event_type = booking_preferences, status = BOOKING_DATA
--    Constraint (order_status_history_has_owner) kräver minst en av:
--    order_id, user_id, guest_lead_id, customer_email
DROP POLICY IF EXISTS "Public can insert booking preferences" ON public.order_status_history;
CREATE POLICY "Public can insert booking preferences"
  ON public.order_status_history
  FOR INSERT
  WITH CHECK (
    order_id IS NULL
    AND event_type = 'booking_preferences'
    AND status = 'BOOKING_DATA'
  );

-- 6) Policy så att du kan se bokningsraderna i Table Editor
DROP POLICY IF EXISTS "Visa bokningsförfrågningar i Table Editor" ON public.order_status_history;
CREATE POLICY "Visa bokningsförfrågningar i Table Editor"
  ON public.order_status_history
  FOR SELECT
  USING (event_type = 'booking_preferences');

-- Klart. Efter "Bekräfta bokning" i appen hamnar all data i details (jsonb).
-- Kontroll: visa senaste bokningarna
-- SELECT id, created_at, customer_email, details
-- FROM public.order_status_history
-- WHERE event_type = 'booking_preferences'
-- ORDER BY created_at DESC
-- LIMIT 10;
