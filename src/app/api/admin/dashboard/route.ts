import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/require-admin';
import { getSiteStats } from '@/lib/site-stats';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const [stats, categoriesRes, productsRes, ordersRes, pendingRes] = await Promise.all([
    getSiteStats(),
    auth.ctx.admin.from('categories').select('id', { count: 'exact', head: true }),
    auth.ctx.admin.from('products').select('id', { count: 'exact', head: true }),
    auth.ctx.admin
      .from('orders')
      .select('id, status, amount, items_json, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(5),
    auth.ctx.admin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ]);

  const userIds = [...new Set((ordersRes.data ?? []).map((o) => o.user_id))];
  const { data: profiles } = userIds.length
    ? await auth.ctx.admin.from('profiles').select('id, username').in('id', userIds)
    : { data: [] };
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.username]));

  const recentOrders = (ordersRes.data ?? []).map((o) => ({
    id: o.id,
    status: o.status,
    amount: o.amount,
    created_at: o.created_at,
    username: profileMap.get(o.user_id) ?? 'Customer',
    items_json: o.items_json,
  }));

  return NextResponse.json({
    activeUsers: stats.activeUsers,
    gamesSupported: stats.gamesSupported,
    reviewCount: stats.reviewCount,
    categoryCount: categoriesRes.count ?? 0,
    productCount: productsRes.count ?? 0,
    pendingOrders: pendingRes.count ?? 0,
    recentOrders,
  });
}
