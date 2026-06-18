'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Bitcoin,
  Banknote,
  Smartphone,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';
import { CATEGORIES } from '@/data';
import { type PaymentMethod } from '@/lib/payment-methods';
import { useTranslation } from '@/context/LocaleContext';
import { useAuth } from '@/context/AuthContext';
import { localizeCategory } from '@/i18n/catalog';
import { transliterateBest } from '@/i18n/transliterate';

const WHATSAPP_URL = 'https://wa.me/9647503220525';
const DISCORD_URL = 'https://discord.gg/SMw5HBnmMc';

const PAYMENT_ICONS: Record<string, LucideIcon> = {
  CreditCard,
  Bitcoin,
  Banknote,
  Smartphone,
  MessageCircle,
};

export default function Footer() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const { t, locale } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    fetch('/api/payment-methods')
      .then((r) => r.json())
      .then((data) => setPaymentMethods(data.methods ?? []))
      .catch(() => {});
  }, []);

  return (
    <footer className="border-t border-best-border bg-best-elevated/40">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div
          className={`grid grid-cols-1 gap-10 sm:grid-cols-2 ${user ? 'lg:grid-cols-4' : 'lg:grid-cols-5'}`}
        >
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-white">
              {t('footer.categories')}
            </h3>
            <ul className="mt-4 space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.id}`}
                    className="text-sm text-best-muted transition-colors hover:text-best-cyan"
                  >
                    {localizeCategory({ ...cat, slug: cat.id }, locale).name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-white">
              {t('footer.support')}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-best-muted transition-colors hover:text-best-cyan"
                >
                  {t('footer.whatsapp')}
                </a>
              </li>
              <li>
                <a
                  href={DISCORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-best-muted transition-colors hover:text-best-cyan"
                >
                  {t('footer.discord')}
                </a>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="text-sm text-best-muted transition-colors hover:text-best-cyan"
                >
                  {t('sections.faq')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-white">
              {t('footer.legal')}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-best-muted transition-colors hover:text-best-cyan"
                >
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-best-muted transition-colors hover:text-best-cyan"
                >
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>

          {!user && (
            <div>
              <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-white">
                {t('auth.login')}
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-best-muted transition-colors hover:text-best-cyan"
                  >
                    {t('nav.login')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-sm text-best-muted transition-colors hover:text-best-cyan"
                  >
                    {t('auth.signup')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/checkout"
                    className="text-sm text-best-muted transition-colors hover:text-best-cyan"
                  >
                    {t('cart.checkout')}
                  </Link>
                </li>
              </ul>
            </div>
          )}

          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-white">
              {t('footer.paymentMethods')}
            </h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {paymentMethods.map((method) => {
                const Icon = PAYMENT_ICONS[method.icon] || CreditCard;
                return (
                  <div
                    key={method.slug}
                    title={method.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-best-border bg-best-bg text-best-muted"
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-best-border pt-8">
          <p className="text-center text-sm text-best-caption sm:text-left">
            {transliterateBest(t('footer.copyright', { year: new Date().getFullYear() }), locale)}
          </p>
        </div>
      </div>
    </footer>
  );
}
