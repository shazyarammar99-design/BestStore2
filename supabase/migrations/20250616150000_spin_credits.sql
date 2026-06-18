-- Spin credits: earned from qualifying purchases, consumed when spinning

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS spin_credits int NOT NULL DEFAULT 0 CHECK (spin_credits >= 0);

ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS spin_credit_granted boolean NOT NULL DEFAULT false;
