-- Gör order_status_history redo för bokningsförfrågningar (samma idé som guest_leads)
ALTER TABLE public.order_status_history
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles (id);
ALTER TABLE public.order_status_history
  ADD COLUMN IF NOT EXISTS guest_lead_id uuid REFERENCES public.guest_leads (id);
ALTER TABLE public.order_status_history
  ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE public.order_status_history
  ADD COLUMN IF NOT EXISTS event_type text;
ALTER TABLE public.order_status_history
  ADD COLUMN IF NOT EXISTS details jsonb;

UPDATE public.order_status_history
SET event_type = COALESCE(event_type, 'STATUS_UPDATE')
WHERE event_type IS NULL;

ALTER TABLE public.order_status_history
  ALTER COLUMN event_type SET NOT NULL;

ALTER TABLE public.order_status_history
  ALTER COLUMN order_id DROP NOT NULL;

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

DROP POLICY IF EXISTS "Public can insert booking preferences" ON public.order_status_history;
CREATE POLICY "Public can insert booking preferences"
  ON public.order_status_history
  FOR INSERT
  WITH CHECK (
    order_id IS NULL
    AND event_type = 'booking_preferences'
    AND status = 'BOOKING_DATA'
  );

DROP POLICY IF EXISTS "Visa bokningsförfrågningar i Table Editor" ON public.order_status_history;
CREATE POLICY "Visa bokningsförfrågningar i Table Editor"
  ON public.order_status_history
  FOR SELECT
  USING (event_type = 'booking_preferences');
