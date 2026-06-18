'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { FolderPlus, Pencil, Trash2 } from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import ImageUploadField from '@/components/admin/ImageUploadField';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tag: string | null;
  icon_url: string | null;
  sort_order: number;
  product_count?: number;
};

const emptyCategory = (): Category => ({
  id: '',
  name: '',
  slug: '',
  description: '',
  tag: '',
  icon_url: '',
  sort_order: 0,
});

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('edit');
  const [editing, setEditing] = useState<Category | null>(null);
  const [originalSlug, setOriginalSlug] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch('/api/admin/categories');
    const json = await res.json();
    if (res.ok) setCategories(json.categories ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    const maxSort = categories.reduce((m, c) => Math.max(m, c.sort_order), 0);
    setMode('create');
    setOriginalSlug('');
    setEditing({ ...emptyCategory(), sort_order: maxSort + 1 });
    setOpen(true);
  };

  const openEdit = (c: Category) => {
    setMode('edit');
    setOriginalSlug(c.slug);
    setEditing({ ...c });
    setOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);

    if (mode === 'create') {
      const res = await adminFetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editing.name,
          slug: editing.slug || undefined,
          description: editing.description,
          tag: editing.tag,
          icon_url: editing.icon_url,
          sort_order: editing.sort_order,
        }),
      });
      setSaving(false);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.error(json.error ?? 'Create failed');
        return;
      }
      toast.success('Category created');
    } else {
      const res = await adminFetch(`/api/admin/categories/${originalSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      setSaving(false);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.error(json.error ?? 'Save failed');
        return;
      }
      toast.success('Category saved');
    }

    setOpen(false);
    load();
  };

  const remove = async (c: Category) => {
    const count = c.product_count ?? 0;
    if (count > 0) {
      toast.error(`Move or delete ${count} product(s) on the Catalog board first.`);
      return;
    }
    if (!confirm(`Delete category "${c.name}"? This cannot be undone.`)) return;

    const res = await adminFetch(`/api/admin/categories/${c.slug}`, { method: 'DELETE' });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(json.error ?? 'Delete failed');
      return;
    }
    toast.success('Category deleted');
    load();
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight">Categories</h1>
          <p className="mt-1 text-sm text-best-muted">
            Add, edit, or delete categories. Move products between categories on the{' '}
            <Link href="/admin/products" className="text-best-cyan hover:underline">
              Catalog board
            </Link>
            .
          </p>
        </div>
        <Button onClick={openCreate} className="min-h-11 shrink-0">
          <FolderPlus className="mr-2 h-4 w-4" /> New category
        </Button>
      </div>

      {loading ? (
        <p className="mt-8 text-best-muted">Loading…</p>
      ) : categories.length === 0 ? (
        <p className="mt-8 text-best-muted">No categories yet. Create one to get started.</p>
      ) : (
        <div className="mt-8 space-y-3">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-4 rounded-xl border border-best-border bg-best-elevated p-4"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-best-border">
                {c.icon_url && (
                  <Image src={c.icon_url} alt="" fill className="object-cover" unoptimized />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-best-caption">{c.slug}</p>
                <p className="mt-0.5 text-xs text-best-muted">
                  {(c.product_count ?? 0) === 1 ? '1 product' : `${c.product_count ?? 0} products`}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-11 min-w-11"
                  onClick={() => openEdit(c)}
                  aria-label="Edit category"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-11 min-w-11 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => remove(c)}
                  aria-label="Delete category"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] overflow-y-auto border-best-border bg-best-elevated text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'New category' : 'Edit category'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <ImageUploadField
                label="Banner image"
                value={editing.icon_url ?? ''}
                onChange={(u) => setEditing({ ...editing, icon_url: u })}
                folder="categories"
              />
              <div>
                <Label>Name</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="mt-1 bg-best-bg"
                />
              </div>
              <div>
                <Label>Slug {mode === 'create' ? '(optional)' : ''}</Label>
                <Input
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  className="mt-1 bg-best-bg"
                  placeholder={mode === 'create' ? 'auto-generated from name' : editing.slug}
                />
                {mode === 'edit' && (
                  <p className="mt-1 text-xs text-best-caption">
                    Changing slug updates the category URL on the site.
                  </p>
                )}
              </div>
              <div>
                <Label>Tag</Label>
                <Input
                  value={editing.tag ?? ''}
                  onChange={(e) => setEditing({ ...editing, tag: e.target.value })}
                  className="mt-1 bg-best-bg"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editing.description ?? ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="mt-1 bg-best-bg"
                />
              </div>
              <div>
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                  className="mt-1 bg-best-bg"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving} className="min-h-11">
              {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
