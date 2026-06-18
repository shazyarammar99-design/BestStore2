'use client';

import { type Category } from '@/lib/catalog';
import CategoryCard from '@/components/store/CategoryCard';

export default function CategoryShowcase({ categories }: { categories: Category[] }) {
  const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);
  const showcase = sorted.slice(0, 5);
  const topRow = showcase.slice(0, 3);
  const bottomRow = showcase.slice(3, 5);

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {topRow.map((category) => (
          <CategoryCard key={category.id} category={category} variant="vertical" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {bottomRow.map((category) => (
          <CategoryCard key={category.id} category={category} variant="horizontal" />
        ))}
      </div>
    </div>
  );
}
