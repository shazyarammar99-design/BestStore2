import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/require-admin';
import { confirmOrder, updateOrderStatus } from '@/lib/orders/service';
import { adminOrderActionSchema } from '@/lib/validation/orders';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const parsed = adminOrderActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid action.' },
      { status: 400 }
    );
  }

  if (parsed.data.action === 'confirm') {
    const result = await confirmOrder(auth.ctx.admin, id, auth.ctx.user.id);
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true, status: 'confirmed' });
  }

  if (parsed.data.action === 'deliver') {
    const result = await updateOrderStatus(auth.ctx.admin, id, 'delivered');
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true, status: 'delivered' });
  }

  const result = await updateOrderStatus(auth.ctx.admin, id, 'cancelled');
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, status: 'cancelled' });
}
