import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { uniqueSlug } from '@/lib/admin/catalog-utils';
import { requireAdmin } from '@/lib/admin/require-admin';

type Params = { params: Promise<{ slug: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { slug } = await params;
  const body = await request.json();

  const { data: existing } = await auth.ctx.admin
    .from('categories')
    .select('id, slug')
    .eq('slug', slug)
    .maybeSingle();

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updates: Record<string, unknown> = {};
  for (const key of [
    'name',
    'description',
    'tag',
    'icon_url',
    'sort_order',
    'name_translations',
    'description_translations',
  ] as const) {
    if (key in body) updates[key] = body[key];
  }

  if (typeof body.slug === 'string' && body.slug.trim() && body.slug !== slug) {
    updates.slug = await uniqueSlug(auth.ctx.admin, 'categories', body.slug);
  }

  const { data, error } = await auth.ctx.admin
    .from('categories')
    .update(updates)
    .eq('id', existing.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const newSlug = (updates.slug as string) ?? slug;
  revalidatePath('/');
  revalidatePath(`/category/${slug}`);
  if (newSlug !== slug) revalidatePath(`/category/${newSlug}`);

  return NextResponse.json({ category: data });
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { slug } = await params;

  const { data: category } = await auth.ctx.admin
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { count, error: countError } = await auth.ctx.admin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', category.id);

  if (countError) return NextResponse.json({ error: countError.message }, { status: 500 });

  if (count && count > 0) {
    return NextResponse.json(
      {
        error: `This category has ${count} product(s). Move or delete them on the Catalog board first.`,
      },
      { status: 400 }
    );
  }

  const { error } = await auth.ctx.admin.from('categories').delete().eq('id', category.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath('/');
  revalidatePath(`/category/${slug}`);

  return NextResponse.json({ ok: true });
}
