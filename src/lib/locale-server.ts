import { cookies } from 'next/headers';
import type { CurrencyCode } from '@/config/currency';
import { CURRENCY_COOKIE, LOCALE_COOKIE, type Locale } from '@/i18n/types';

export async function getLocaleFromCookies(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  if (value === 'ku' || value === 'ar' || value === 'en') return value;
  return 'en';
}

export async function getCurrencyFromCookies(): Promise<CurrencyCode> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CURRENCY_COOKIE)?.value;
  if (value === 'USD' || value === 'EUR' || value === 'GBP' || value === 'IQD') return value;
  return 'IQD';
}
