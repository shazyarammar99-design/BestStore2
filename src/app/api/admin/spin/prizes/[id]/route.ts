import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/require-admin';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
    updates.name = name;
  }
  if (body.probability_weight !== undefined) {
    const weight = Number(body.probability_weight);
    if (!Number.isFinite(weight) || weight <= 0) {
      return NextResponse.json({ error: 'Weight must be greater than 0' }, { status: 400 });
    }
    updates.probability_weight = weight;
  }
  if (body.value !== undefined) updates.value = Number(body.value);
  if (body.image_url !== undefined) updates.image_url = body.image_url || null;
  if (body.active !== undefined) updates.active = Boolean(body.active);

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { data, error } = await auth.ctx.admin
    .from('prizes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath('/spin');
  return NextResponse.json({ prize: data });
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  const { data, error } = await auth.ctx.admin
    .from('prizes')
    .update({ active: false })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath('/spin');
  return NextResponse.json({ prize: data });
}
