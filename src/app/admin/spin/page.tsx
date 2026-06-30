'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Save, Wand2 } from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';
import { DEFAULT_SPIN_SETTINGS, type SpinSettings } from '@/types/site-settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ImageUploadField from '@/components/admin/ImageUploadField';
import { PRIZE_TYPES, type PrizeType } from '@/lib/spin/prize-effects';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type PrizeRow = {
  id: string;
  name: string;
  probability_weight: number;
  image_url: string | null;
  value: number;
  active: boolean;
  prize_type: PrizeType;
  winPercent: number;
};

type PrizeForm = {
  id?: string;
  name: string;
  probability_weight: number;
  value: number;
  image_url: string;
  active: boolean;
  prize_type: PrizeType;
};

const emptyPrize = (): PrizeForm => ({
  name: '',
  probability_weight: 10,
  value: 0,
  image_url: '',
  active: true,
  prize_type: 'fixed_off',
});

export default function AdminSpinPage() {
  const [settings, setSettings] = useState<SpinSettings>(DEFAULT_SPIN_SETTINGS);
  const [prizes, setPrizes] = useState<PrizeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PrizeForm | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [settingsRes, prizesRes] = await Promise.all([
      adminFetch('/api/admin/spin/settings'),
      adminFetch('/api/admin/spin/prizes'),
    ]);
    const settingsJson = await settingsRes.json();
    const prizesJson = await prizesRes.json();
    if (settingsRes.ok) setSettings({ ...DEFAULT_SPIN_SETTINGS, ...settingsJson.settings });
    if (prizesRes.ok) setPrizes(prizesJson.prizes ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveSettings = async () => {
    setSavingSettings(true);
    const res = await adminFetch('/api/admin/spin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSavingSettings(false);
    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error ?? 'Failed to save settings');
      return;
    }
    toast.success('Wheel settings saved');
  };

  const openNew = () => {
    setEditing(emptyPrize());
    setOpen(true);
  };

  const openEdit = (p: PrizeRow) => {
    setEditing({
      id: p.id,
      name: p.name,
      probability_weight: p.probability_weight,
      value: p.value,
      image_url: p.image_url ?? '',
      active: p.active,
      prize_type: p.prize_type ?? 'fixed_off',
    });
    setOpen(true);
  };

  const savePrize = async () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast.error('Prize name required');
      return;
    }

    const payload = {
      name: editing.name,
      probability_weight: editing.probability_weight,
      value: editing.value,
      image_url: editing.image_url || null,
      active: editing.active,
      prize_type: editing.prize_type,
    };

    const isNew = !editing.id;
    const res = isNew
      ? await adminFetch('/api/admin/spin/prizes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      : await adminFetch(`/api/admin/spin/prizes/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error ?? 'Save failed');
      return;
    }

    toast.success(isNew ? 'Prize added' : 'Prize updated');
    setOpen(false);
    load();
  };

  const removePrize = async (id: string) => {
    if (!confirm('Delete this prize? It will be removed from the wheel.')) return;
    
    setLoading(true);
    const res = await adminFetch(`/api/admin/spin/prizes/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error('Failed to remove prize');
      setLoading(false);
      return;
    }
    
    // Auto-fix weights for the remaining active prizes
    const remainingActive = prizes.filter((p) => p.active && p.id !== id);
    const currentTotal = remainingActive.reduce((s, p) => s + p.probability_weight, 0);
    
    if (currentTotal > 0 && remainingActive.length > 0) {
      for (const p of remainingActive) {
        let newWeight = (p.probability_weight / currentTotal) * 100;
        newWeight = Math.round(newWeight * 100) / 100;
        
        await adminFetch(`/api/admin/spin/prizes/${p.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: p.name,
            probability_weight: newWeight,
            value: p.value,
            image_url: p.image_url || null,
            active: p.active,
            prize_type: p.prize_type,
          }),
        });
      }
      toast.success('Prize deleted and weights auto-fixed to 100');
    } else {
      toast.success('Prize deleted');
    }
    
    load();
  };

  const autoFixWeights = async () => {
    const activePrizes = prizes.filter((p) => p.active);
    const currentTotal = activePrizes.reduce((s, p) => s + p.probability_weight, 0);

    if (currentTotal === 0) {
      toast.error('Total weight is 0. Cannot auto-fix.');
      return;
    }
    
    if (currentTotal === 100) {
      toast.info('Weights already sum to 100!');
      return;
    }

    if (!confirm('This will adjust all active prize weights so they sum exactly to 100. Continue?')) return;

    setLoading(true);
    let successCount = 0;

    for (const p of activePrizes) {
      let newWeight = (p.probability_weight / currentTotal) * 100;
      newWeight = Math.round(newWeight * 100) / 100; // Keep up to 2 decimal places

      const payload = {
        name: p.name,
        probability_weight: newWeight,
        value: p.value,
        image_url: p.image_url || null,
        active: p.active,
        prize_type: p.prize_type,
      };

      const res = await adminFetch(`/api/admin/spin/prizes/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) successCount++;
    }

    if (successCount === activePrizes.length) {
      toast.success('Weights auto-fixed to 100');
    } else {
      toast.warning(`Updated ${successCount} out of ${activePrizes.length} prizes`);
    }

    load();
  };

  const totalWeight = prizes.filter((p) => p.active).reduce((s, p) => s + p.probability_weight, 0);

  if (loading) return <p className="text-best-muted">Loading spin wheel…</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight">Spin Wheel</h1>
        <p className="mt-1 text-sm text-best-muted">
          Manage prizes, odds, and wheel animation settings.
        </p>
      </div>

      <section className="rounded-xl border border-best-border bg-best-elevated p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-white">Spin mode</h2>
            <p className="mt-1 max-w-xl text-sm text-best-muted">
              Test mode lets you spin without credits, daily limits, or saving prizes to inventory.
              Turn it off for live production rules.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-best-border bg-best-bg px-4 py-3">
            <Switch
              checked={settings.testMode}
              onCheckedChange={(v) => setSettings({ ...settings, testMode: v })}
            />
            <div>
              <Label className="text-white">
                {settings.testMode ? 'Test mode' : 'Live mode'}
              </Label>
              <p className="text-xs text-best-caption">
                {settings.testMode ? 'Unlimited test spins' : 'Real credits & limits'}
              </p>
            </div>
          </div>
        </div>
        {settings.testMode && (
          <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
            Test mode is ON — customers can spin freely. Disable before going live.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-best-border bg-best-elevated p-6">
        <h2 className="font-heading text-lg font-bold text-white">Wheel settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Full rotations before stop</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={settings.extraTurns}
              onChange={(e) =>
                setSettings({ ...settings, extraTurns: Number(e.target.value) })
              }
              className="mt-1 bg-best-bg"
            />
            <p className="mt-1 text-xs text-best-caption">e.g. 7 = spins 7 full turns then lands</p>
          </div>
          <div>
            <Label>Spin duration (ms)</Label>
            <Input
              type="number"
              min={1000}
              max={15000}
              step={100}
              value={settings.spinDurationMs}
              onChange={(e) =>
                setSettings({ ...settings, spinDurationMs: Number(e.target.value) })
              }
              className="mt-1 bg-best-bg"
            />
          </div>
          <div>
            <Label>Min purchase for spin credit (IQD)</Label>
            <Input
              type="number"
              min={0}
              value={settings.minPurchaseIqd}
              onChange={(e) =>
                setSettings({ ...settings, minPurchaseIqd: Number(e.target.value) })
              }
              className="mt-1 bg-best-bg"
            />
          </div>
        </div>
        <Button className="mt-4" onClick={saveSettings} disabled={savingSettings}>
          <Save className="mr-2 h-4 w-4" />
          {savingSettings ? 'Saving…' : 'Save settings'}
        </Button>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-white">Prizes</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={autoFixWeights} disabled={prizes.length === 0}>
              <Wand2 className="mr-1 h-4 w-4" /> Auto-fix weights
            </Button>
            <Button size="sm" onClick={openNew}>
              <Plus className="mr-1 h-4 w-4" /> Add prize
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {prizes.filter(p => p.active).map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-best-border bg-best-elevated p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">{p.name}</p>
                <p className="text-xs text-best-muted">
                  Weight {p.probability_weight} · {p.winPercent}% chance · Value {p.value} ·{' '}
                  {p.prize_type.replace('_', ' ')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => removePrize(p.id)}>
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
          {prizes.filter(p => p.active).length === 0 && (
            <p className="text-sm text-best-muted">No prizes yet. Add your first prize.</p>
          )}
        </div>
        {totalWeight > 0 && (
          <p className="mt-3 text-xs text-best-caption">
            Total active weight: {totalWeight} (percentages are relative to this total)
          </p>
        )}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-best-border bg-best-elevated text-white">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit prize' : 'New prize'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="mt-1 bg-best-bg"
                />
              </div>
              <div>
                <Label>Chance weight</Label>
                <Input
                  type="number"
                  min={1}
                  value={editing.probability_weight}
                  onChange={(e) =>
                    setEditing({ ...editing, probability_weight: Number(e.target.value) })
                  }
                  className="mt-1 bg-best-bg"
                />
              </div>
              <div>
                <Label>Prize type</Label>
                <Select
                  value={editing.prize_type}
                  onValueChange={(v) =>
                    setEditing({ ...editing, prize_type: v as PrizeType })
                  }
                >
                  <SelectTrigger className="mt-1 bg-best-bg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIZE_TYPES.map((pt) => (
                      <SelectItem key={pt.value} value={pt.value}>
                        {pt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prize value</Label>
                <Input
                  type="number"
                  value={editing.value}
                  onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })}
                  className="mt-1 bg-best-bg"
                />
              </div>
              <ImageUploadField
                label="Prize image (optional)"
                value={editing.image_url}
                onChange={(url) => setEditing({ ...editing, image_url: url })}
                folder="prizes"
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={editing.active}
                  onCheckedChange={(v) => setEditing({ ...editing, active: v })}
                />
                <Label>Active on wheel</Label>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePrize}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
