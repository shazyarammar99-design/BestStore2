import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin/require-admin';
import { resolvePurchaseTotals } from '@/lib/purchases/resolve';
import { grantSpinCreditForPurchase } from '@/lib/spin/credits';
import { recordPurchaseSchema } from '@/lib/validation/purchases';

const adminRecordSchema = recordPurchaseSchema.extend({
  userId: z.string().uuid(),
});

/** Admin-only: internal purchase recording. */
export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = adminRecordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid request.' },
      { status: 400 }
    );
  }

  const resolved = await resolvePurchaseTotals(parsed.data.items);
  if ('error' in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: 400 });
  }

  const { data: authUser } = await auth.ctx.admin.auth.admin.getUserById(parsed.data.userId);

  const { data: purchase, error } = await auth.ctx.admin
    .from('purchases')
    .insert({
      user_id: parsed.data.userId,
      amount: resolved.amount,
      points_earned: resolved.pointsEarned,
      spin_credit_granted: false,
    })
    .select('id')
    .single();

  if (error || !purchase) {
    return NextResponse.json({ error: 'Failed to record purchase.' }, { status: 500 });
  }

  const creditResult = await grantSpinCreditForPurchase(
    auth.ctx.admin,
    parsed.data.userId,
    authUser?.user?.email,
    purchase.id,
    resolved.amount
  );

  if ('error' in creditResult) {
    return NextResponse.json({ error: creditResult.error }, { status: 500 });
  }

  return NextResponse.json({
    purchaseId: purchase.id,
    amount: resolved.amount,
    pointsEarned: resolved.pointsEarned,
    spinCreditGranted: creditResult.spinCreditGranted,
  });
}
