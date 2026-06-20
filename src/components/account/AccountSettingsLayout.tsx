'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Share2, Shield, BadgeCheck } from 'lucide-react';
import { SETTINGS_LINKS, type SettingsMenuKey } from '@/data/account-menu';
import { useTranslation } from '@/context/LocaleContext';
import { cn } from '@/lib/utils';

const ICONS: Record<SettingsMenuKey, typeof User> = {
  settingsAccount: User,
  settingsSocial: Share2,
  settingsPrivacy: Shield,
  settingsVerification: BadgeCheck,
} as const;

export default function AccountSettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <main className="px-6 pb-24 pt-32">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row">
        <aside className="shrink-0 lg:w-56">
          <h1 className="mb-4 font-display text-2xl font-black uppercase tracking-tight text-white">
            {t('account.settings')}
          </h1>
          <nav className="space-y-1 rounded-xl border border-best-border bg-best-elevated p-2">
            {SETTINGS_LINKS.map(({ href, key }) => {
              const Icon = ICONS[key];
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-best-border/60 text-white'
                      : 'text-best-muted hover:bg-best-border/30 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {t(`account.${key}`)}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </main>
  );
}
