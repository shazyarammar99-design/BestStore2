'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';
import { DEFAULT_BRANDING_SETTINGS, type BrandingSettings } from '@/types/site-settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUploadField from '@/components/admin/ImageUploadField';

export default function AdminBrandingPage() {
  const [settings, setSettings] = useState<BrandingSettings>(DEFAULT_BRANDING_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch('/api/admin/branding');
    const json = await res.json();
    if (res.ok) setSettings({ ...DEFAULT_BRANDING_SETTINGS, ...json.settings });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    const res = await adminFetch('/api/admin/branding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error ?? 'Save failed');
      return;
    }
    toast.success('Branding saved');
  };

  if (loading) return <p className="text-best-muted">Loading branding…</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight">Branding</h1>
        <p className="mt-1 text-sm text-best-muted">
          Update the site logo, browser tab icon, and site name.
        </p>
      </div>

      <section className="rounded-xl border border-best-border bg-best-elevated p-6">
        <div className="space-y-4">
          <div>
            <Label>Site name</Label>
            <Input
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="mt-1 bg-best-bg"
            />
          </div>

          <ImageUploadField
            label="Logo (header & auth pages)"
            value={settings.logoUrl}
            onChange={(url) => setSettings({ ...settings, logoUrl: url })}
            folder="branding"
          />

          <ImageUploadField
            label="Favicon (browser tab icon, optional)"
            value={settings.faviconUrl ?? ''}
            onChange={(url) => setSettings({ ...settings, faviconUrl: url || null })}
            folder="branding"
          />
          <p className="text-xs text-best-caption">
            If favicon is empty, the generated &quot;B&quot; icon is used. Upload a square PNG for best results.
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-best-border bg-best-bg p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-best-caption">Preview</p>
          <div className="flex items-center gap-3">
            <img
              src={settings.logoUrl}
              alt={settings.siteName}
              className="h-10 w-auto object-contain"
            />
            <span className="font-display text-sm font-bold text-white">{settings.siteName}</span>
          </div>
        </div>

        <Button className="mt-6" onClick={save} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving…' : 'Save branding'}
        </Button>
      </section>
    </div>
  );
}
