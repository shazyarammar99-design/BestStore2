import 'server-only';
import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

export const isStripeConfigured = Boolean(secretKey);

export const stripe: Stripe | null = secretKey ? new Stripe(secretKey) : null;

export const STRIPE_CURRENCY = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();

// Stripe expects amounts in the currency's smallest unit. Zero-decimal currencies
// take the raw value; three-decimal currencies must be multiples of 10.
const ZERO_DECIMAL = new Set([
  'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg',
  'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf',
]);
const THREE_DECIMAL = new Set(['bhd', 'jod', 'kwd', 'omr', 'tnd', 'iqd', 'lyd']);

/** Convert a major-unit amount (e.g. IQD price) to Stripe's smallest-unit integer. */
export function toStripeAmount(value: number, currency = STRIPE_CURRENCY): number {
  if (ZERO_DECIMAL.has(currency)) return Math.round(value);
  if (THREE_DECIMAL.has(currency)) return Math.round((value * 1000) / 10) * 10;
  return Math.round(value * 100);
}
