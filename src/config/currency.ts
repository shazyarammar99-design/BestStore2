/** 154,000 IQD = 100 USD */
export const IQD_PER_USD = 1540;

/** Cross-rates vs USD — EUR/GBP derive automatically when USD changes */
export const EUR_PER_USD = 1.1567;
export const GBP_PER_USD = 1.3413;

/** ECB USD/EUR spot ~1.1567 (Jun 2026) */
export const IQD_PER_EUR = Math.round(IQD_PER_USD * EUR_PER_USD);

/** BoE GBP/USD spot ~1.3413 (Jun 2026) */
export const IQD_PER_GBP = Math.round(IQD_PER_USD * GBP_PER_USD);

export type CurrencyCode = 'IQD' | 'USD' | 'EUR' | 'GBP';

export type IqdPerUnitMap = Record<CurrencyCode, number>;

export type FxCrossRates = {
  eurPerUsd: number;
  gbpPerUsd: number;
};

export const DEFAULT_FX_CROSS_RATES: FxCrossRates = {
  eurPerUsd: EUR_PER_USD,
  gbpPerUsd: GBP_PER_USD,
};

export function deriveIqdPerUnitFromUsd(
  iqdPerUsd: number,
  cross: FxCrossRates = DEFAULT_FX_CROSS_RATES
): IqdPerUnitMap {
  return {
    IQD: 1,
    USD: iqdPerUsd,
    EUR: Math.round(iqdPerUsd * cross.eurPerUsd),
    GBP: Math.round(iqdPerUsd * cross.gbpPerUsd),
  };
}

export type CurrencyMeta = {
  code: CurrencyCode;
  label: string;
  symbol: string;
  iqdPerUnit: number;
};

export const DEFAULT_IQD_PER_UNIT: IqdPerUnitMap = deriveIqdPerUnitFromUsd(IQD_PER_USD);

/** Static fallback when DB is unavailable */
export const CURRENCIES: CurrencyMeta[] = [
  { code: 'IQD', label: 'IQD', symbol: '', iqdPerUnit: 1 },
  { code: 'USD', label: 'USD', symbol: '$', iqdPerUnit: IQD_PER_USD },
  { code: 'EUR', label: 'EUR', symbol: '€', iqdPerUnit: IQD_PER_EUR },
  { code: 'GBP', label: 'GBP', symbol: '£', iqdPerUnit: IQD_PER_GBP },
];

/** @deprecated Use getExchangeRates() — kept for backwards compatibility */
export const IQD_PER_UNIT: IqdPerUnitMap = DEFAULT_IQD_PER_UNIT;
