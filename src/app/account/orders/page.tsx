import { Suspense } from 'react';
import PurchaseOrdersPage from '@/components/account/PurchaseOrdersPage';

export default function AccountOrdersPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[50vh] items-center justify-center px-6 pt-32">
          <p className="text-best-muted">Loading…</p>
        </main>
      }
    >
      <PurchaseOrdersPage />
    </Suspense>
  );
}
