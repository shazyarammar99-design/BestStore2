import { DEFAULT_IQD_PER_UNIT, type CurrencyCode, type IqdPerUnitMap } from '@/config/currency';
import type { Locale } from '@/i18n/types';

const LOCALE_MAP: Record<Locale, string> = {
  en: 'en-US',
  ku: 'ckb-IQ',
  ar: 'ar-IQ',
};

export function formatCurrency(
  iqdAmount: number,
  currency: CurrencyCode = 'IQD',
  locale: Locale = 'en',
  rates: IqdPerUnitMap = DEFAULT_IQD_PER_UNIT
): string {
  const amount = iqdAmount / rates[currency];
  const loc = LOCALE_MAP[locale];

  if (currency === 'IQD') {
    return `${Math.round(amount).toLocaleString(loc)} IQD`;
  }

  const formatted = amount.toLocaleString(loc, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
  return `${symbol}${formatted}`;
}

export function formatPrice(
  iqdAmount: number,
  currency: CurrencyCode = 'IQD',
  rates: IqdPerUnitMap = DEFAULT_IQD_PER_UNIT
): string {
  return formatCurrency(iqdAmount, currency, 'en', rates);
}

export function formatFromPrice(
  iqdAmount: number,
  currency: CurrencyCode,
  locale: Locale,
  rates: IqdPerUnitMap = DEFAULT_IQD_PER_UNIT
): string {
  return `from ${formatCurrency(iqdAmount, currency, locale, rates)}`;
}
