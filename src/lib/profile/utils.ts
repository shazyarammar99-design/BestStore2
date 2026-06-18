/** Stable 10-digit display ID from a UUID (cosmetic, not secret). */
export function accountIdFromUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  const base = 1_000_000_000 + (hash % 9_000_000_000);
  return String(base);
}

export function levelFromMonthlyPoints(monthlyPoints: number): number {
  return Math.min(99, Math.floor(monthlyPoints / 50) + 1);
}

function monthStartUtc(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export { monthStartUtc };
