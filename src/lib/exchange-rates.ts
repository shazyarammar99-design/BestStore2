import { cache } from 'react';

import { unstable_cache } from 'next/cache';

import { createClient } from '@supabase/supabase-js';

import {
  CURRENCIES,
  DEFAULT_FX_CROSS_RATES,
  DEFAULT_IQD_PER_UNIT,
  deriveIqdPerUnitFromUsd,
  type CurrencyCode,
  type CurrencyMeta,
  type FxCrossRates,
  type IqdPerUnitMap,
} from '@/config/currency';

export type { IqdPerUnitMap };

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getClient() {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

function buildCurrencyMetaFromRates(rates: IqdPerUnitMap): CurrencyMeta[] {
  const order: CurrencyCode[] = ['IQD', 'USD', 'EUR', 'GBP'];
  return order.map((code) => {
    const fallback = CURRENCIES.find((c) => c.code === code)!;
    return {
      code,
      label: fallback.label,
      symbol: fallback.symbol,
      iqdPerUnit: rates[code],
    };
  });
}

async function fetchFxCrossRatesFromDb(): Promise<FxCrossRates | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from('fx_cross_rates')
    .select('pair, multiplier');

  if (error || !data?.length) return null;

  let eurPerUsd: number | null = null;
  let gbpPerUsd: number | null = null;

  for (const row of data) {
    const value = Number(row.multiplier);
    if (!Number.isFinite(value) || value <= 0) continue;
    if (row.pair === 'EUR_PER_USD') eurPerUsd = value;
    if (row.pair === 'GBP_PER_USD') gbpPerUsd = value;
  }

  if (eurPerUsd == null || gbpPerUsd == null) return null;
  return { eurPerUsd, gbpPerUsd };
}

async function fetchUsdRateFromDb(): Promise<number | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from('exchange_rates')
    .select('iqd_per_unit')
    .eq('code', 'USD')
    .eq('active', true)
    .maybeSingle();

  if (error || !data) return null;
  const value = Number(data.iqd_per_unit);
  return Number.isFinite(value) && value > 0 ? value : null;
}

async function fetchExchangeRatesFromDb(): Promise<IqdPerUnitMap | null> {
  const [usdRate, crossRates] = await Promise.all([
    fetchUsdRateFromDb(),
    fetchFxCrossRatesFromDb(),
  ]);

  if (usdRate == null) return null;
  return deriveIqdPerUnitFromUsd(usdRate, crossRates ?? DEFAULT_FX_CROSS_RATES);
}

async function fetchCurrencyMetaFromDb(): Promise<CurrencyMeta[] | null> {
  const rates = await fetchExchangeRatesFromDb();
  if (!rates) return null;
  return buildCurrencyMetaFromRates(rates);
}

const cachedRates = unstable_cache(fetchExchangeRatesFromDb, ['exchange-rates'], {
  revalidate: 30,
  tags: ['exchange-rates'],
});

const cachedCurrencyMeta = unstable_cache(fetchCurrencyMetaFromDb, ['exchange-rates-meta'], {
  revalidate: 30,
  tags: ['exchange-rates'],
});

/** Server-side rates with 30s cache. USD anchor → EUR/GBP derived. */
export const getExchangeRates = cache(async (): Promise<IqdPerUnitMap> => {
  const fromDb = await cachedRates();
  return fromDb ?? DEFAULT_IQD_PER_UNIT;
});

/** Currency list with live rates for selectors. */
export const getCurrencies = cache(async (): Promise<CurrencyMeta[]> => {
  const fromDb = await cachedCurrencyMeta();
  return fromDb ?? CURRENCIES;
});

/** Cached payload for the client API route. */
export const getCachedExchangeRatesResponse = cache(async (): Promise<{
  rates: IqdPerUnitMap;
  currencies: CurrencyMeta[];
  source: 'database' | 'fallback';
}> => {
  const fromDb = await cachedRates();
  if (fromDb) {
    return {
      rates: fromDb,
      currencies: buildCurrencyMetaFromRates(fromDb),
      source: 'database',
    };
  }

  return {
    rates: DEFAULT_IQD_PER_UNIT,
    currencies: CURRENCIES,
    source: 'fallback',
  };
});

/** Uncached fetch (single DB round-trip batch). */
export async function getExchangeRatesLive(): Promise<{
  rates: IqdPerUnitMap;
  currencies: CurrencyMeta[];
  source: 'database' | 'fallback';
  anchor: 'USD';
}> {
  const rates = await fetchExchangeRatesFromDb();

  if (rates) {
    return {
      rates,
      currencies: buildCurrencyMetaFromRates(rates),
      source: 'database',
      anchor: 'USD',
    };
  }

  return {
    rates: DEFAULT_IQD_PER_UNIT,
    currencies: CURRENCIES,
    source: 'fallback',
    anchor: 'USD',
  };
}
