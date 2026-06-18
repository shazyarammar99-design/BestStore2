export type PrizeRow = {
  id: string;
  probability_weight: number;
};

/** Weighted random selection — server-side only. */
export function pickWeightedPrize<T extends PrizeRow>(prizes: T[]): T {
  if (prizes.length === 0) {
    throw new Error('No prizes available.');
  }
  const total = prizes.reduce((sum, p) => sum + p.probability_weight, 0);
  let roll = Math.random() * total;
  for (const prize of prizes) {
    roll -= prize.probability_weight;
    if (roll <= 0) return prize;
  }
  return prizes[prizes.length - 1];
}

export function prizeSegmentIndex(prizeId: string, orderedPrizeIds: string[]): number {
  const idx = orderedPrizeIds.indexOf(prizeId);
  return idx >= 0 ? idx : 0;
}
