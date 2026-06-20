'use client';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LocaleContext';
import AccountAvatarUpload from '@/components/account/AccountAvatarUpload';
import AccountProfileForm from '@/components/account/AccountProfileForm';

export default function AccountSettingsAccount() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <section className="rounded-xl border border-best-border bg-best-elevated p-6">
      <h2 className="font-heading text-xs font-bold uppercase tracking-widest text-best-muted">
        {t('account.profileSection')}
      </h2>
      <div className="mt-6">
        <AccountAvatarUpload email={user?.email ?? ''} />
      </div>
      <div className="mt-8 border-t border-best-border pt-6">
        <AccountProfileForm />
      </div>
      <div className="mt-6">
        <label className="mb-1.5 block font-heading text-xs font-semibold uppercase tracking-widest text-best-muted">
          {t('auth.email')}
        </label>
        <p className="text-sm text-white">{user?.email}</p>
      </div>
    </section>
  );
}
