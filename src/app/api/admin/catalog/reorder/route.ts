import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/require-admin';
import { revalidateCategoryById } from '@/lib/admin/catalog-utils';

type ProductMove = { id: string; category_id: string; popularity: number };
type CategoryOrder = { id: string; sort_order: number };

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const productMoves = (body.productMoves ?? []) as ProductMove[];
  const categoryOrder = (body.categoryOrder ?? []) as CategoryOrder[];

  const touchedCategoryIds = new Set<string>();

  for (const move of productMoves) {
    if (!move.id || !move.category_id) continue;

    const { data: before } = await auth.ctx.admin
      .from('products')
      .select('category_id')
      .eq('id', move.id)
      .maybeSingle();

    if (before?.category_id) touchedCategoryIds.add(before.category_id);
    touchedCategoryIds.add(move.category_id);

    const { error } = await auth.ctx.admin
      .from('products')
      .update({
        category_id: move.category_id,
        popularity: move.popularity,
      })
      .eq('id', move.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  for (const cat of categoryOrder) {
    if (!cat.id) continue;
    const { error } = await auth.ctx.admin
      .from('categories')
      .update({ sort_order: cat.sort_order })
      .eq('id', cat.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  for (const id of touchedCategoryIds) {
    await revalidateCategoryById(auth.ctx.admin, id);
  }

  revalidatePath('/');
  return NextResponse.json({ ok: true });
}
