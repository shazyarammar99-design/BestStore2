-- Prize types for checkout redemption + order discount tracking

ALTER TABLE public.prizes
  ADD COLUMN IF NOT EXISTS prize_type text NOT NULL DEFAULT 'fixed_off'
    CHECK (prize_type IN ('percent_off', 'fixed_off', 'free_delivery'));

UPDATE public.prizes SET prize_type = 'percent_off' WHERE name = '10% Store Credit';
UPDATE public.prizes SET prize_type = 'fixed_off' WHERE name IN (
  '500 IQD Bonus',
  '1000 IQD Bonus',
  'Grand Prize — 5000 IQD',
  'Rare Skin Voucher'
);
UPDATE public.prizes SET prize_type = 'free_delivery' WHERE name = 'Free Delivery Token';

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS subtotal_amount numeric,
  ADD COLUMN IF NOT EXISTS discount_amount numeric NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  ADD COLUMN IF NOT EXISTS reward_inventory_id uuid REFERENCES public.inventory (id) ON DELETE SET NULL;

UPDATE public.orders
SET subtotal_amount = amount
WHERE subtotal_amount IS NULL;

ALTER TABLE public.orders
  ALTER COLUMN subtotal_amount SET DEFAULT 0;

UPDATE public.orders SET subtotal_amount = 0 WHERE subtotal_amount IS NULL;

ALTER TABLE public.orders
  ALTER COLUMN subtotal_amount SET NOT NULL;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_subtotal_amount_check CHECK (subtotal_amount >= 0);
