'use client';

import SectionHeader from '@/components/SectionHeader';
import CategoryShowcase from '@/components/store/CategoryShowcase';
import ProductGrid from '@/components/store/ProductGrid';
import { type Category, type Product } from '@/lib/catalog';
import { useTranslation } from '@/context/LocaleContext';

export function HomeCategoriesSection({ categories }: { categories: Category[] }) {
  const { t } = useTranslation();
  return (
    <section id="categories" className="bg-best-elevated/40 py-16 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow={t('sections.categories').toUpperCase()}
          headline={t('sections.shopByCategory')}
          subtitle={t('sections.shopByCategorySubtitle')}
        />
        <div className="mt-14">
          <CategoryShowcase categories={categories} />
        </div>
      </div>
    </section>
  );
}

export function HomeProductsSection({ products }: { products: Product[] }) {
  const { t } = useTranslation();
  return (
    <section id="products" className="py-16 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow={t('sections.featured').toUpperCase()}
          headline={t('sections.featuredServices')}
          subtitle={t('sections.featuredServicesSubtitle')}
        />
        <div className="mt-14">
          <ProductGrid products={products} />
        </div>
      </div>
    </section>
  );
}
