-- Live exchange rates (IQD base).
-- Only edit USD — EUR and GBP auto-update via trigger (see 20250615110000 migration).

CREATE TABLE IF NOT EXISTS public.exchange_rates (
  code text PRIMARY KEY CHECK (code IN ('IQD', 'USD', 'EUR', 'GBP')),
  label text NOT NULL,
  symbol text NOT NULL DEFAULT '',
  iqd_per_unit numeric(12, 4) NOT NULL CHECK (iqd_per_unit > 0),
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS exchange_rates_active_idx ON public.exchange_rates (active);

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exchange_rates_public_read"
  ON public.exchange_rates FOR SELECT
  USING (active = true);

CREATE OR REPLACE FUNCTION public.set_exchange_rates_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS exchange_rates_updated_at ON public.exchange_rates;
CREATE TRIGGER exchange_rates_updated_at
  BEFORE UPDATE ON public.exchange_rates
  FOR EACH ROW EXECUTE FUNCTION public.set_exchange_rates_updated_at();

-- Seed: 154,000 IQD = 100 USD → 1,540 IQD per USD
INSERT INTO public.exchange_rates (code, label, symbol, iqd_per_unit, active)
VALUES
  ('IQD', 'IQD', '', 1, true),
  ('USD', 'USD', '$', 1540, true),
  ('EUR', 'EUR', '€', 1781, true),
  ('GBP', 'GBP', '£', 2066, true)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  symbol = EXCLUDED.symbol,
  iqd_per_unit = EXCLUDED.iqd_per_unit,
  active = EXCLUDED.active,
  updated_at = now();
