import {
  CHECKOUT_PROMO_CODES,
  CHECKOUT_SERVICE_FEE_PERCENT,
  type PromoCodeConfig,
} from '@/config/checkout';

export type CheckoutPricing = {
  subtotal: number;
  serviceFee: number;
  discount: number;
  total: number;
  promo: PromoCodeConfig | null;
  promoCode: string | null;
};

export function resolvePromoCode(code: string): PromoCodeConfig | null {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  return CHECKOUT_PROMO_CODES[normalized] ?? null;
}

export function calculateCheckoutPricing(
  subtotal: number,
  promoCode: string | null,
  feePercent: number = CHECKOUT_SERVICE_FEE_PERCENT
): CheckoutPricing {
  const promo = promoCode ? resolvePromoCode(promoCode) : null;
  const serviceFee = Math.round(subtotal * (feePercent / 100));
  const beforeDiscount = subtotal + serviceFee;

  let discount = 0;
  if (promo) {
    if (promo.percentOff) {
      discount = Math.round(beforeDiscount * (promo.percentOff / 100));
    } else if (promo.fixedOff) {
      discount = Math.min(promo.fixedOff, beforeDiscount);
    }
  }

  const total = Math.max(0, beforeDiscount - discount);

  return {
    subtotal,
    serviceFee,
    discount,
    total,
    promo,
    promoCode: promo ? promoCode!.trim().toUpperCase() : null,
  };
}
