import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  buildDurationVariants,
  buildSubscriptionVariants,
  revalidateCategoryById,
  uniqueSlug,
} from '@/lib/admin/catalog-utils';
import { requireAdmin } from '@/lib/admin/require-admin';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.ctx.admin
    .from('products')
    .select('id, name, slug, description, base_image, base_price, popularity, is_featured, category_id')
    .order('popularity', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const name = String(body.name ?? '').trim();
  const category_id = body.category_id;

  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
  if (!category_id) return NextResponse.json({ error: 'Category required' }, { status: 400 });

  const slug = body.slug?.trim()
    ? await uniqueSlug(auth.ctx.admin, 'products', body.slug)
    : await uniqueSlug(auth.ctx.admin, 'products', name);

  const base_price = Number(body.base_price ?? 0);
  const template = body.template as 'simple' | 'subscription' | 'duration' | undefined;

  const { data: maxPop } = await auth.ctx.admin
    .from('products')
    .select('popularity')
    .eq('category_id', category_id)
    .order('popularity', { ascending: false })
    .limit(1)
    .maybeSingle();

  const popularity = typeof body.popularity === 'number' ? body.popularity : (maxPop?.popularity ?? 0) + 1;

  const { data: product, error } = await auth.ctx.admin
    .from('products')
    .insert({
      category_id,
      name,
      slug,
      description: body.description ?? null,
      base_image: body.base_image ?? null,
      base_price,
      rating: 4.7,
      review_count: 0,
      popularity,
      is_featured: body.is_featured ?? false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let variants = Array.isArray(body.variants) ? body.variants : [];
  if (!variants.length && template === 'subscription') {
    variants = buildSubscriptionVariants(base_price);
  } else if (!variants.length && template === 'duration') {
    variants = buildDurationVariants(base_price);
  }

  if (variants.length) {
    await auth.ctx.admin.from('product_variants').insert(
      variants.map((v: { plan_type?: string | null; duration?: string | null; price: number; stock?: number }) => ({
        product_id: product.id,
        plan_type: v.plan_type ?? null,
        duration: v.duration ?? null,
        price: Number(v.price),
        stock: v.stock ?? 999,
      }))
    );

    const minPrice = Math.min(...variants.map((v: { price: number }) => Number(v.price)));
    await auth.ctx.admin.from('products').update({ base_price: minPrice }).eq('id', product.id);
    product.base_price = minPrice;
  }

  await revalidateCategoryById(auth.ctx.admin, category_id);
  revalidatePath('/');
  revalidatePath(`/product/${slug}`);

  return NextResponse.json({ product });
}
