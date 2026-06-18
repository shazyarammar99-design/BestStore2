'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { useFormatCurrency, useTranslation } from '@/context/LocaleContext';
import { fetchProfileSummary } from '@/lib/profile/client';
import type { ProfileSummary } from '@/app/api/profile/summary/route';
import { SELLING_LINKS, SETTINGS_LINKS } from '@/data/account-menu';
import { cn } from '@/lib/utils';

type ProfileDropdownProps = {
  className?: string;
};

export default function ProfileDropdown({ className }: ProfileDropdownProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { t } = useTranslation();
  const formatPrice = useFormatCurrency();
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [open, setOpen] = useState(false);
  const [sellingOpen, setSellingOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const initials = (profile?.username ?? user?.email ?? '?').slice(0, 1).toUpperCase();

  useEffect(() => {
    if (open) {
      void fetchProfileSummary().then(setSummary);
    }
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    toast.success(t('account.signedOut'));
    router.push('/');
  };

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('nav.account')}
          className={cn(
            'hidden h-10 w-10 overflow-hidden rounded-full border-2 border-best-border transition-colors hover:border-best-cyan sm:flex',
            className
          )}
        >
          <Avatar className="h-full w-full">
            <AvatarImage
              src={profile?.avatar_url ?? undefined}
              alt={profile?.username ?? t('nav.account')}
            />
            <AvatarFallback className="bg-best-elevated font-heading text-xs font-bold text-best-cyan">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 border-best-border bg-best-elevated p-0 text-white shadow-xl"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="border-b border-best-border p-4">
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <Avatar className="h-12 w-12 border border-best-border">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.username ?? ''} />
                <AvatarFallback className="bg-best-cyan/20 font-heading font-bold text-best-cyan">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-best-elevated bg-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-heading text-sm font-bold text-white">
                {profile?.username ?? user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-best-muted">
                {t('account.level', { level: summary?.level ?? 1 })}
              </p>
              <p className="text-xs text-best-muted">
                {t('account.accountId', { id: summary?.account_id ?? '—' })}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-b border-best-border px-4 py-3 text-sm">
          <div className="flex justify-between text-best-muted">
            <span>{t('account.spinCredits')}</span>
            <span className="font-semibold text-white">{summary?.spin_credits ?? 0}</span>
          </div>
          <div className="flex justify-between text-best-muted">
            <span>{t('account.monthlyPoints')}</span>
            <span className="font-semibold text-white">{summary?.monthly_points ?? 0}</span>
          </div>
          <div className="flex justify-between text-best-muted">
            <span>{t('account.availableBalance')}</span>
            <span className="font-semibold text-white">{formatPrice(0)}</span>
          </div>
          <Button
            type="button"
            onClick={() => navigate('/spin')}
            className="mt-1 w-full bg-best-gold font-heading text-xs font-bold uppercase tracking-widest text-best-bg hover:bg-best-gold/90"
          >
            {t('account.spinAndWin')}
          </Button>
        </div>

        <nav className="py-1">
          <button
            type="button"
            onClick={() => navigate('/account')}
            className="flex w-full px-4 py-2.5 text-left text-sm text-white transition-colors hover:bg-best-border/40"
          >
            {t('account.overview')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/account/orders')}
            className="flex w-full px-4 py-2.5 text-left text-sm text-white transition-colors hover:bg-best-border/40"
          >
            {t('account.purchaseOrders')}
          </button>

          <Collapsible open={sellingOpen} onOpenChange={setSellingOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-white transition-colors hover:bg-best-border/40">
              {t('account.selling')}
              <ChevronDown
                className={cn('h-4 w-4 text-best-muted transition-transform', sellingOpen && 'rotate-180')}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-best-bg/40">
              {SELLING_LINKS.map(({ href, key }) => (
                <button
                  key={href}
                  type="button"
                  onClick={() => navigate(href)}
                  className="flex w-full py-2 pl-8 pr-4 text-left text-sm text-best-muted transition-colors hover:bg-best-border/30 hover:text-white"
                >
                  {t(`account.${key}`)}
                </button>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-white transition-colors hover:bg-best-border/40">
              {t('account.settings')}
              <ChevronDown
                className={cn('h-4 w-4 text-best-muted transition-transform', settingsOpen && 'rotate-180')}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-best-bg/40">
              {SETTINGS_LINKS.map(({ href, key }) => (
                <button
                  key={href}
                  type="button"
                  onClick={() => navigate(href)}
                  className="flex w-full py-2 pl-8 pr-4 text-left text-sm text-best-muted transition-colors hover:bg-best-border/30 hover:text-white"
                >
                  {t(`account.${key}`)}
                </button>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <div className="my-1 border-t border-best-border" />
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white transition-colors hover:bg-best-border/40"
          >
            <LogOut className="h-4 w-4" />
            {t('account.signOut')}
          </button>
        </nav>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
