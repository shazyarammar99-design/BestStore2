'use client';

import { useTranslation } from '@/context/LocaleContext';
import AccountSecuritySection from '@/components/account/AccountSecuritySection';

export default function AccountSettingsPrivacy() {
  const { t } = useTranslation();

  return (
    <section className="rounded-xl border border-best-border bg-best-elevated p-6">
      <h2 className="font-heading text-xs font-bold uppercase tracking-widest text-best-muted">
        {t('account.securitySection')}
      </h2>
      <div className="mt-6">
        <AccountSecuritySection />
      </div>
    </section>
  );
}
