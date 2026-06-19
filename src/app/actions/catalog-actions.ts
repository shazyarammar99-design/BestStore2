'use server';

import { getCategories, getProducts } from '@/lib/catalog';
import type { Category, Product } from '@/lib/catalog';

export type SearchableItem = {
  type: 'category' | 'product';
  id: string;
  name: string;
  slug: string;
  description: string | null;
  name_translations?: Record<string, string> | null;
  description_translations?: Record<string, string> | null;
  // Category specific
  icon_url?: string | null;
  // Product specific
  base_image?: string | null;
  base_price?: number;
  category_id?: string;
};

export async function getSearchableCatalog(): Promise<SearchableItem[]> {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  const items: SearchableItem[] = [];

  for (const c of categories) {
    items.push({
      type: 'category',
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      name_translations: c.name_translations,
      description_translations: c.description_translations,
      icon_url: c.icon_url,
    });
  }

  for (const p of products) {
    items.push({
      type: 'product',
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      name_translations: p.name_translations,
      description_translations: p.description_translations,
      base_image: p.base_image,
      base_price: p.base_price,
      category_id: p.category_id,
    });
  }

  return items;
}
