'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import { FolderPlus, PackagePlus, Search } from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';
import {
  assignPopularity,
  findProductCategory,
  type CatalogCategory,
  type CatalogProduct,
} from '@/types/admin-catalog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ImageUploadField from '@/components/admin/ImageUploadField';
import CategoryColumn from './CategoryColumn';
import ProductCard from './ProductCard';
import { useIsMobile } from '@/hooks/useIsMobile';

function cloneCatalog(catalog: CatalogCategory[]): CatalogCategory[] {
  return catalog.map((c) => ({ ...c, products: [...c.products] }));
}

export default function CatalogBoard() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<CatalogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeProduct, setActiveProduct] = useState<CatalogProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const dragStartCatalog = useRef<CatalogCategory[]>([]);
  const isMobile = useIsMobile();

  const [catOpen, setCatOpen] = useState(false);
  const [prodOpen, setProdOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', description: '', tag: '', icon_url: '' });
  const [newProd, setNewProd] = useState({
    name: '',
    slug: '',
    category_id: '',
    description: '',
    base_image: '',
    base_price: 12000,
    template: 'simple' as 'simple' | 'subscription' | 'duration',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch('/api/admin/catalog');
    const json = await res.json();
    if (res.ok) setCatalog(json.catalog ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.map((c) => ({
      ...c,
      products: c.products.filter(
        (p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
      ),
    }));
  }, [catalog, search]);

  const persistMoves = async (next: CatalogCategory[], prev: CatalogCategory[]) => {
    const moves: { id: string; category_id: string; popularity: number }[] = [];

    for (const cat of next) {
      for (const p of cat.products) {
        const before = prev.flatMap((c) => c.products).find((x) => x.id === p.id);
        if (
          !before ||
          before.category_id !== p.category_id ||
          before.popularity !== p.popularity
        ) {
          moves.push({ id: p.id, category_id: p.category_id, popularity: p.popularity });
        }
      }
    }

    if (!moves.length) return;

    setSaving(true);
    const res = await adminFetch('/api/admin/catalog/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productMoves: moves }),
    });
    setSaving(false);

    if (!res.ok) {
      toast.error('Failed to save layout');
      setCatalog(prev);
      return;
    }
    toast.success('Catalog updated');
    setCatalog(next);
  };

  const handleDragStart = (event: DragStartEvent) => {
    dragStartCatalog.current = cloneCatalog(catalog);
    const product = event.active.data.current?.product as CatalogProduct | undefined;
    setActiveProduct(product ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    setCatalog((prev) => {
      const next = cloneCatalog(prev);
      const from = findProductCategory(next, activeId);
      if (!from) return prev;

      const overCategory = next.find((c) => c.id === overId);
      const overProduct = next.flatMap((c) => c.products).find((p) => p.id === overId);

      let toCategoryIndex = overCategory
        ? next.findIndex((c) => c.id === overId)
        : overProduct
          ? next.findIndex((c) => c.products.some((p) => p.id === overId))
          : -1;

      if (toCategoryIndex < 0) return prev;

      const fromCat = next[from.categoryIndex];
      const [moved] = fromCat.products.splice(from.productIndex, 1);
      moved.category_id = next[toCategoryIndex].id;

      const toCat = next[toCategoryIndex];
      let insertIndex = overProduct
        ? toCat.products.findIndex((p) => p.id === overId)
        : toCat.products.length;

      if (from.categoryIndex === toCategoryIndex && from.productIndex < insertIndex) {
        insertIndex -= 1;
      }

      toCat.products.splice(insertIndex, 0, moved);
      toCat.products = assignPopularity(toCat.products);
      if (from.categoryIndex !== toCategoryIndex) {
        fromCat.products = assignPopularity(fromCat.products);
      }

      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveProduct(null);
    const { active, over } = event;

    if (!over) {
      setCatalog(dragStartCatalog.current);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    setCatalog((current) => {
      const next = cloneCatalog(current);
      const from = findProductCategory(next, activeId);
      if (!from) return current;

      const sameColumn = findProductCategory(next, overId);
      if (sameColumn && from.categoryIndex === sameColumn.categoryIndex && activeId !== overId) {
        const cat = next[from.categoryIndex];
        const oldIndex = cat.products.findIndex((p) => p.id === activeId);
        const newIndex = cat.products.findIndex((p) => p.id === overId);
        if (oldIndex >= 0 && newIndex >= 0) {
          cat.products = assignPopularity(arrayMove(cat.products, oldIndex, newIndex));
        }
      }

      void persistMoves(next, dragStartCatalog.current);
      return next;
    });
  };

  const applyMobileLayout = (next: CatalogCategory[]) => {
    dragStartCatalog.current = cloneCatalog(catalog);
    void persistMoves(next, dragStartCatalog.current);
    setCatalog(next);
  };

  const handleMoveToCategory = (productId: string, categoryId: string) => {
    const next = cloneCatalog(catalog);
    const from = findProductCategory(next, productId);
    if (!from) return;
    const toIndex = next.findIndex((c) => c.id === categoryId);
    if (toIndex < 0 || from.categoryIndex === toIndex) return;

    const fromCat = next[from.categoryIndex];
    const [moved] = fromCat.products.splice(from.productIndex, 1);
    moved.category_id = categoryId;
    next[toIndex].products.push(moved);
    next[toIndex].products = assignPopularity(next[toIndex].products);
    fromCat.products = assignPopularity(fromCat.products);
    applyMobileLayout(next);
  };

  const handleMoveUp = (productId: string) => {
    const next = cloneCatalog(catalog);
    const from = findProductCategory(next, productId);
    if (!from || from.productIndex <= 0) return;
    const cat = next[from.categoryIndex];
    cat.products = assignPopularity(
      arrayMove(cat.products, from.productIndex, from.productIndex - 1)
    );
    applyMobileLayout(next);
  };

  const handleMoveDown = (productId: string) => {
    const next = cloneCatalog(catalog);
    const from = findProductCategory(next, productId);
    if (!from) return;
    const cat = next[from.categoryIndex];
    if (from.productIndex >= cat.products.length - 1) return;
    cat.products = assignPopularity(
      arrayMove(cat.products, from.productIndex, from.productIndex + 1)
    );
    applyMobileLayout(next);
  };

  const createCategory = async () => {
    if (!newCat.name.trim()) {
      toast.error('Category name required');
      return;
    }
    const res = await adminFetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCat),
    });
    if (!res.ok) {
      toast.error('Failed to create category');
      return;
    }
    toast.success('Category created');
    setCatOpen(false);
    setNewCat({ name: '', description: '', tag: '', icon_url: '' });
    load();
  };

  const createProduct = async () => {
    if (!newProd.name.trim() || !newProd.category_id) {
      toast.error('Name and category required');
      return;
    }
    const res = await adminFetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProd),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error ?? 'Failed to create product');
      return;
    }
    toast.success('Product created');
    setProdOpen(false);
    setNewProd({
      name: '',
      slug: '',
      category_id: '',
      description: '',
      base_image: '',
      base_price: 12000,
      template: 'simple',
    });
    await load();
    if (json.product?.slug) router.push(`/admin/products/${json.product.slug}`);
  };

  if (loading) return <p className="text-best-muted">Loading catalog…</p>;

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
            Catalog
          </h1>
          <p className="mt-1 text-sm text-best-muted">
            {isMobile
              ? 'Use the ⋮ menu on each product to move or reorder. Changes save automatically.'
              : 'Drag products between categories. Changes save automatically.'}
            {saving ? ' Saving…' : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setCatOpen(true)} className="min-h-11">
            <FolderPlus className="mr-2 h-4 w-4" /> Category
          </Button>
          <Button size="sm" onClick={() => setProdOpen(true)} className="min-h-11">
            <PackagePlus className="mr-2 h-4 w-4" /> Product
          </Button>
        </div>
      </div>

      <div className="relative mt-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-best-caption" />
        <Input
          placeholder="Filter products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-best-bg pl-9"
        />
      </div>

      {isMobile ? (
        <div className="-mx-2 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 px-2 md:mx-0 md:px-0">
          {filteredCatalog.map((category) => (
            <CategoryColumn
              key={category.id}
              category={category}
              isMobile
              allCategories={catalog}
              onMoveToCategory={handleMoveToCategory}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="-mx-2 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 px-2 md:mx-0 md:px-0">
            {filteredCatalog.map((category) => (
              <CategoryColumn key={category.id} category={category} />
            ))}
          </div>
          <DragOverlay>
            {activeProduct ? (
              <div className="w-64 opacity-90">
                <ProductCard product={activeProduct} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] overflow-y-auto border-best-border bg-best-elevated text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New category</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={newCat.name}
                onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                className="mt-1 bg-best-bg"
              />
            </div>
            <div>
              <Label>Tag</Label>
              <Input
                value={newCat.tag}
                onChange={(e) => setNewCat({ ...newCat, tag: e.target.value })}
                className="mt-1 bg-best-bg"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newCat.description}
                onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                className="mt-1 bg-best-bg"
              />
            </div>
            <ImageUploadField
              label="Icon"
              value={newCat.icon_url}
              onChange={(url) => setNewCat({ ...newCat, icon_url: url })}
              folder="categories"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createCategory}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={prodOpen} onOpenChange={setProdOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] overflow-y-auto border-best-border bg-best-elevated text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New product</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={newProd.name}
                onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                className="mt-1 bg-best-bg"
              />
            </div>
            <div>
              <Label>Slug (optional)</Label>
              <Input
                value={newProd.slug}
                onChange={(e) => setNewProd({ ...newProd, slug: e.target.value })}
                className="mt-1 bg-best-bg"
                placeholder="auto-generated"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={newProd.category_id}
                onValueChange={(v) => setNewProd({ ...newProd, category_id: v })}
              >
                <SelectTrigger className="mt-1 bg-best-bg">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {catalog.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Template</Label>
              <Select
                value={newProd.template}
                onValueChange={(v) =>
                  setNewProd({ ...newProd, template: v as typeof newProd.template })
                }
              >
                <SelectTrigger className="mt-1 bg-best-bg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple (no variants)</SelectItem>
                  <SelectItem value="subscription">Subscription (plan + duration)</SelectItem>
                  <SelectItem value="duration">Duration only (bypass style)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Base price (IQD)</Label>
              <Input
                type="number"
                value={newProd.base_price}
                onChange={(e) => setNewProd({ ...newProd, base_price: Number(e.target.value) })}
                className="mt-1 bg-best-bg"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newProd.description}
                onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                className="mt-1 bg-best-bg"
              />
            </div>
            <ImageUploadField
              label="Image"
              value={newProd.base_image}
              onChange={(url) => setNewProd({ ...newProd, base_image: url })}
              folder="products"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProdOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createProduct}>Create & edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
