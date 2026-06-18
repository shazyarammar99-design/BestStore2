import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/require-admin';
import { DEFAULT_SPIN_SETTINGS } from '@/types/site-settings';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.ctx.admin
    .from('site_settings')
    .select('value')
    .eq('key', 'spin')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const settings = { ...DEFAULT_SPIN_SETTINGS, ...(data?.value as object) };
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const extraTurns = Number(body.extraTurns);
  const spinDurationMs = Number(body.spinDurationMs);
  const minPurchaseIqd = Number(body.minPurchaseIqd);

  if (!Number.isFinite(extraTurns) || extraTurns < 1 || extraTurns > 20) {
    return NextResponse.json({ error: 'extraTurns must be between 1 and 20' }, { status: 400 });
  }
  if (!Number.isFinite(spinDurationMs) || spinDurationMs < 1000 || spinDurationMs > 15000) {
    return NextResponse.json({ error: 'spinDurationMs must be between 1000 and 15000' }, { status: 400 });
  }
  if (!Number.isFinite(minPurchaseIqd) || minPurchaseIqd < 0) {
    return NextResponse.json({ error: 'minPurchaseIqd must be a positive number' }, { status: 400 });
  }

  const value = { extraTurns, spinDurationMs, minPurchaseIqd };

  const { data, error } = await auth.ctx.admin
    .from('site_settings')
    .upsert({ key: 'spin', value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .select('value')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath('/spin');
  return NextResponse.json({ settings: data.value });
}
