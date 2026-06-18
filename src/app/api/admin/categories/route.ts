import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { uniqueSlug } from '@/lib/admin/catalog-utils';
import { requireAdmin } from '@/lib/admin/require-admin';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.ctx.admin
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const categories = data ?? [];
  const withCounts = await Promise.all(
    categories.map(async (cat) => {
      const { count } = await auth.ctx.admin
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', cat.id);
      return { ...cat, product_count: count ?? 0 };
    })
  );

  return NextResponse.json({ categories: withCounts });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const name = String(body.name ?? '').trim();
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const slug = body.slug?.trim()
    ? await uniqueSlug(auth.ctx.admin, 'categories', body.slug)
    : await uniqueSlug(auth.ctx.admin, 'categories', name);

  const { data: maxRow } = await auth.ctx.admin
    .from('categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const sort_order = typeof body.sort_order === 'number' ? body.sort_order : (maxRow?.sort_order ?? 0) + 1;

  const { data, error } = await auth.ctx.admin
    .from('categories')
    .insert({
      name,
      slug,
      description: body.description ?? null,
      tag: body.tag ?? null,
      icon_url: body.icon_url ?? null,
      sort_order,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath('/');
  revalidatePath(`/category/${slug}`);
  return NextResponse.json({ category: data });
}
