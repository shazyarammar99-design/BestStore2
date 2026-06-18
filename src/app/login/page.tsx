import { Suspense } from 'react';
import LoginPageContent from '@/components/login/LoginPageContent';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[50vh] items-center justify-center px-6 pt-32">
          <p className="text-best-muted">Loading…</p>
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
