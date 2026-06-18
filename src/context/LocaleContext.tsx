'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CurrencyCode } from '@/config/currency';
import { CURRENCIES, DEFAULT_IQD_PER_UNIT, type CurrencyMeta, type IqdPerUnitMap } from '@/config/currency';
import { formatCurrency } from '@/lib/format-currency';
import { getUiStrings, t as translate } from '@/i18n/ui';
import {
  CURRENCY_COOKIE,
  isRtl,
  LOCALE_COOKIE,
  type Locale,
} from '@/i18n/types';

type LocaleContextValue = {
  locale: Locale;
  currency: CurrencyCode;
  iqdPerUnit: IqdPerUnitMap;
  currencies: CurrencyMeta[];
  ratesSource: 'database' | 'fallback';
  dir: 'ltr' | 'rtl';
  setLocale: (locale: Locale) => void;
  setCurrency: (currency: CurrencyCode) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  ui: ReturnType<typeof getUiStrings>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=31536000;samesite=lax`;
}

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const fromCookie = readCookie(LOCALE_COOKIE);
  if (fromCookie === 'ku' || fromCookie === 'ar' || fromCookie === 'en') return fromCookie;
  const fromStorage = localStorage.getItem(LOCALE_COOKIE);
  if (fromStorage === 'ku' || fromStorage === 'ar' || fromStorage === 'en') return fromStorage;
  return 'en';
}

function readStoredCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'IQD';
  const fromCookie = readCookie(CURRENCY_COOKIE);
  if (fromCookie === 'USD' || fromCookie === 'EUR' || fromCookie === 'GBP' || fromCookie === 'IQD') {
    return fromCookie;
  }
  const fromStorage = localStorage.getItem(CURRENCY_COOKIE);
  if (fromStorage === 'USD' || fromStorage === 'EUR' || fromStorage === 'GBP' || fromStorage === 'IQD') {
    return fromStorage;
  }
  return 'IQD';
}

function applyDocumentAttrs(locale: Locale) {
  document.documentElement.lang = locale === 'ku' ? 'ckb' : locale === 'ar' ? 'ar' : 'en';
  document.documentElement.dir = isRtl(locale) ? 'rtl' : 'ltr';
}

const RATES_POLL_MS = 5 * 60 * 1000;

function ratesEqual(a: IqdPerUnitMap, b: IqdPerUnitMap): boolean {
  return (
    a.IQD === b.IQD &&
    a.USD === b.USD &&
    a.EUR === b.EUR &&
    a.GBP === b.GBP
  );
}

function currenciesEqual(a: CurrencyMeta[], b: CurrencyMeta[]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (item, i) =>
      item.code === b[i].code &&
      item.iqdPerUnit === b[i].iqdPerUnit &&
      item.label === b[i].label &&
      item.symbol === b[i].symbol
  );
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [currency, setCurrencyState] = useState<CurrencyCode>('IQD');
  const [iqdPerUnit, setIqdPerUnit] = useState<IqdPerUnitMap>(DEFAULT_IQD_PER_UNIT);
  const [currencies, setCurrencies] = useState<CurrencyMeta[]>(CURRENCIES);
  const [ratesSource, setRatesSource] = useState<'database' | 'fallback'>('fallback');
  const [ready, setReady] = useState(false);

  const refreshRates = useCallback(async () => {
    try {
      const res = await fetch('/api/exchange-rates');
      if (!res.ok) return;
      const data = (await res.json()) as {
        rates: IqdPerUnitMap;
        currencies: CurrencyMeta[];
        source: 'database' | 'fallback';
      };
      if (data.rates) {
        setIqdPerUnit((prev) => (ratesEqual(prev, data.rates) ? prev : data.rates));
      }
      if (data.currencies?.length) {
        setCurrencies((prev) =>
          currenciesEqual(prev, data.currencies) ? prev : data.currencies
        );
      }
      if (data.source) {
        setRatesSource((prev) => (prev === data.source ? prev : data.source));
      }
    } catch {
      // Keep last known or default rates
    }
  }, []);

  useEffect(() => {
    const storedLocale = readStoredLocale();
    const storedCurrency = readStoredCurrency();
    setLocaleState(storedLocale);
    setCurrencyState(storedCurrency);
    applyDocumentAttrs(storedLocale);
    void refreshRates();
    setReady(true);
  }, [refreshRates]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refreshRates();
    }, RATES_POLL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [refreshRates]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(LOCALE_COOKIE, next);
    writeCookie(LOCALE_COOKIE, next);
    applyDocumentAttrs(next);
  }, []);

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next);
    localStorage.setItem(CURRENCY_COOKIE, next);
    writeCookie(CURRENCY_COOKIE, next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      currency,
      iqdPerUnit,
      currencies,
      ratesSource,
      dir: isRtl(locale) ? 'rtl' : 'ltr',
      setLocale,
      setCurrency,
      t: (key, vars) => translate(locale, key, vars),
      ui: getUiStrings(locale),
    }),
    [locale, currency, iqdPerUnit, currencies, ratesSource, setLocale, setCurrency]
  );

  if (!ready) {
    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
  }

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export function useTranslation() {
  const { locale, currency, iqdPerUnit, dir, t, ui } = useLocale();
  return { locale, currency, iqdPerUnit, dir, t, ui };
}

export function useFormatCurrency() {
  const { currency, locale, iqdPerUnit } = useLocale();
  return useCallback(
    (iqdAmount: number) => formatCurrency(iqdAmount, currency, locale, iqdPerUnit),
    [currency, locale, iqdPerUnit]
  );
}
