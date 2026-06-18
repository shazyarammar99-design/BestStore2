import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import CategorySidebar from '@/components/store/CategorySidebar';
import ProductGrid from '@/components/store/ProductGrid';
import BrandMark from '@/components/store/BrandMark';
import {
  getCategories,
  getCategoryBySlug,
  getProductsByCategoryId,
} from '@/lib/catalog';
import { getLocaleFromCookies } from '@/lib/locale-server';
import { localizeCategory } from '@/i18n/catalog';
import { t } from '@/i18n/ui';

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category_slug: string }>;
}) {
  const { category_slug } = await params;

  const category = await getCategoryBySlug(category_slug);
  if (!category) notFound();

  const locale = await getLocaleFromCookies();
  const localized = localizeCategory(category, locale);

  const [categories, products] = await Promise.all([
    getCategories(),
    getProductsByCategoryId(category.id),
  ]);

  return (
    <main className="px-6 pb-24 pt-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 border-b border-best-border pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <nav className="font-heading flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-best-caption">
              <Link href="/" className="hover:text-best-cyan">
                {t(locale, 'common.home')}
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-best-cyan">{localized.name}</span>
            </nav>
            <h1 className="font-display mt-4 text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
              {localized.name}
            </h1>
            {localized.description && (
              <p className="mt-3 max-w-xl text-best-muted">{localized.description}</p>
            )}
          </div>
          <BrandMark size="md" className="self-start md:self-auto" />
        </div>

        <div className="mt-10 lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
          <CategorySidebar categories={categories} activeSlug={category.slug} />
          <div className="mt-6 lg:mt-0">
            <ProductGrid products={products} />
          </div>
        </div>
      </div>
    </main>
  );
}
