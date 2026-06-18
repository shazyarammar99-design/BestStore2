/** Minimum order total (IQD) to earn one spin credit per checkout. */
export const MIN_PURCHASE_IQD_FOR_SPIN = 10_000;

/** Days after signup (and between grants) for a free monthly spin credit. */
export const MONTHLY_FREE_SPIN_DAYS = 30;

export const MONTHLY_FREE_SPIN_MS = MONTHLY_FREE_SPIN_DAYS * 24 * 60 * 60 * 1000;

/** Bypass daily limit, credits, and timers — for wheel testing only. Set false before production. */
export const SPIN_TEST_MODE = false;
