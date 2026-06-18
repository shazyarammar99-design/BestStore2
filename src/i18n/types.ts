export type Locale = 'en' | 'ku' | 'ar';

export const LOCALES: { code: Locale; label: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ku', label: 'Kurdish', dir: 'rtl' },
  { code: 'ar', label: 'Arabic', dir: 'rtl' },
];

export const LOCALE_COOKIE = 'best-locale';
export const CURRENCY_COOKIE = 'best-currency';

export function isRtl(locale: Locale): boolean {
  return locale === 'ku' || locale === 'ar';
}
