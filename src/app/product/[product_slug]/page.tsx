import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import ProductDetail from '@/components/store/ProductDetail';
import BrandMark from '@/components/store/BrandMark';
import { getProductBySlug } from '@/lib/catalog';
import { getLocaleFromCookies } from '@/lib/locale-server';
import { localizeCategory, localizeProduct } from '@/i18n/catalog';
import { t } from '@/i18n/ui';

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ product_slug: string }>;
}) {
  const { product_slug } = await params;
  const [product, locale] = await Promise.all([
    getProductBySlug(product_slug),
    getLocaleFromCookies(),
  ]);

  if (!product) notFound();

  const localized = localizeProduct(product, locale);
  const localizedCategory = product.category
    ? localizeCategory(product.category, locale)
    : null;

  return (
    <main className="px-6 pb-24 pt-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between border-b border-best-border pb-8">
          <nav className="font-heading flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-best-caption">
            <Link href="/" className="hover:text-best-cyan">
              {t(locale, 'common.home')}
            </Link>
            <ChevronRight className="h-3 w-3" />
            {localizedCategory && (
              <>
                <Link href={`/category/${localizedCategory.slug}`} className="hover:text-best-cyan">
                  {localizedCategory.name}
                </Link>
                <ChevronRight className="h-3 w-3" />
              </>
            )}
            <span className="text-best-cyan">{localized.name}</span>
          </nav>
          <BrandMark size="sm" className="hidden md:inline-block" />
        </div>

        <div className="mt-10">
          <ProductDetail product={product} />
        </div>
      </div>
    </main>
  );
}
