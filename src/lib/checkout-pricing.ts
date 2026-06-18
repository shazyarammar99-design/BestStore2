import {
  CHECKOUT_PROMO_CODES,
  CHECKOUT_SERVICE_FEE_PERCENT,
  type PromoCodeConfig,
} from '@/config/checkout';
import {
  computePrizeDiscount,
  type PrizeType,
} from '@/lib/spin/prize-effects';

export type SpinRewardSelection = {
  inventoryId: string;
  prizeType: PrizeType;
  value: number;
  label: string;
};

export type CheckoutPricing = {
  subtotal: number;
  serviceFee: number;
  discount: number;
  total: number;
  promo: PromoCodeConfig | null;
  promoCode: string | null;
  spinReward: SpinRewardSelection | null;
  discountSource: 'promo' | 'reward' | null;
  discountLabel: string | null;
};

export function resolvePromoCode(code: string): PromoCodeConfig | null {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  return CHECKOUT_PROMO_CODES[normalized] ?? null;
}

function promoDiscount(beforeDiscount: number, promo: PromoCodeConfig): number {
  if (promo.percentOff) {
    return Math.round(beforeDiscount * (promo.percentOff / 100));
  }
  if (promo.fixedOff) {
    return Math.min(promo.fixedOff, beforeDiscount);
  }
  return 0;
}

export function calculateCheckoutPricing(
  subtotal: number,
  promoCode: string | null,
  spinReward: SpinRewardSelection | null,
  feePercent: number = CHECKOUT_SERVICE_FEE_PERCENT
): CheckoutPricing {
  const serviceFee = Math.round(subtotal * (feePercent / 100));
  const beforeDiscount = subtotal + serviceFee;

  let discount = 0;
  let promo: PromoCodeConfig | null = null;
  let resolvedPromoCode: string | null = null;
  let discountSource: CheckoutPricing['discountSource'] = null;
  let discountLabel: string | null = null;

  if (spinReward) {
    const effect = computePrizeDiscount({
      prizeType: spinReward.prizeType,
      value: spinReward.value,
      subtotal,
      serviceFee,
    });
    discount = effect.discount;
    discountSource = 'reward';
    discountLabel = spinReward.label;
  } else if (promoCode) {
    promo = resolvePromoCode(promoCode);
    if (promo) {
      discount = promoDiscount(beforeDiscount, promo);
      resolvedPromoCode = promoCode.trim().toUpperCase();
      discountSource = 'promo';
      discountLabel = promo.label;
    }
  }

  const total = Math.max(0, beforeDiscount - discount);

  return {
    subtotal,
    serviceFee,
    discount,
    total,
    promo,
    promoCode: resolvedPromoCode,
    spinReward: spinReward ?? null,
    discountSource,
    discountLabel,
  };
}
