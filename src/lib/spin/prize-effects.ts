export type PrizeType = 'percent_off' | 'fixed_off' | 'free_delivery';

export type PrizeEffectInput = {
  prizeType: PrizeType;
  value: number;
  subtotal: number;
  serviceFee: number;
};

export type PrizeEffectResult = {
  discount: number;
  label: string;
};

export function computePrizeDiscount(input: PrizeEffectInput): PrizeEffectResult {
  const { prizeType, value, subtotal, serviceFee } = input;
  const beforeDiscount = subtotal + serviceFee;

  switch (prizeType) {
    case 'percent_off': {
      const discount = Math.round(beforeDiscount * (value / 100));
      return { discount: Math.min(discount, beforeDiscount), label: `${value}% off` };
    }
    case 'free_delivery': {
      const discount = Math.min(serviceFee, beforeDiscount);
      return { discount, label: 'Free delivery' };
    }
    case 'fixed_off':
    default: {
      const discount = Math.min(value, beforeDiscount);
      return { discount, label: `${value} IQD off` };
    }
  }
}

export function formatPrizeEffectPreview(
  prizeType: PrizeType,
  value: number,
  formatPrice: (iqd: number) => string
): string {
  switch (prizeType) {
    case 'percent_off':
      return `-${value}%`;
    case 'free_delivery':
      return 'Free delivery';
    case 'fixed_off':
    default:
      return `-${formatPrice(value)}`;
  }
}

export const PRIZE_TYPES: { value: PrizeType; label: string }[] = [
  { value: 'percent_off', label: 'Percent off' },
  { value: 'fixed_off', label: 'Fixed IQD off' },
  { value: 'free_delivery', label: 'Free delivery' },
];
