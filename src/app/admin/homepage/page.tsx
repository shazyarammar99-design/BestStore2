'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';
import type { CmsBlock, CmsSection } from '@/types/site-content';
import {
  DEFAULT_HOW_IT_WORKS_VIDEO,
  type HowItWorksVideoSettings,
  type HowItWorksVideoType,
} from '@/types/site-settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import ImageUploadField from '@/components/admin/ImageUploadField';
import VideoUploadField from '@/components/admin/VideoUploadField';

const LOCALES = ['en', 'ku', 'ar'] as const;
type PageSection = CmsSection | 'video';

const CMS_SECTIONS: { id: CmsSection; label: string }[] = [
  { id: 'hero', label: 'Hero' },
  { id: 'faq', label: 'FAQ' },
  { id: 'step', label: 'How it works' },
  { id: 'feature', label: 'Features' },
  { id: 'testimonial', label: 'Testimonials' },
];

const HERO_FIELDS: { key: string; label: string }[] = [
  { key: 'eyebrow', label: 'Top label (e.g. BEST STORE)' },
  { key: 'headline', label: 'Headline line 1 (white text)' },
  { key: 'headlineAccent', label: 'Headline line 2 (gradient text)' },
  { key: 'subtitle', label: 'Subtitle' },
  { key: 'primaryCtaLabel', label: 'Primary button label' },
  { key: 'primaryCtaHref', label: 'Primary button link (e.g. #categories)' },
  { key: 'secondaryCtaLabel', label: 'Secondary button label' },
  { key: 'secondaryCtaHref', label: 'Secondary button link (e.g. #products)' },
];

function blockSummary(section: CmsSection, payload: Record<string, unknown>): string {
  switch (section) {
    case 'hero':
      return `${payload.headline ?? ''} ${payload.headlineAccent ?? ''}`.trim() || 'Empty hero';
    case 'faq':
      return String(payload.question ?? 'FAQ item');
    case 'step':
      return `${payload.number ?? ''} ${payload.title ?? ''}`.trim();
    case 'feature':
      return String(payload.title ?? 'Feature');
    case 'testimonial':
      return String(payload.name ?? 'Testimonial');
    default:
      return JSON.stringify(payload);
  }
}

function HeroPreview({ payload }: { payload: Record<string, unknown> }) {
  return (
    <div className="mt-4 rounded-lg border border-best-border bg-best-bg p-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-best-cyan">
        {String(payload.eyebrow || 'BEST STORE')}
      </p>
      <h3 className="font-display mt-3 text-2xl font-black uppercase text-white">
        {String(payload.headline || 'PREMIUM GAMING')}
        <span className="mt-1 block text-gradient-neon">
          {String(payload.headlineAccent || 'SERVICES & TOOLS')}
        </span>
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm text-best-muted">
        {String(payload.subtitle || 'Subtitle text…')}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <span className="rounded-lg bg-best-gold px-4 py-2 text-xs font-bold uppercase text-best-bg">
          {String(payload.primaryCtaLabel || 'Browse')}
        </span>
        <span className="rounded-lg border border-best-cyan/40 px-4 py-2 text-xs font-semibold uppercase text-best-cyan">
          {String(payload.secondaryCtaLabel || 'View')}
        </span>
      </div>
    </div>
  );
}

export default function AdminHomepagePage() {
  const [locale, setLocale] = useState<(typeof LOCALES)[number]>('en');
  const [section, setSection] = useState<PageSection>('hero');
  const [blocks, setBlocks] = useState<CmsBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<CmsBlock> | null>(null);
  const [videoSettings, setVideoSettings] = useState<HowItWorksVideoSettings>(
    DEFAULT_HOW_IT_WORKS_VIDEO
  );
  const [savingVideo, setSavingVideo] = useState(false);

  const load = useCallback(async () => {
    if (section === 'video') {
      setLoading(true);
      const res = await adminFetch('/api/admin/how-it-works-video');
      const json = await res.json();
      if (res.ok) setVideoSettings({ ...DEFAULT_HOW_IT_WORKS_VIDEO, ...json.settings });
      setLoading(false);
      return;
    }

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
      hero: {
        eyebrow: 'BEST STORE',
        headline: 'PREMIUM GAMING',
        headlineAccent: 'SERVICES & TOOLS',
        subtitle:
          'Accounts, in-game currency, bypass tools, and game bundles — delivered fast with 24/7 support.',
        primaryCtaLabel: 'BROWSE CATEGORIES',
        primaryCtaHref: '#categories',
        secondaryCtaLabel: 'VIEW PRODUCTS',
        secondaryCtaHref: '#products',
      },
      faq: { question: '', answer: '' },
      step: { number: '01', title: '', description: '' },
      feature: { icon: 'Zap', title: '', description: '' },
      testimonial: { name: '', handle: '', quote: '', initials: '', tag: '', hasVideo: false },
    };
    setEditing({
      section: section as CmsSection,
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

  const saveVideo = async () => {
    setSavingVideo(true);
    const res = await adminFetch('/api/admin/how-it-works-video', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(videoSettings),
    });
    setSavingVideo(false);
    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error ?? 'Save failed');
      return;
    }
    toast.success('Video settings saved');
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
      <p className="mt-1 text-sm text-best-muted">
        Edit hero text, how-it-works steps, and the explainer video.
      </p>

      <Tabs value={locale} onValueChange={(v) => setLocale(v as typeof locale)} className="mt-6">
        <TabsList>
          {LOCALES.map((l) => (
            <TabsTrigger key={l} value={l}>
              {l.toUpperCase()}
            </TabsTrigger>
          ))}
        </TabsList>
        {LOCALES.map((l) => (
          <TabsContent key={l} value={l}>
            <div className="mb-4 flex flex-wrap gap-2">
              {CMS_SECTIONS.map((s) => (
                <Button
                  key={s.id}
                  variant={section === s.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSection(s.id)}
                >
                  {s.label}
                </Button>
              ))}
              <Button
                variant={section === 'video' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSection('video')}
              >
                Video
              </Button>
              {section !== 'hero' && section !== 'video' && (
                <Button size="sm" onClick={openNew} className="ml-auto">
                  <Plus className="mr-1 h-4 w-4" /> Add
                </Button>
              )}
            </div>

            {loading ? (
              <p className="text-best-muted">Loading…</p>
            ) : section === 'video' ? (
              <section className="rounded-xl border border-best-border bg-best-elevated p-6">
                <h2 className="font-heading text-lg font-bold text-white">How It Works video</h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <Label>Video type</Label>
                    <Select
                      value={videoSettings.videoType}
                      onValueChange={(v) =>
                        setVideoSettings({
                          ...videoSettings,
                          videoType: v as HowItWorksVideoType,
                          videoUrl: v === 'none' ? null : videoSettings.videoUrl,
                        })
                      }
                    >
                      <SelectTrigger className="mt-1 bg-best-bg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (placeholder)</SelectItem>
                        <SelectItem value="upload">Uploaded file</SelectItem>
                        <SelectItem value="youtube">YouTube link</SelectItem>
                        <SelectItem value="vimeo">Vimeo link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {videoSettings.videoType === 'upload' && (
                    <VideoUploadField
                      label="Upload video (MP4/WebM)"
                      value={videoSettings.videoUrl ?? ''}
                      onChange={(url) => setVideoSettings({ ...videoSettings, videoUrl: url })}
                    />
                  )}

                  {(videoSettings.videoType === 'youtube' || videoSettings.videoType === 'vimeo') && (
                    <div>
                      <Label>Video URL</Label>
                      <Input
                        value={videoSettings.videoUrl ?? ''}
                        onChange={(e) =>
                          setVideoSettings({ ...videoSettings, videoUrl: e.target.value })
                        }
                        placeholder={
                          videoSettings.videoType === 'youtube'
                            ? 'https://www.youtube.com/watch?v=...'
                            : 'https://vimeo.com/...'
                        }
                        className="mt-1 bg-best-bg"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Video label (bottom-left badge)</Label>
                    <Input
                      value={videoSettings.label}
                      onChange={(e) =>
                        setVideoSettings({ ...videoSettings, label: e.target.value })
                      }
                      className="mt-1 bg-best-bg"
                    />
                  </div>

                  <ImageUploadField
                    label="Poster image (optional)"
                    value={videoSettings.posterUrl ?? ''}
                    onChange={(url) =>
                      setVideoSettings({ ...videoSettings, posterUrl: url || null })
                    }
                    folder="videos"
                  />
                </div>

                <Button className="mt-6" onClick={saveVideo} disabled={savingVideo}>
                  <Save className="mr-2 h-4 w-4" />
                  {savingVideo ? 'Saving…' : 'Save video'}
                </Button>
              </section>
            ) : (
              <div className="space-y-2">
                {blocks.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-lg border border-best-border bg-best-elevated p-3"
                  >
                    <p className="max-w-xl truncate text-sm text-white">
                      {blockSummary(section as CmsSection, b.payload as Record<string, unknown>)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditing(b);
                          setOpen(true);
                        }}
                      >
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
          <DialogHeader>
            <DialogTitle>Edit {section}</DialogTitle>
          </DialogHeader>
          {editing && section === 'hero' && (
            <div className="space-y-3">
              {HERO_FIELDS.map(({ key, label }) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input
                    value={String(payload[key] ?? '')}
                    onChange={(e) => setPayload(key, e.target.value)}
                    className="mt-1 bg-best-bg"
                  />
                </div>
              ))}
              <HeroPreview payload={payload} />
            </div>
          )}
          {editing && section === 'faq' && (
            <div className="space-y-3">
              <div>
                <Label>Question</Label>
                <Input
                  value={String(payload.question ?? '')}
                  onChange={(e) => setPayload('question', e.target.value)}
                  className="mt-1 bg-best-bg"
                />
              </div>
              <div>
                <Label>Answer</Label>
                <Textarea
                  value={String(payload.answer ?? '')}
                  onChange={(e) => setPayload('answer', e.target.value)}
                  className="mt-1 bg-best-bg"
                />
              </div>
            </div>
          )}
          {editing && section === 'step' && (
            <div className="space-y-3">
              <div>
                <Label>Step number</Label>
                <Input
                  value={String(payload.number ?? '')}
                  onChange={(e) => setPayload('number', e.target.value)}
                  className="mt-1 bg-best-bg"
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={String(payload.title ?? '')}
                  onChange={(e) => setPayload('title', e.target.value)}
                  className="mt-1 bg-best-bg"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={String(payload.description ?? '')}
                  onChange={(e) => setPayload('description', e.target.value)}
                  className="mt-1 bg-best-bg"
                />
              </div>
            </div>
          )}
          {editing && section === 'feature' && (
            <div className="space-y-3">
              <div>
                <Label>Icon</Label>
                <Input
                  value={String(payload.icon ?? 'Zap')}
                  onChange={(e) => setPayload('icon', e.target.value)}
                  className="mt-1 bg-best-bg"
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={String(payload.title ?? '')}
                  onChange={(e) => setPayload('title', e.target.value)}
                  className="mt-1 bg-best-bg"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={String(payload.description ?? '')}
                  onChange={(e) => setPayload('description', e.target.value)}
                  className="mt-1 bg-best-bg"
                />
              </div>
            </div>
          )}
          {editing && section === 'testimonial' && (
            <div className="space-y-3">
              {['name', 'handle', 'quote', 'initials', 'tag'].map((k) => (
                <div key={k}>
                  <Label>{k}</Label>
                  <Input
                    value={String(payload[k] ?? '')}
                    onChange={(e) => setPayload(k, e.target.value)}
                    className="mt-1 bg-best-bg"
                  />
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Switch
                  checked={Boolean(payload.hasVideo)}
                  onCheckedChange={(v) => setPayload('hasVideo', v)}
                />
                <Label>Has video</Label>
              </div>
            </div>
          )}
          {editing && (
            <div className="mt-4 flex items-center gap-2">
              <Switch
                checked={editing.active ?? true}
                onCheckedChange={(a) => setEditing({ ...editing, active: a })}
              />
              <Label>Active</Label>
            </div>
          )}
          <DialogFooter className="mt-4">
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
