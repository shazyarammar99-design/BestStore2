import { Suspense } from 'react';
import AccountPageContent from '@/components/account/AccountPageContent';

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[50vh] items-center justify-center px-6 pt-32">
          <p className="text-best-muted">Loading…</p>
        </main>
      }
    >
      <AccountPageContent />
    </Suspense>
  );
}
