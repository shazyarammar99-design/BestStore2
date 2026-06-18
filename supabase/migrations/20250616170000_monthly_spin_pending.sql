-- Track unclaimed monthly spin credit (prevents stacking missed periods)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS monthly_spin_pending boolean NOT NULL DEFAULT false;
