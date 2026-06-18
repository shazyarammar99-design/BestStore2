-- USD is the anchor rate. Updating USD auto-recalculates EUR and GBP.

CREATE TABLE IF NOT EXISTS public.fx_cross_rates (
  pair text PRIMARY KEY,
  multiplier numeric(12, 6) NOT NULL CHECK (multiplier > 0),
  description text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.fx_cross_rates (pair, multiplier, description)
VALUES
  ('EUR_PER_USD', 1.1567, 'IQD per EUR = IQD per USD × this (USD/EUR spot)'),
  ('GBP_PER_USD', 1.3413, 'IQD per GBP = IQD per USD × this (GBP/USD spot)')
ON CONFLICT (pair) DO UPDATE SET
  multiplier = EXCLUDED.multiplier,
  description = EXCLUDED.description,
  updated_at = now();

ALTER TABLE public.fx_cross_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fx_cross_rates_public_read"
  ON public.fx_cross_rates FOR SELECT
  USING (true);

CREATE OR REPLACE FUNCTION public.sync_derived_exchange_rates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  usd_rate numeric;
  eur_mult numeric;
  gbp_mult numeric;
BEGIN
  IF NEW.code <> 'USD' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.iqd_per_unit IS NOT DISTINCT FROM OLD.iqd_per_unit THEN
    RETURN NEW;
  END IF;

  usd_rate := NEW.iqd_per_unit;

  SELECT multiplier INTO eur_mult FROM public.fx_cross_rates WHERE pair = 'EUR_PER_USD';
  SELECT multiplier INTO gbp_mult FROM public.fx_cross_rates WHERE pair = 'GBP_PER_USD';

  IF eur_mult IS NULL OR gbp_mult IS NULL THEN
    RAISE EXCEPTION 'fx_cross_rates missing EUR_PER_USD or GBP_PER_USD';
  END IF;

  UPDATE public.exchange_rates
  SET iqd_per_unit = ROUND(usd_rate * eur_mult),
      updated_at = now()
  WHERE code = 'EUR';

  UPDATE public.exchange_rates
  SET iqd_per_unit = ROUND(usd_rate * gbp_mult),
      updated_at = now()
  WHERE code = 'GBP';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_derived_on_usd_change ON public.exchange_rates;
CREATE TRIGGER sync_derived_on_usd_change
  AFTER INSERT OR UPDATE OF iqd_per_unit ON public.exchange_rates
  FOR EACH ROW
  WHEN (NEW.code = 'USD')
  EXECUTE FUNCTION public.sync_derived_exchange_rates();

-- Re-sync EUR/GBP from current USD anchor
DO $$
DECLARE
  usd_rate numeric;
  eur_mult numeric;
  gbp_mult numeric;
BEGIN
  SELECT iqd_per_unit INTO usd_rate FROM public.exchange_rates WHERE code = 'USD';
  SELECT multiplier INTO eur_mult FROM public.fx_cross_rates WHERE pair = 'EUR_PER_USD';
  SELECT multiplier INTO gbp_mult FROM public.fx_cross_rates WHERE pair = 'GBP_PER_USD';

  IF usd_rate IS NOT NULL AND eur_mult IS NOT NULL AND gbp_mult IS NOT NULL THEN
    UPDATE public.exchange_rates
    SET iqd_per_unit = ROUND(usd_rate * eur_mult), updated_at = now()
    WHERE code = 'EUR';

    UPDATE public.exchange_rates
    SET iqd_per_unit = ROUND(usd_rate * gbp_mult), updated_at = now()
    WHERE code = 'GBP';
  END IF;
END;
$$;
