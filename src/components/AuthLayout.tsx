'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useBrandingSettings } from '@/hooks/useSiteSettings';

const ParticleCanvas = dynamic(() => import('@/components/ParticleCanvas'), { ssr: false });

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  const { settings } = useBrandingSettings();

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6 py-28">
      <ParticleCanvas />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0B0C10_95%)]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-panel rounded-2xl border border-best-border p-8 shadow-cyan-glow">
          <div className="flex flex-col items-center text-center">
            <Link href="/" aria-label={`${settings.siteName} — Home`} className="mb-6 inline-block">
              <img
                src={settings.logoUrl}
                alt={settings.siteName}
                className="h-14 w-auto object-contain"
              />
            </Link>
            <h1 className="font-display text-2xl font-bold uppercase tracking-widest text-white">
              {title}
            </h1>
            <p className="mt-2 text-sm text-best-muted">{subtitle}</p>
          </div>

          <div className="mt-8">{children}</div>

          <div className="mt-6 text-center text-sm text-best-muted">{footer}</div>
        </div>
      </div>
    </main>
  );
}
