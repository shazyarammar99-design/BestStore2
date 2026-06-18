'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';
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
import { Textarea } from '@/components/ui/textarea';
import ImageUploadField from '@/components/admin/ImageUploadField';

type Release = {
  id: string;
  title: string;
  image_url: string;
  description: string;
  link: string;
  sort_order: number;
  active: boolean;
};

const empty = (): Partial<Release> => ({
  title: '',
  image_url: '',
  description: '',
  link: '/',
  sort_order: 0,
  active: true,
});

export default function AdminNewReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Release> | null>(null);

  const load = useCallback(async () => {
    const res = await adminFetch('/api/admin/new-releases');
    const json = await res.json();
    if (res.ok) setReleases(json.releases ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!editing?.title || !editing.image_url) {
      toast.error('Title and image required');
      return;
    }
    const isNew = !editing.id;
    const res = isNew
      ? await adminFetch('/api/admin/new-releases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        })
      : await adminFetch(`/api/admin/new-releases/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        });
    if (!res.ok) {
      toast.error('Save failed');
      return;
    }
    toast.success('Saved');
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete?')) return;
    await adminFetch(`/api/admin/new-releases/${id}`, { method: 'DELETE' });
    toast.success('Deleted');
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-black uppercase tracking-tight">New Releases</h1>
        <Button onClick={() => { setEditing(empty()); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add slide
        </Button>
      </div>
      {loading ? (
        <p className="mt-8 text-best-muted">Loading…</p>
      ) : (
        <div className="mt-8 space-y-3">
          {releases.map((r) => (
            <div key={r.id} className="flex items-center gap-4 rounded-xl border border-best-border bg-best-elevated p-4">
              <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg">
                <Image src={r.image_url} alt="" fill className="object-cover" unoptimized />
              </div>
              <div className="flex-1">
                <p className="font-medium">{r.title}</p>
                <p className="text-xs text-best-caption">{r.link}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => { setEditing(r); setOpen(true); }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => remove(r.id)}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-best-border bg-best-elevated text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? 'Edit' : 'New'} release</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <ImageUploadField value={editing.image_url ?? ''} onChange={(u) => setEditing({ ...editing, image_url: u })} folder="releases" />
              <div><Label>Title</Label><Input value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="mt-1 bg-best-bg" /></div>
              <div><Label>Description</Label><Textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="mt-1 bg-best-bg" /></div>
              <div><Label>Link</Label><Input value={editing.link ?? ''} onChange={(e) => setEditing({ ...editing, link: e.target.value })} className="mt-1 bg-best-bg" /></div>
              <div><Label>Sort order</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} className="mt-1 bg-best-bg" /></div>
              <div className="flex items-center gap-2"><Switch checked={editing.active ?? true} onCheckedChange={(a) => setEditing({ ...editing, active: a })} /><Label>Active</Label></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
