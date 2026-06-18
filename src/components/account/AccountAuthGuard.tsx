'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LocaleContext';

export default function AccountAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/account');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center px-6 pt-32">
        <p className="text-best-muted">{t('common.loading')}</p>
      </main>
    );
  }

  return <>{children}</>;
}
