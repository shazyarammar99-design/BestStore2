'use client';

import Link from 'next/link';
import { ChevronDown, LogOut } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SELLING_LINKS, SETTINGS_LINKS } from '@/data/account-menu';
import { useTranslation } from '@/context/LocaleContext';
import { cn } from '@/lib/utils';

type AccountMobileMenuProps = {
  onNavigate: () => void;
  onSignOut: () => void;
};

export default function AccountMobileMenu({ onNavigate, onSignOut }: AccountMobileMenuProps) {
  const { t } = useTranslation();

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Link
        href="/account"
        onClick={onNavigate}
        className="font-display text-xl font-bold uppercase tracking-widest text-white hover:text-best-cyan"
      >
        {t('account.overview')}
      </Link>
      <Link
        href="/account/orders"
        onClick={onNavigate}
        className="font-display text-xl font-bold uppercase tracking-widest text-white hover:text-best-cyan"
      >
        {t('account.purchaseOrders')}
      </Link>

      <Collapsible>
        <CollapsibleTrigger className="flex w-full items-center justify-between font-display text-xl font-bold uppercase tracking-widest text-white hover:text-best-cyan">
          {t('account.selling')}
          <ChevronDown className="h-5 w-5" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-2 pl-4">
          {SELLING_LINKS.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className="block text-lg text-best-muted hover:text-best-cyan"
            >
              {t(`account.${key}`)}
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible>
        <CollapsibleTrigger className="flex w-full items-center justify-between font-display text-xl font-bold uppercase tracking-widest text-white hover:text-best-cyan">
          {t('account.settings')}
          <ChevronDown className="h-5 w-5" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-2 pl-4">
          {SETTINGS_LINKS.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className="block text-lg text-best-muted hover:text-best-cyan"
            >
              {t(`account.${key}`)}
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <button
        type="button"
        onClick={onSignOut}
        className={cn(
          'mt-2 flex items-center gap-2 font-display text-xl font-bold uppercase tracking-widest text-white hover:text-best-gold'
        )}
      >
        <LogOut className="h-6 w-6" />
        {t('account.signOut')}
      </button>
    </div>
  );
}
