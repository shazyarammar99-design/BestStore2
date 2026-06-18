'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/LocaleContext';
import { useProfile } from '@/context/ProfileContext';

export default function AccountProfileForm() {
  const { t } = useTranslation();
  const { profile, updateUsername } = useProfile();
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.username) setUsername(profile.username);
  }, [profile?.username]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const error = await updateUsername(username);
    setSaving(false);

    if (error) {
      toast.error(error);
      return;
    }
    toast.success(t('account.usernameUpdated'));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="mb-1.5 block font-heading text-xs font-semibold uppercase tracking-widest text-best-muted">
          {t('account.username')}
        </label>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={2}
          maxLength={32}
          className="h-11 border-best-border bg-best-bg text-white focus-visible:border-best-cyan focus-visible:ring-0"
        />
      </div>
      <Button
        type="submit"
        disabled={saving || username === profile?.username}
        className="h-11 bg-best-cyan font-heading text-sm font-bold uppercase tracking-widest text-best-bg hover:bg-best-cyan/90"
      >
        {saving ? t('common.loading') : t('common.save')}
      </Button>
    </form>
  );
}
