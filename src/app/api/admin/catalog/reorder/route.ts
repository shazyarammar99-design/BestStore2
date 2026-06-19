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

  // Fetch 'before' categories for moved products concurrently to know what to revalidate
  if (productMoves.length > 0) {
    const fetchBeforePromises = productMoves.map(async (move) => {
      if (!move.id || !move.category_id) return;
      const { data: before } = await auth.ctx.admin
        .from('products')
        .select('category_id')
        .eq('id', move.id)
        .maybeSingle();

      if (before?.category_id) touchedCategoryIds.add(before.category_id);
      touchedCategoryIds.add(move.category_id);
    });
    await Promise.all(fetchBeforePromises);
  }

  // Execute product updates concurrently
  if (productMoves.length > 0) {
    const updateProductPromises = productMoves.map(async (move) => {
      if (!move.id || !move.category_id) return;
      const { error } = await auth.ctx.admin
        .from('products')
        .update({
          category_id: move.category_id,
          popularity: move.popularity,
        })
        .eq('id', move.id);
      if (error) throw new Error(error.message);
    });
    
    try {
      await Promise.all(updateProductPromises);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // Execute category sorting updates concurrently
  if (categoryOrder.length > 0) {
    const updateCategoryPromises = categoryOrder.map(async (cat) => {
      if (!cat.id) return;
      const { error } = await auth.ctx.admin
        .from('categories')
        .update({ sort_order: cat.sort_order })
        .eq('id', cat.id);
      if (error) throw new Error(error.message);
    });
    
    try {
      await Promise.all(updateCategoryPromises);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // Revalidate concurrently
  const revalidatePromises = Array.from(touchedCategoryIds).map(id => 
    revalidateCategoryById(auth.ctx.admin, id)
  );
  await Promise.all(revalidatePromises);

  revalidatePath('/');
  return NextResponse.json({ ok: true });
}
