import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/require-admin';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { data: categories, error: catError } = await auth.ctx.admin
    .from('categories')
    .select('id, name, slug, description, tag, icon_url, sort_order')
    .order('sort_order', { ascending: true });

  if (catError) return NextResponse.json({ error: catError.message }, { status: 500 });

  const { data: products, error: prodError } = await auth.ctx.admin
    .from('products')
    .select(
      'id, category_id, name, slug, description, base_image, base_price, popularity, is_featured, rating, review_count'
    )
    .order('popularity', { ascending: false });

  if (prodError) return NextResponse.json({ error: prodError.message }, { status: 500 });

  const byCategory = new Map<string, typeof products>();
  for (const p of products ?? []) {
    const list = byCategory.get(p.category_id) ?? [];
    list.push(p);
    byCategory.set(p.category_id, list);
  }

  const catalog = (categories ?? []).map((c) => ({
    ...c,
    products: byCategory.get(c.id) ?? [],
  }));

  return NextResponse.json({ catalog });
}
