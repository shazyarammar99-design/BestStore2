import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/require-admin';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.ctx.admin
    .from('prizes')
    .select('id, name, probability_weight, image_url, value, active, created_at')
    .order('probability_weight', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];
  const totalWeight = rows.reduce((sum, p) => sum + p.probability_weight, 0);

  const prizes = rows.map((p) => ({
    ...p,
    value: Number(p.value),
    winPercent:
      totalWeight > 0
        ? Math.round((p.probability_weight / totalWeight) * 1000) / 10
        : 0,
  }));

  return NextResponse.json({ prizes });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const name = String(body.name ?? '').trim();
  const probability_weight = Number(body.probability_weight);
  const value = Number(body.value ?? 0);
  const image_url = body.image_url ? String(body.image_url) : null;
  const active = body.active !== false;

  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  if (!Number.isFinite(probability_weight) || probability_weight <= 0) {
    return NextResponse.json({ error: 'Weight must be greater than 0' }, { status: 400 });
  }

  const { data, error } = await auth.ctx.admin
    .from('prizes')
    .insert({ name, probability_weight, value, image_url, active })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath('/spin');
  return NextResponse.json({ prize: data });
}
