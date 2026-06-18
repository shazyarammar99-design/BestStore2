/**
 * Spin wheel prize odds — edit weights here, then run:
 *   npm run db:seed-prizes
 *
 * Weights are relative (not literal %). Example: weight 50 of total 100 = 50% chance.
 */
export const SPIN_PRIZES = [
  { name: '10% Store Credit', probability_weight: 50, value: 10 },
  { name: '500 IQD Bonus', probability_weight: 25, value: 500 },
  { name: 'Free Delivery Token', probability_weight: 15, value: 1 },
  { name: '1000 IQD Bonus', probability_weight: 5, value: 1000 },
] as const;

/** Global odds schedule — update when you change weights via npm run db:seed-prizes */
export const SPIN_ODDS_META = {
  lastUpdated: '2026-06-15',
  nextReview: '2026-07-01',
} as const;

export function spinPrizeWinPercent(weight: number): string {
  const total = SPIN_PRIZES.reduce((sum, p) => sum + p.probability_weight, 0);
  return `${((weight / total) * 100).toFixed(1)}%`;
}
