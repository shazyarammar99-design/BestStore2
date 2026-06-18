import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';
import { revalidateCategoryById, uniqueSlug } from '@/lib/admin/catalog-utils';
import { requireAdmin } from '@/lib/admin/require-admin';

type Params = { params: Promise<{ slug: string }> };

async function syncMinPrice(admin: SupabaseClient, productId: string) {
  const { data: variantRows } = await admin
    .from('product_variants')
    .select('price')
    .eq('product_id', productId);

  if (variantRows?.length) {
    const minPrice = Math.min(...variantRows.map((r) => Number(r.price)));
    await admin.from('products').update({ base_price: minPrice }).eq('id', productId);
  }
}

export async function GET(request: Request, { params }: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { slug } = await params;
  const { data: product, error } = await auth.ctx.admin
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: variants } = await auth.ctx.admin
    .from('product_variants')
    .select('*')
    .eq('product_id', product.id)
    .order('price', { ascending: true });

  return NextResponse.json({ product, variants: variants ?? [] });
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { slug } = await params;
  const body = await request.json();

  const { data: existing } = await auth.ctx.admin
    .from('products')
    .select('id, category_id, slug')
    .eq('slug', slug)
    .maybeSingle();

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const oldCategoryId = existing.category_id;
  const productUpdates: Record<string, unknown> = {};

  for (const key of [
    'name',
    'description',
    'base_image',
    'base_price',
    'popularity',
    'is_featured',
    'category_id',
  ] as const) {
    if (key in body) productUpdates[key] = body[key];
  }

  if (typeof body.slug === 'string' && body.slug.trim() && body.slug !== slug) {
    productUpdates.slug = await uniqueSlug(auth.ctx.admin, 'products', body.slug);
  }

  if (Object.keys(productUpdates).length) {
    const { error } = await auth.ctx.admin
      .from('products')
      .update(productUpdates)
      .eq('id', existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const newSlug = (productUpdates.slug as string) ?? slug;

  if (Array.isArray(body.variants)) {
    for (const v of body.variants) {
      if (v._delete && v.id) {
        await auth.ctx.admin.from('product_variants').delete().eq('id', v.id);
        continue;
      }

      if (!v.id && (v.price !== undefined || v.duration !== undefined || v.plan_type !== undefined)) {
        await auth.ctx.admin.from('product_variants').insert({
          product_id: existing.id,
          plan_type: v.plan_type ?? null,
          duration: v.duration ?? null,
          price: Number(v.price ?? 0),
          stock: Number(v.stock ?? 999),
        });
        continue;
      }

      if (!v.id) continue;
      const vUpdates: Record<string, unknown> = {};
      for (const key of ['plan_type', 'duration', 'price', 'stock'] as const) {
        if (key in v) vUpdates[key] = v[key];
      }
      if (Object.keys(vUpdates).length) {
        await auth.ctx.admin.from('product_variants').update(vUpdates).eq('id', v.id);
      }
    }

    await syncMinPrice(auth.ctx.admin, existing.id);
  }

  const newCategoryId = (productUpdates.category_id as string) ?? oldCategoryId;
  await revalidateCategoryById(auth.ctx.admin, oldCategoryId);
  if (newCategoryId !== oldCategoryId) {
    await revalidateCategoryById(auth.ctx.admin, newCategoryId);
  }

  revalidatePath('/');
  revalidatePath(`/product/${slug}`);
  if (newSlug !== slug) revalidatePath(`/product/${newSlug}`);

  return NextResponse.json({ ok: true, slug: newSlug });
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { slug } = await params;
  const { data: product } = await auth.ctx.admin
    .from('products')
    .select('id, category_id')
    .eq('slug', slug)
    .maybeSingle();

  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await auth.ctx.admin.from('product_variants').delete().eq('product_id', product.id);
  const { error } = await auth.ctx.admin.from('products').delete().eq('id', product.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await revalidateCategoryById(auth.ctx.admin, product.category_id);
  revalidatePath('/');
  revalidatePath(`/product/${slug}`);

  return NextResponse.json({ ok: true });
}
