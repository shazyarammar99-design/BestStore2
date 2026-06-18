import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export async function uniqueSlug(
  admin: SupabaseClient,
  table: 'products' | 'categories',
  base: string
): Promise<string> {
  let slug = slugify(base) || 'item';
  let attempt = 0;

  while (attempt < 100) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt}`;
    const { data } = await admin.from(table).select('id').eq('slug', candidate).maybeSingle();
    if (!data) return candidate;
    attempt += 1;
  }

  return `${slug}-${Date.now()}`;
}

export async function revalidateCategoryById(
  admin: SupabaseClient,
  categoryId: string | null | undefined
) {
  if (!categoryId) return;
  const { data } = await admin.from('categories').select('slug').eq('id', categoryId).maybeSingle();
  if (data?.slug) revalidatePath(`/category/${data.slug}`);
}

export function buildSubscriptionVariants(basePrice: number) {
  const plans = ['Subscription', 'Account'] as const;
  const durations = ['3 Months', '6 Months', '1 Year'] as const;
  const offsets: Record<string, number> = {
    '3 Months': 0,
    '6 Months': 2000,
    '1 Year': 5000,
  };
  const accountExtra = 3000;

  return plans.flatMap((plan) =>
    durations.map((duration) => ({
      plan_type: plan,
      duration,
      price: basePrice + offsets[duration] + (plan === 'Account' ? accountExtra : 0),
      stock: 999,
    }))
  );
}

export function buildDurationVariants(basePrice: number) {
  const tiers = [
    { duration: '1 Day', offset: 0 },
    { duration: '1 Week', offset: 4000 },
    { duration: '1 Month', offset: 10000 },
    { duration: 'Lifetime', offset: 50000 },
  ];
  return tiers.map((t) => ({
    plan_type: null,
    duration: t.duration,
    price: basePrice + t.offset,
    stock: 999,
  }));
}
