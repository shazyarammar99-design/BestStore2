import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/require-admin';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await request.json();
  const updates: Record<string, unknown> = {};
  for (const key of ['section', 'locale', 'payload', 'sort_order', 'active'] as const) {
    if (key in body) updates[key] = body[key];
  }

  const { data, error } = await auth.ctx.admin
    .from('cms_blocks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath('/');
  return NextResponse.json({ block: data });
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const { error } = await auth.ctx.admin.from('cms_blocks').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath('/');
  return NextResponse.json({ ok: true });
}
