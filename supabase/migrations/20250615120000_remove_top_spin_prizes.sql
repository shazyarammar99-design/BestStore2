-- Remove top two rare spin prizes from the wheel (2500 + 5000 IQD tier)

UPDATE public.prizes
SET active = false
WHERE name IN ('Rare Skin Voucher', 'Grand Prize — 5000 IQD');
