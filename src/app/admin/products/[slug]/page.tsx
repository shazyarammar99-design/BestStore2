'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Trash2, ArrowLeft, Plus } from 'lucide-react';
import ProductDetail from '@/components/store/ProductDetail';
import { adminFetch } from '@/lib/admin-fetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ImageUploadField from '@/components/admin/ImageUploadField';
import VideoUploadField from '@/components/admin/VideoUploadField';

type Variant = {
  id?: string;
  plan_type: string | null;
  duration: string | null;
  price: number;
  stock: number;
  _delete?: boolean;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_image: string | null;
  video_url: string | null;
  gallery_images: string[];
  base_price: number;
  popularity: number;
  is_featured: boolean;
  category_id: string;
};

type Category = { id: string; name: string; slug: string };

export default function AdminProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [prodRes, catRes] = await Promise.all([
      adminFetch(`/api/admin/products/${slug}`),
      adminFetch('/api/admin/categories'),
    ]);
    const prodJson = await prodRes.json();
    const catJson = await catRes.json();
    if (prodRes.ok) {
      setProduct(prodJson.product);
      setVariants(prodJson.variants ?? []);
    }
    if (catRes.ok) setCategories(catJson.categories ?? []);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!product) return;
    setSaving(true);
    const res = await adminFetch(`/api/admin/products/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...product, variants }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error('Save failed');
      return;
    }
    const json = await res.json();
    toast.success('Product saved');
    if (json.slug && json.slug !== slug) {
      router.replace(`/admin/products/${json.slug}`);
    }
  };

  const remove = async () => {
    if (!confirm('Delete this product permanently?')) return;
    const res = await adminFetch(`/api/admin/products/${slug}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error('Delete failed');
      return;
    }
    toast.success('Product deleted');
    router.push('/admin/products');
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { plan_type: null, duration: '1 Month', price: product?.base_price ?? 0, stock: 999 },
    ]);
  };

  if (loading) return <p className="text-best-muted">Loading…</p>;
  if (!product) return <p className="text-red-400">Product not found</p>;

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_minmax(0,1fr)]">
      <div className="max-w-2xl">
      <Link
        href="/admin/products"
        className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm text-best-muted hover:text-best-cyan"
      >
        <ArrowLeft className="h-4 w-4" /> Back to catalog
      </Link>

      <h1 className="font-display text-2xl font-black uppercase">{product.name}</h1>

      <div className="mt-8 space-y-4">
        <ImageUploadField
          label="Product image"
          value={product.base_image ?? ''}
          onChange={(url) => setProduct({ ...product, base_image: url })}
          folder="products"
        />

        <VideoUploadField
          label="Product video (MP4/WebM or YouTube URL)"
          value={product.video_url ?? ''}
          onChange={(url) => setProduct({ ...product, video_url: url || null })}
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>Gallery images</Label>
            <ImageUploadField
              label=""
              value=""
              onChange={(url) => {
                if (!url) return;
                setProduct({
                  ...product,
                  gallery_images: [...(product.gallery_images ?? []), url],
                });
              }}
              folder="products"
            />
          </div>
          {(product.gallery_images ?? []).length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {(product.gallery_images ?? []).map((img, i) => (
                <div key={`gallery-${i}`} className="group relative overflow-hidden rounded-lg border border-best-border">
                  <img src={img} alt={`Gallery ${i + 1}`} className="aspect-square w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...(product.gallery_images ?? [])];
                      next.splice(i, 1);
                      setProduct({ ...product, gallery_images: next });
                    }}
                    className="absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="mt-1 text-xs text-best-caption">Upload additional product screenshots. These appear in the product gallery.</p>
        </div>

        <div>
          <Label>Name (English)</Label>
          <Input
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="mt-1 bg-best-bg"
          />
        </div>

        <div>
          <Label>Name (Kurdish)</Label>
          <Input
            value={product.name_translations?.ku ?? ''}
            onChange={(e) =>
              setProduct({
                ...product,
                name_translations: { ...product.name_translations, ku: e.target.value },
              })
            }
            className="mt-1 bg-best-bg"
          />
        </div>

        <div>
          <Label>Name (Arabic)</Label>
          <Input
            value={product.name_translations?.ar ?? ''}
            onChange={(e) =>
              setProduct({
                ...product,
                name_translations: { ...product.name_translations, ar: e.target.value },
              })
            }
            className="mt-1 bg-best-bg"
          />
        </div>

        <div>
          <Label>Slug</Label>
          <Input
            value={product.slug}
            onChange={(e) => setProduct({ ...product, slug: e.target.value })}
            className="mt-1 bg-best-bg"
          />
          <p className="mt-1 text-xs text-best-caption">Changing slug updates the product URL.</p>
        </div>

        <div>
          <Label>Category</Label>
          <Select
            value={product.category_id}
            onValueChange={(v) => setProduct({ ...product, category_id: v })}
          >
            <SelectTrigger className="mt-1 bg-best-bg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Description (English)</Label>
          <Textarea
            value={product.description ?? ''}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            className="mt-1 bg-best-bg"
          />
        </div>

        <div>
          <Label>Description (Kurdish)</Label>
          <Textarea
            value={product.description_translations?.ku ?? ''}
            onChange={(e) =>
              setProduct({
                ...product,
                description_translations: { ...product.description_translations, ku: e.target.value },
              })
            }
            className="mt-1 bg-best-bg"
          />
        </div>

        <div>
          <Label>Description (Arabic)</Label>
          <Textarea
            value={product.description_translations?.ar ?? ''}
            onChange={(e) =>
              setProduct({
                ...product,
                description_translations: { ...product.description_translations, ar: e.target.value },
              })
            }
            className="mt-1 bg-best-bg"
          />
        </div>

        <div>
          <Label>Base price (IQD)</Label>
          <Input
            type="number"
            value={product.base_price}
            onChange={(e) => setProduct({ ...product, base_price: Number(e.target.value) })}
            className="mt-1 bg-best-bg"
          />
        </div>

        <div>
          <Label>Popularity (sort)</Label>
          <Input
            type="number"
            value={product.popularity}
            onChange={(e) => setProduct({ ...product, popularity: Number(e.target.value) })}
            className="mt-1 bg-best-bg"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={product.is_featured}
            onCheckedChange={(v) => setProduct({ ...product, is_featured: v })}
          />
          <Label>Featured</Label>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>Variants</Label>
            <Button type="button" size="sm" variant="outline" onClick={addVariant}>
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </div>
          <div className="space-y-3">
            {variants.map((v, i) =>
              v._delete ? null : (
                <div key={v.id ?? `new-${i}`} className="rounded-lg border border-best-border p-3 text-sm">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      value={v.plan_type ?? ''}
                      onChange={(e) => {
                        const next = [...variants];
                        next[i] = { ...v, plan_type: e.target.value || null };
                        setVariants(next);
                      }}
                      className="bg-best-bg"
                      placeholder="Plan type"
                    />
                    <Input
                      value={v.duration ?? ''}
                      onChange={(e) => {
                        const next = [...variants];
                        next[i] = { ...v, duration: e.target.value || null };
                        setVariants(next);
                      }}
                      className="bg-best-bg"
                      placeholder="Duration"
                    />
                    <Input
                      type="number"
                      value={v.price}
                      onChange={(e) => {
                        const next = [...variants];
                        next[i] = { ...v, price: Number(e.target.value) };
                        setVariants(next);
                      }}
                      className="bg-best-bg"
                      placeholder="Price"
                    />
                    <Input
                      type="number"
                      value={v.stock}
                      onChange={(e) => {
                        const next = [...variants];
                        next[i] = { ...v, stock: Number(e.target.value) };
                        setVariants(next);
                      }}
                      className="bg-best-bg"
                      placeholder="Stock"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="mt-2 text-red-400 hover:text-red-300"
                    onClick={() => {
                      const next = [...variants];
                      if (v.id) next[i] = { ...v, _delete: true };
                      else next.splice(i, 1);
                      setVariants(next);
                    }}
                  >
                    <Trash2 className="mr-1 h-4 w-4" /> Remove
                  </Button>
                </div>
              )
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={save} disabled={saving} className="min-h-11 flex-1">
            {saving ? 'Saving…' : 'Save product'}
          </Button>
          <Button
            variant="outline"
            onClick={remove}
            className="min-h-11 border-red-500/40 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
        </div>
      </div>
      <div className="hidden lg:block sticky top-24 pointer-events-none">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-best-muted">Live Preview</h3>
        <div className="scale-[0.8] origin-top rounded-3xl border-8 border-best-border/30 bg-best-bg shadow-2xl overflow-hidden pointer-events-auto">
          <div className="h-[800px] overflow-y-auto overflow-x-hidden">
            <ProductDetail
              product={{
                ...product,
                variants: variants as any,
                category: categories.find((c) => c.id === product.category_id) ?? null,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
