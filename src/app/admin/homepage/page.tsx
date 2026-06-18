'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';
import type { CmsBlock, CmsSection } from '@/types/site-content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const LOCALES = ['en', 'ku', 'ar'] as const;
const SECTIONS: { id: CmsSection; label: string }[] = [
  { id: 'hero', label: 'Hero' },
  { id: 'faq', label: 'FAQ' },
  { id: 'step', label: 'How it works' },
  { id: 'feature', label: 'Features' },
  { id: 'testimonial', label: 'Testimonials' },
];

export default function AdminHomepagePage() {
  const [locale, setLocale] = useState<(typeof LOCALES)[number]>('en');
  const [section, setSection] = useState<CmsSection>('hero');
  const [blocks, setBlocks] = useState<CmsBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<CmsBlock> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch(`/api/admin/cms-blocks?section=${section}&locale=${locale}`);
    const json = await res.json();
    if (res.ok) setBlocks(json.blocks ?? []);
    setLoading(false);
  }, [section, locale]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    const defaults: Record<string, Record<string, unknown>> = {
      hero: { eyebrow: '', headline: '', headlineAccent: '', subtitle: '', primaryCtaLabel: '', primaryCtaHref: '#categories', secondaryCtaLabel: '', secondaryCtaHref: '#products' },
      faq: { question: '', answer: '' },
      step: { number: '01', title: '', description: '' },
      feature: { icon: 'Zap', title: '', description: '' },
      testimonial: { name: '', handle: '', quote: '', initials: '', tag: '', hasVideo: false },
    };
    setEditing({
      section,
      locale,
      payload: defaults[section] ?? {},
      sort_order: blocks.length,
      active: true,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    const isNew = !editing.id;
    const res = isNew
      ? await adminFetch('/api/admin/cms-blocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        })
      : await adminFetch(`/api/admin/cms-blocks/${editing.id}`, {
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
    await adminFetch(`/api/admin/cms-blocks/${id}`, { method: 'DELETE' });
    toast.success('Deleted');
    load();
  };

  const setPayload = (key: string, value: unknown) => {
    if (!editing) return;
    setEditing({
      ...editing,
      payload: { ...(editing.payload as Record<string, unknown>), [key]: value },
    });
  };

  const payload = (editing?.payload ?? {}) as Record<string, unknown>;

  return (
    <div>
      <h1 className="font-display text-3xl font-black uppercase tracking-tight">Homepage</h1>
      <Tabs value={locale} onValueChange={(v) => setLocale(v as typeof locale)} className="mt-6">
        <TabsList>
          {LOCALES.map((l) => (
            <TabsTrigger key={l} value={l}>{l.toUpperCase()}</TabsTrigger>
          ))}
        </TabsList>
        {LOCALES.map((l) => (
          <TabsContent key={l} value={l}>
            <div className="mb-4 flex flex-wrap gap-2">
              {SECTIONS.map((s) => (
                <Button
                  key={s.id}
                  variant={section === s.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSection(s.id)}
                >
                  {s.label}
                </Button>
              ))}
              {section !== 'hero' && (
                <Button size="sm" onClick={openNew} className="ml-auto">
                  <Plus className="mr-1 h-4 w-4" /> Add
                </Button>
              )}
            </div>
            {loading ? (
              <p className="text-best-muted">Loading…</p>
            ) : (
              <div className="space-y-2">
                {blocks.map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-lg border border-best-border bg-best-elevated p-3">
                    <pre className="max-w-xl truncate text-xs text-best-muted">{JSON.stringify(b.payload)}</pre>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditing(b); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {section !== 'hero' && (
                        <Button size="sm" variant="outline" onClick={() => remove(b.id)}>
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {section === 'hero' && blocks.length === 0 && (
                  <Button onClick={openNew}>Create hero for {l}</Button>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-best-border bg-best-elevated text-white">
          <DialogHeader><DialogTitle>Edit {section}</DialogTitle></DialogHeader>
          {editing && section === 'hero' && (
            <div className="space-y-3">
              {['eyebrow', 'headline', 'headlineAccent', 'subtitle', 'primaryCtaLabel', 'primaryCtaHref', 'secondaryCtaLabel', 'secondaryCtaHref'].map((k) => (
                <div key={k}><Label>{k}</Label><Input value={String(payload[k] ?? '')} onChange={(e) => setPayload(k, e.target.value)} className="mt-1 bg-best-bg" /></div>
              ))}
            </div>
          )}
          {editing && section === 'faq' && (
            <div className="space-y-3">
              <div><Label>Question</Label><Input value={String(payload.question ?? '')} onChange={(e) => setPayload('question', e.target.value)} className="mt-1 bg-best-bg" /></div>
              <div><Label>Answer</Label><Textarea value={String(payload.answer ?? '')} onChange={(e) => setPayload('answer', e.target.value)} className="mt-1 bg-best-bg" /></div>
            </div>
          )}
          {editing && section === 'step' && (
            <div className="space-y-3">
              {['number', 'title', 'description'].map((k) => (
                <div key={k}><Label>{k}</Label><Input value={String(payload[k] ?? '')} onChange={(e) => setPayload(k, e.target.value)} className="mt-1 bg-best-bg" /></div>
              ))}
            </div>
          )}
          {editing && section === 'feature' && (
            <div className="space-y-3">
              <div><Label>Icon</Label><Input value={String(payload.icon ?? 'Zap')} onChange={(e) => setPayload('icon', e.target.value)} className="mt-1 bg-best-bg" /></div>
              <div><Label>Title</Label><Input value={String(payload.title ?? '')} onChange={(e) => setPayload('title', e.target.value)} className="mt-1 bg-best-bg" /></div>
              <div><Label>Description</Label><Textarea value={String(payload.description ?? '')} onChange={(e) => setPayload('description', e.target.value)} className="mt-1 bg-best-bg" /></div>
            </div>
          )}
          {editing && section === 'testimonial' && (
            <div className="space-y-3">
              {['name', 'handle', 'quote', 'initials', 'tag'].map((k) => (
                <div key={k}><Label>{k}</Label><Input value={String(payload[k] ?? '')} onChange={(e) => setPayload(k, e.target.value)} className="mt-1 bg-best-bg" /></div>
              ))}
              <div className="flex items-center gap-2"><Switch checked={Boolean(payload.hasVideo)} onCheckedChange={(v) => setPayload('hasVideo', v)} /><Label>Has video</Label></div>
            </div>
          )}
          {editing && (
            <div className="mt-4 flex items-center gap-2">
              <Switch checked={editing.active ?? true} onCheckedChange={(a) => setEditing({ ...editing, active: a })} />
              <Label>Active</Label>
            </div>
          )}
          <DialogFooter className="mt-4"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
