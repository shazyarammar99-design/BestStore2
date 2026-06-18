'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';
import type { SiteAd } from '@/types/site-content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ImageUploadField from '@/components/admin/ImageUploadField';

const emptyAd = (): Partial<SiteAd> => ({
  placement: 'navbar',
  image_url: '',
  link_url: '/',
  alt_text: '',
  sort_order: 0,
  active: true,
});

export default function AdminAdsPage() {
  const [ads, setAds] = useState<SiteAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<SiteAd> | null>(null);

  const load = useCallback(async () => {
    const res = await adminFetch('/api/admin/ads');
    const json = await res.json();
    if (res.ok) setAds(json.ads ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!editing?.image_url) {
      toast.error('Image is required');
      return;
    }
    const isNew = !editing.id;
    const res = isNew
      ? await adminFetch('/api/admin/ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        })
      : await adminFetch(`/api/admin/ads/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        });
    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error ?? 'Save failed');
      return;
    }
    toast.success('Ad saved');
    setOpen(false);
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this ad?')) return;
    const res = await adminFetch(`/api/admin/ads/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error('Delete failed');
      return;
    }
    toast.success('Ad deleted');
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight">Ads</h1>
          <p className="mt-1 text-sm text-best-muted">Manage promo banners shown on the site.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(emptyAd());
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add ad
        </Button>
      </div>

      {loading ? (
        <p className="mt-8 text-best-muted">Loading…</p>
      ) : (
        <div className="mt-8 space-y-3">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="flex items-center gap-4 rounded-xl border border-best-border bg-best-elevated p-4"
            >
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg">
                <Image src={ad.image_url} alt="" fill className="object-cover" unoptimized />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">{ad.alt_text || 'Untitled ad'}</p>
                <p className="truncate text-xs text-best-caption">
                  {ad.placement} · {ad.link_url}
                </p>
              </div>
              <span className={ad.active ? 'text-emerald-400' : 'text-best-caption'}>
                {ad.active ? 'Active' : 'Off'}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(ad);
                  setOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => remove(ad.id)}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-best-border bg-best-elevated text-white">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit ad' : 'New ad'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <ImageUploadField
                value={editing.image_url ?? ''}
                onChange={(url) => setEditing({ ...editing, image_url: url })}
                folder="ads"
              />
              <div>
                <Label>Alt text / caption</Label>
                <Input
                  value={editing.alt_text ?? ''}
                  onChange={(e) => setEditing({ ...editing, alt_text: e.target.value })}
                  className="mt-1 bg-best-bg"
                />
              </div>
              <div>
                <Label>Link URL</Label>
                <Input
                  value={editing.link_url ?? ''}
                  onChange={(e) => setEditing({ ...editing, link_url: e.target.value })}
                  className="mt-1 bg-best-bg"
                />
              </div>
              <div>
                <Label>Placement</Label>
                <Select
                  value={editing.placement ?? 'navbar'}
                  onValueChange={(v) => setEditing({ ...editing, placement: v as SiteAd['placement'] })}
                >
                  <SelectTrigger className="mt-1 bg-best-bg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="navbar">Navbar</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={editing.sort_order ?? 0}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                  className="mt-1 bg-best-bg"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editing.active ?? true}
                  onCheckedChange={(active) => setEditing({ ...editing, active })}
                />
                <Label>Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
