import type { RecordPurchaseRequest } from '@/lib/validation/purchases';
import { authFetch } from '@/lib/auth-fetch';

export type RecordPurchaseResult =
  | {
      ok: true;
      pointsEarned: number;
      spinCreditGranted: boolean;
      spinCreditsTotal: number;
    }
  | { ok: false; error: string };

export async function recordLeaderboardPurchase(
  items: RecordPurchaseRequest['items']
): Promise<RecordPurchaseResult> {
  try {
    const res = await authFetch('/api/purchases/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error ?? 'Failed to record purchase.' };
    }
    return {
      ok: true,
      pointsEarned: data.pointsEarned ?? 0,
      spinCreditGranted: Boolean(data.spinCreditGranted),
      spinCreditsTotal: data.spinCreditsTotal ?? 0,
    };
  } catch {
    return { ok: false, error: 'Network error recording purchase.' };
  }
}
