'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LocaleContext';
import { Button } from '@/components/ui/button';
import AccountAvatarUpload from '@/components/account/AccountAvatarUpload';
import AccountProfileForm from '@/components/account/AccountProfileForm';
import AccountSecuritySection from '@/components/account/AccountSecuritySection';
import AccountOrdersSection from '@/components/account/AccountOrdersSection';

export default function AccountPageContent() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/account');
    }
  }, [loading, user, router]);

  const handleSignOut = async () => {
    await signOut();
    toast.success(t('account.signedOut'));
    router.push('/');
  };

  if (loading || !user) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center px-6 pt-32">
        <p className="text-best-muted">{t('common.loading')}</p>
      </main>
    );
  }

  return (
    <main className="px-6 pb-24 pt-32">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10">
          <p className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-best-cyan">
            {t('account.eyebrow')}
          </p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-white">
            {t('account.title')}
          </h1>
        </header>

        <div className="space-y-6">
          <section className="rounded-xl border border-best-border bg-best-elevated p-6">
            <h2 className="font-heading text-xs font-bold uppercase tracking-widest text-best-muted">
              {t('account.profileSection')}
            </h2>
            <div className="mt-6">
              <AccountAvatarUpload email={user.email ?? ''} />
            </div>
            <div className="mt-8 border-t border-best-border pt-6">
              <AccountProfileForm />
            </div>
            <div className="mt-6">
              <label className="mb-1.5 block font-heading text-xs font-semibold uppercase tracking-widest text-best-muted">
                {t('auth.email')}
              </label>
              <p className="text-sm text-white">{user.email}</p>
            </div>
          </section>

          <AccountOrdersSection />

          <section className="rounded-xl border border-best-border bg-best-elevated p-6">
            <h2 className="font-heading text-xs font-bold uppercase tracking-widest text-best-muted">
              {t('account.securitySection')}
            </h2>
            <div className="mt-6">
              <AccountSecuritySection />
            </div>
          </section>

          <Button
            type="button"
            variant="outline"
            onClick={handleSignOut}
            className="w-full border-best-border py-6 font-heading text-sm font-bold uppercase tracking-widest text-best-muted hover:border-red-500/40 hover:text-red-400"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t('account.signOut')}
          </Button>
        </div>
      </div>
    </main>
  );
}
