import { PRODUCT_IMAGES } from '@/config/product-images';
import type { Product } from '@/lib/catalog';

export function getProductImageUrl(
  product: Pick<Product, 'slug' | 'base_image'>
): string | null {
  if (product.base_image?.trim()) return product.base_image.trim();
  return PRODUCT_IMAGES[product.slug] ?? null;
}
