export type PromoCodeConfig = {
  label: string;
  percentOff?: number;
  fixedOff?: number;
};

/** Service fee applied to subtotal (0 = disabled). */
export const CHECKOUT_SERVICE_FEE_PERCENT = 0;

export const CHECKOUT_SELLER = {
  name: 'BEST STORE',
  rating: 4.9,
  reviewCount: 500,
};

/** Promo codes — keys are case-insensitive at apply time. */
export const CHECKOUT_PROMO_CODES: Record<string, PromoCodeConfig> = {
  BEST10: { label: '10% off', percentOff: 10 },
};
