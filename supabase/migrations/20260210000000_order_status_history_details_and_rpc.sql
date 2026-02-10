-- 1) Kolumn details: jsonb NOT NULL DEFAULT '{}', + GIN-index
ALTER TABLE public.order_status_history
  ADD COLUMN IF NOT EXISTS details jsonb;

ALTER TABLE public.order_status_history
  ALTER COLUMN details SET DEFAULT '{}'::jsonb;

UPDATE public.order_status_history
SET details = COALESCE(details, '{}'::jsonb)
WHERE details IS NULL;

ALTER TABLE public.order_status_history
  ALTER COLUMN details SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_order_status_history_details_gin
  ON public.order_status_history USING GIN (details);

-- 2) RPC: insert och returnera raden
CREATE OR REPLACE FUNCTION public.add_order_status_history(
  p_order_id uuid,
  p_status text,
  p_details jsonb
)
RETURNS SETOF public.order_status_history
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_email text;
BEGIN
  -- Vid null order_id måste minst en ägareidentifierare sättas (constraint)
  IF p_order_id IS NULL THEN
    v_customer_email := NULLIF(TRIM(p_details->>'email'), '');
    IF v_customer_email IS NULL THEN
      v_customer_email := NULLIF(TRIM(p_details->>'contact_email'), '');
    END IF;
    IF v_customer_email IS NULL THEN
      v_customer_email := 'unknown@booking';
    END IF;
  END IF;

  RETURN QUERY
  INSERT INTO public.order_status_history (
    order_id,
    status,
    details,
    customer_email
  )
  VALUES (
    p_order_id,
    p_status,
    COALESCE(p_details, '{}'::jsonb),
    CASE WHEN p_order_id IS NULL THEN v_customer_email ELSE NULL END
  )
  RETURNING *;
END;
$$;

-- Endast RPC-anrop behöver tillåtas; insert görs inuti funktionen (SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION public.add_order_status_history(uuid, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_order_status_history(uuid, text, jsonb) TO anon;
