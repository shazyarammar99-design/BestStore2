export type CatalogProduct = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  base_image: string | null;
  base_price: number;
  compare_at_price?: number | null;
  popularity: number;
  is_featured: boolean;
};

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tag: string | null;
  icon_url: string | null;
  sort_order: number;
  products: CatalogProduct[];
};

export function assignPopularity(products: CatalogProduct[]): CatalogProduct[] {
  const len = products.length;
  return products.map((p, i) => ({
    ...p,
    popularity: len - i,
  }));
}

export function findProductCategory(
  catalog: CatalogCategory[],
  productId: string
): { categoryIndex: number; productIndex: number } | null {
  for (let ci = 0; ci < catalog.length; ci++) {
    const pi = catalog[ci].products.findIndex((p) => p.id === productId);
    if (pi >= 0) return { categoryIndex: ci, productIndex: pi };
  }
  return null;
}
