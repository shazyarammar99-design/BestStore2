import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import {
  CATEGORIES as STATIC_CATEGORIES,
  PRODUCTS as STATIC_PRODUCTS,
} from '@/data';
import { PREMIUM_SUBSCRIPTION_ORDER, PRODUCT_IMAGES } from '@/config/product-images';

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  description: string | null;
  tag: string | null;
  sort_order: number;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  plan_type: string | null;
  duration: string | null;
  price: number;
  compare_at_price?: number | null;
  stock: number;
};

export type Product = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  base_image: string | null;
  video_url: string | null;
  gallery_images: string[];
  base_price: number;
  compare_at_price?: number | null;
  rating: number;
  review_count: number;
  popularity: number;
  is_featured: boolean;
};

export type ProductWithVariants = Product & {
  variants: ProductVariant[];
  category: Category | null;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getCatalogClient() {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

async function applyMinVariantPrices(
  client: NonNullable<ReturnType<typeof getCatalogClient>>,
  products: Product[]
): Promise<Product[]> {
  if (!products.length) return products;

  const { data: variants } = await client
    .from('product_variants')
    .select('product_id, price')
    .in(
      'product_id',
      products.map((p) => p.id)
    );

  if (!variants?.length) return products;

  const minByProduct = new Map<string, number>();
  for (const row of variants) {
    const price = Number(row.price);
    const prev = minByProduct.get(row.product_id);
    if (prev === undefined || price < prev) minByProduct.set(row.product_id, price);
  }

  return products.map((p) => {
    const min = minByProduct.get(p.id);
    return min !== undefined ? { ...p, base_price: min } : p;
  });
}

function fallbackCategories(): Category[] {
  return STATIC_CATEGORIES.map((c, i) => ({
    id: c.id,
    name: c.name,
    slug: c.id,
    icon_url: null,
    description: c.description,
    tag: c.tag,
    sort_order: i + 1,
  }));
}

function fallbackProducts(): Product[] {
  return STATIC_PRODUCTS.map((p, i) => {
    const orderIdx = PREMIUM_SUBSCRIPTION_ORDER.indexOf(
      p.id as (typeof PREMIUM_SUBSCRIPTION_ORDER)[number]
    );
    return {
      id: p.id,
      category_id: p.categoryId,
      name: p.name,
      slug: p.id,
      description: p.description,
      base_image: PRODUCT_IMAGES[p.id] ?? null,
      video_url: null,
      gallery_images: [],
      base_price: p.variants?.length
        ? Math.min(...p.variants.map((v) => v.price))
        : p.price,
      rating: 4.5,
      review_count: 0,
      popularity: orderIdx >= 0 ? 108 - orderIdx : 50,
      is_featured: i < 6,
    };
  });
}

function fallbackVariants(productSlug: string): ProductVariant[] {
  const p = STATIC_PRODUCTS.find((x) => x.id === productSlug);
  if (!p?.variants?.length) return [];
  return p.variants.map((v) => ({
    id: v.id,
    product_id: p.id,
    plan_type: v.planType ?? null,
    duration: v.duration,
    price: v.price,
    stock: 999,
  }));
}

async function fetchCategories(): Promise<Category[]> {
  const client = getCatalogClient();
  if (!client) return fallbackCategories();

  const { data, error } = await client
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error || !data?.length) return fallbackCategories();
  return data as Category[];
}

async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const client = getCatalogClient();
  if (!client) return fallbackCategories().find((c) => c.slug === slug) ?? null;

  const { data, error } = await client
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) return fallbackCategories().find((c) => c.slug === slug) ?? null;
  return data as Category;
}

async function fetchProducts(): Promise<Product[]> {
  const client = getCatalogClient();
  if (!client) return fallbackProducts();

  const { data, error } = await client
    .from('products')
    .select('*')
    .order('popularity', { ascending: false });

  if (error || !data?.length) return fallbackProducts();
  return applyMinVariantPrices(client, data as Product[]);
}

async function fetchFeaturedProducts(): Promise<Product[]> {
  const client = getCatalogClient();
  if (!client) {
    const all = fallbackProducts();
    const featured = all.filter((p) => p.is_featured);
    return (featured.length ? featured : all).slice(0, 8);
  }

  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .order('popularity', { ascending: false })
    .limit(8);

  if (error || !data?.length) {
    const { data: top } = await client
      .from('products')
      .select('*')
      .order('popularity', { ascending: false })
      .limit(8);
    const list = (top as Product[]) ?? fallbackProducts().slice(0, 8);
    return applyMinVariantPrices(client, list);
  }

  return applyMinVariantPrices(client, data as Product[]);
}

export type BentoConfigItem = {
  productId: string;
  gridClasses: string;
};

async function fetchFeaturedBentoConfig(): Promise<BentoConfigItem[]> {
  const client = getCatalogClient();
  if (!client) return [];

  const { data, error } = await client
    .from('site_settings')
    .select('value')
    .eq('key', 'featured_bento')
    .maybeSingle();

  if (error || !data) return [];
  return (data.value as BentoConfigItem[]) || [];
}

async function fetchProductsByCategoryId(categoryId: string): Promise<Product[]> {
  const client = getCatalogClient();
  if (!client) {
    return fallbackProducts().filter((p) => p.category_id === categoryId);
  }

  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .order('popularity', { ascending: false });

  if (error || !data) return [];
  return applyMinVariantPrices(client, data as Product[]);
}

async function fetchProductBySlug(slug: string): Promise<ProductWithVariants | null> {
  const client = getCatalogClient();

  if (!client) {
    const p = fallbackProducts().find((x) => x.slug === slug);
    if (!p) return null;
    const category = fallbackCategories().find((c) => c.id === p.category_id) ?? null;
    return { ...p, variants: fallbackVariants(slug), category };
  }

  const { data: product, error } = await client
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !product) {
    const p = fallbackProducts().find((x) => x.slug === slug);
    if (!p) return null;
    const category = fallbackCategories().find((c) => c.id === p.category_id) ?? null;
    return { ...p, variants: fallbackVariants(slug), category };
  }

  const [{ data: variants }, { data: category }] = await Promise.all([
    client
      .from('product_variants')
      .select('*')
      .eq('product_id', (product as Product).id)
      .order('price', { ascending: true }),
    client
      .from('categories')
      .select('*')
      .eq('id', (product as Product).category_id)
      .maybeSingle(),
  ]);

  return {
    ...(product as Product),
    variants: (variants as ProductVariant[]) ?? [],
    category: (category as Category) ?? null,
  };
}

async function fetchProductById(id: string): Promise<ProductWithVariants | null> {
  const client = getCatalogClient();

  if (!client) {
    const p = fallbackProducts().find((x) => x.id === id);
    if (!p) return null;
    const category = fallbackCategories().find((c) => c.id === p.category_id) ?? null;
    return { ...p, variants: fallbackVariants(p.slug), category };
  }

  const { data: product, error } = await client
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !product) {
    const p = fallbackProducts().find((x) => x.id === id);
    if (!p) return null;
    const category = fallbackCategories().find((c) => c.id === p.category_id) ?? null;
    return { ...p, variants: fallbackVariants(p.slug), category };
  }

  const [{ data: variants }, { data: category }] = await Promise.all([
    client
      .from('product_variants')
      .select('*')
      .eq('product_id', (product as Product).id)
      .order('price', { ascending: true }),
    client
      .from('categories')
      .select('*')
      .eq('id', (product as Product).category_id)
      .maybeSingle(),
  ]);

  return {
    ...(product as Product),
    variants: (variants as ProductVariant[]) ?? [],
    category: (category as Category) ?? null,
  };
}

const cachedCategories = unstable_cache(fetchCategories, ['catalog-categories'], {
  revalidate: 60,
});

export const getCategories = cache(async () => cachedCategories());

export const getCategoryBySlug = cache(async (slug: string) =>
  unstable_cache(() => fetchCategoryBySlug(slug), ['catalog-category', slug], {
    revalidate: 60,
  })()
);

export const getProducts = cache(async () =>
  unstable_cache(fetchProducts, ['catalog-products'], { revalidate: 60 })()
);

export const getFeaturedProducts = cache(async () =>
  unstable_cache(fetchFeaturedProducts, ['catalog-featured'], { revalidate: 60 })()
);

export const getFeaturedBentoConfig = cache(async () =>
  unstable_cache(fetchFeaturedBentoConfig, ['catalog-featured-bento-config'], { revalidate: 60 })()
);

export const getProductsByCategoryId = cache(async (categoryId: string) =>
  unstable_cache(() => fetchProductsByCategoryId(categoryId), ['catalog-products-by-cat', categoryId], {
    revalidate: 60,
  })()
);

/** @deprecated Use getProductsByCategoryId when category is already loaded */
export async function getProductsByCategorySlug(slug: string): Promise<Product[]> {
  const category = await getCategoryBySlug(slug);
  if (!category) return [];
  return getProductsByCategoryId(category.id);
}

export const getProductBySlug = cache(async (slug: string) =>
  unstable_cache(() => fetchProductBySlug(slug), ['catalog-product', slug], {
    revalidate: 60,
  })()
);

export const getProductById = cache(async (id: string) =>
  unstable_cache(() => fetchProductById(id), ['catalog-product-id', id], {
    revalidate: 60,
  })()
);

export { formatPrice } from '@/lib/format-currency';
