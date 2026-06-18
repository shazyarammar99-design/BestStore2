import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/require-admin';
import type { OrderWithProfile } from '@/types/orders';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = auth.ctx.admin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (status) query = query.eq('status', status);

  const { data: orders, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const userIds = [...new Set((orders ?? []).map((o) => o.user_id))];
  const { data: profiles } = userIds.length
    ? await auth.ctx.admin.from('profiles').select('id, username').in('id', userIds)
    : { data: [] };

  const emailMap = new Map<string, string>();
  for (const uid of userIds) {
    const { data: authUser } = await auth.ctx.admin.auth.admin.getUserById(uid);
    if (authUser?.user?.email) emailMap.set(uid, authUser.user.email);
  }

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.username]));

  const enriched: OrderWithProfile[] = (orders ?? []).map((o) => ({
    ...o,
    username: profileMap.get(o.user_id) ?? 'Customer',
    user_email: emailMap.get(o.user_id),
  }));

  const pendingCount = enriched.filter((o) => o.status === 'pending').length;

  return NextResponse.json({ orders: enriched, pendingCount });
}
