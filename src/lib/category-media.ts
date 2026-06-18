import { CATEGORY_IMAGES } from '@/config/category-images';
import type { Category } from '@/lib/catalog';

export function getCategoryImageUrl(category: Pick<Category, 'slug' | 'id' | 'icon_url'>): string | null {
  if (category.icon_url?.trim()) return category.icon_url.trim();
  const key = category.slug || category.id;
  return CATEGORY_IMAGES[key] ?? null;
}
