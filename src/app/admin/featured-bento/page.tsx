'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import FeaturedBento, { type BentoItem } from '@/sections/FeaturedBento';
import { type Product } from '@/lib/catalog';

const GRID_CLASSES = [
  "col-span-1 row-span-2",
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-2 row-span-3",
  "col-span-1 row-span-1",
  "col-span-2 row-span-3",
  "col-span-2 row-span-1",
  "col-span-2 row-span-2",
  "col-span-1 row-span-2",
  "col-span-1 row-span-2"
];

const SLOT_LABELS = [
  "Slot 1: Top Left Box (1x2)",
  "Slot 2: Top Center Box (2x2)",
  "Slot 3: Top Right Inner (1x1)",
  "Slot 4: Right Side Large (2x3)",
  "Slot 5: Mid Right Inner (1x1)",
  "Slot 6: Left Side Large (2x3)",
  "Slot 7: Center Strip (2x1)",
  "Slot 8: Bottom Center Box (2x2)",
  "Slot 9: Bottom Right Inner (1x2)",
  "Slot 10: Far Bottom Right (1x2)"
];

export default function AdminFeaturedBentoPage() {
  const [bentoItems, setBentoItems] = useState<BentoItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [configRes, prodRes] = await Promise.all([
      adminFetch('/api/admin/featured-bento'),
      adminFetch('/api/admin/catalog'), // Assuming this returns { categories, products }
    ]);

    let catalogProducts: Product[] = [];
    if (prodRes.ok) {
      const json = await prodRes.json();
      const catalog = json.catalog || [];
      const allProducts = catalog.flatMap((c: any) => c.products || []);
      // Deduplicate by ID in case a product is in multiple categories
      catalogProducts = Array.from(new Map(allProducts.map((p: any) => [p.id, p])).values()) as Product[];
      setProducts(catalogProducts);
    }

    if (configRes.ok) {
      const json = await configRes.json();
      const loadedItems = json.bentoItems || [];
      // Hydrate with full product objects from the catalog
      if (catalogProducts.length > 0) {
        const hydrated = loadedItems.map((item: any, idx: number) => {
          const product = catalogProducts.find((p: Product) => p.id === item.productId);
          // Force correct layout class based on its position index
          const gridClasses = GRID_CLASSES[idx] || item.gridClasses;
          return { product, gridClasses };
        }).filter((item: any) => item.product !== undefined);
        setBentoItems(hydrated);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    
    // Flatten before saving (only save IDs and classes)
    const payload = bentoItems.map((item, idx) => ({
      productId: item.product.id,
      gridClasses: GRID_CLASSES[idx] || item.gridClasses
    }));

    const res = await adminFetch('/api/admin/featured-bento', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bentoItems: payload }),
    });

    setSaving(false);
    if (!res.ok) {
      toast.error('Save failed');
      return;
    }
    toast.success('Bento grid saved! Live on homepage.');
  };

  const addItem = () => {
    if (products.length === 0) return;
    if (bentoItems.length >= 10) {
      toast.error('Max 10 items allowed in the Bento grid.');
      return;
    }
    const unselectedProduct = products.find(p => !bentoItems.some(i => i.product.id === p.id));
    if (!unselectedProduct) return;

    // Use fixed grid class for this slot index
    const nextClass = GRID_CLASSES[bentoItems.length];

    setBentoItems([
      ...bentoItems,
      { product: unselectedProduct, gridClasses: nextClass }
    ]);
  };

  const updateItem = (index: number, updates: Partial<BentoItem>) => {
    const next = [...bentoItems];
    next[index] = { ...next[index], ...updates };
    setBentoItems(next);
  };

  const removeItem = (index: number) => {
    const next = [...bentoItems];
    next.splice(index, 1);
    // Re-assign correct classes to remaining items so layout doesn't break
    const fixedNext = next.map((item, idx) => ({
      ...item,
      gridClasses: GRID_CLASSES[idx] || item.gridClasses
    }));
    setBentoItems(fixedNext);
  };

  if (loading) return <p className="text-best-muted pt-10 px-6">Loading...</p>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin"
            className="mb-4 inline-flex items-center gap-2 text-sm text-best-muted hover:text-best-cyan"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-white">
            Featured Bento Grid
          </h1>
          <p className="mt-2 text-best-muted max-w-2xl text-sm">
            Configure exactly which products appear on the homepage Bento Grid. Layout slots are fixed to ensure a perfect mosaic. Max 10 items.
          </p>
        </div>
        <Button onClick={save} disabled={saving} className="bg-best-cyan hover:bg-best-cyan/90 text-zinc-950 font-bold px-6">
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Layout'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        {/* Editor sidebar */}
        <div className="xl:col-span-1">
          <div className="rounded-2xl border border-best-border bg-best-bg p-6 h-[750px] flex flex-col shadow-xl">
            <div className="mb-6 flex items-center justify-between shrink-0">
              <h2 className="font-display text-lg font-bold uppercase text-white">Grid Items</h2>
              <span className="text-xs text-best-muted font-mono">{bentoItems.length}/10 slots</span>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 pr-3 custom-scrollbar pb-6">
              {bentoItems.map((item, idx) => (
                <div key={`${item.product.id}-${idx}`} className="group relative rounded-lg border border-white/10 bg-black/40 p-4 transition-colors hover:border-white/20">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs text-best-muted font-bold uppercase block">Product</label>
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/70 font-mono">{SLOT_LABELS[idx] || `Slot ${idx + 1}`}</span>
                      </div>
                      <Select
                        value={item.product.id}
                        onValueChange={(val) => {
                          const product = products.find(p => p.id === val);
                          if (product) updateItem(idx, { product });
                        }}
                      >
                        <SelectTrigger className="bg-zinc-900 border-white/10 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-64 overflow-y-auto">
                          {products.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeItem(idx)}
                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-500/20 text-red-400 opacity-0 flex items-center justify-center transition-all hover:bg-red-500/80 hover:text-white group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {bentoItems.length < 10 && (
                <Button 
                  onClick={addItem}
                  variant="outline" 
                  className="w-full border-dashed border-white/20 text-best-muted hover:text-white hover:border-white/50 h-12 mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="rounded-2xl border border-best-border bg-best-bg overflow-hidden shadow-2xl h-[750px] flex flex-col">
            <div className="bg-black/40 border-b border-best-border px-4 py-3 flex items-center justify-between shrink-0">
              <span className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Live Preview
              </span>
              <span className="text-xs text-best-muted">Hover items to test interactions</span>
            </div>
            
            <div className="flex-1 bg-black/40 p-6 flex justify-center overflow-hidden items-center">
              <div className="w-[150%] max-w-[144rem] origin-center scale-[0.65]">
                <FeaturedBento bentoItems={bentoItems} products={products} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
