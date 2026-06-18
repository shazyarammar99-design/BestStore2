import { Suspense } from 'react';
import CheckoutSuccessClient from './CheckoutSuccessClient';

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="px-6 pb-24 pt-32">
          <div className="mx-auto max-w-lg rounded-2xl border border-best-border bg-best-elevated p-10 text-center">
            <p className="text-best-muted">Loading…</p>
          </div>
        </main>
      }
    >
      <CheckoutSuccessClient />
    </Suspense>
  );
}
