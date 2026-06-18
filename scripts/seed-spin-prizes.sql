-- Seed / refresh spin wheel prizes (safe to re-run)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/hyeoxkedyyuislupsukg/sql/new

DELETE FROM public.inventory;
DELETE FROM public.spins;
DELETE FROM public.prizes;

INSERT INTO public.prizes (name, probability_weight, image_url, value, active)
VALUES
  ('10% Store Credit', 50, null, 10, true),
  ('500 IQD Bonus', 25, null, 500, true),
  ('Free Delivery Token', 15, null, 1, true),
  ('1000 IQD Bonus', 5, null, 1000, true);

SELECT name, probability_weight AS weight, value FROM public.prizes ORDER BY probability_weight DESC;
