import { useState } from 'react';
import { CATEGORIES, PRODUCTS, getCategoryById, getProductDisplayPrice, type Product } from '@/data';
import SectionHeader from '@/components/SectionHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type FilterId = 'all' | string;

function ProductCard({ product }: { product: Product }) {
  const category = getCategoryById(product.categoryId);

  return (
    <Card className="flex flex-col border-best-border bg-best-elevated transition-all duration-300 hover:-translate-y-1 hover:border-best-cyan/60 hover:shadow-cyan-glow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="font-heading text-lg font-bold text-white">{product.name}</CardTitle>
          {category && (
            <Badge variant="outline" className="shrink-0 border-best-purple/40 text-best-purple">
              {category.tag}
            </Badge>
          )}
        </div>
        <p className="font-heading text-xs uppercase tracking-wider text-best-caption">
          {category?.name}
        </p>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm leading-relaxed text-best-muted">{product.description}</p>
        <p className="font-heading mt-3 text-xs font-semibold uppercase tracking-wider text-best-caption">
          {product.duration}
          {product.variants && product.variants.length > 1 && ' · multiple plans'}
        </p>
        {product.variants && product.variants.length > 1 && (
          <ul className="mt-2 space-y-1">
            {product.variants.map((variant) => (
              <li key={variant.id} className="flex justify-between text-xs text-best-muted">
                <span>{variant.duration}</span>
                <span className="font-medium text-white">{variant.price.toLocaleString()} IQD</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="border-t border-best-border pt-4">
        <div className="flex w-full items-center justify-between">
          <span className="font-display text-lg font-bold tracking-tight text-best-gold">
            {getProductDisplayPrice(product)}
          </span>
          <button className="rounded-lg bg-best-cyan/10 px-4 py-2 font-heading text-xs font-bold uppercase tracking-widest text-best-cyan transition-all duration-200 hover:bg-best-cyan hover:text-best-bg hover:shadow-cyan-glow">
            Order
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function ProductList() {
  const [filter, setFilter] = useState<FilterId>('all');

  const filtered =
    filter === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.categoryId === filter);

  const filters: { id: FilterId; label: string }[] = [
    { id: 'all', label: 'All' },
    ...CATEGORIES.map((c) => ({ id: c.id, label: c.name })),
  ];

  return (
    <section id="products" className="bg-best-elevated/40 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="FULL CATALOG"
          headline="All Products"
          subtitle="Every product in the store — delivered instantly in IQD."
        />

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-4 py-2 font-heading text-sm font-semibold transition-all duration-200 ${
                filter === f.id
                  ? 'border-best-cyan bg-best-cyan/10 text-best-cyan shadow-cyan-glow'
                  : 'border-best-border text-best-muted hover:border-best-cyan/50 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-best-muted">No products in this category.</p>
        )}
      </div>
    </section>
  );
}
