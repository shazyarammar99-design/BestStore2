'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShoppingBag, Settings, User, Gift } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { fetchProfileSummary } from '@/lib/profile/client';
import { fetchMyInventory } from '@/lib/inventory/client';
import { formatPrizeEffectPreview } from '@/lib/spin/prize-effects';
import { localizePrizeName } from '@/i18n/catalog';
import { useFormatCurrency, useTranslation } from '@/context/LocaleContext';
import type { Order, OrderItemSnapshot } from '@/types/orders';
import type { ProfileSummary } from '@/app/api/profile/summary/route';
import { fetchMyOrders } from '@/lib/orders/client';
import { shortOrderId } from '@/lib/orders/utils';
import type { InventoryItem } from '@/types/spin';
import { cn } from '@/lib/utils';

function itemsPreview(items: OrderItemSnapshot[]): string {
  const first = items[0];
  if (!first) return '';
  const name = first.variantLabel ? `${first.productName} — ${first.variantLabel}` : first.productName;
  return first.quantity > 1 ? `${first.quantity}x ${name}` : name;
}

export default function AccountOverview() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { t, locale } = useTranslation();
  const formatPrice = useFormatCurrency();
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [rewards, setRewards] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchProfileSummary(), fetchMyOrders(), fetchMyInventory()]).then(
      ([s, o, inv]) => {
        setSummary(s);
        setOrders(o.slice(0, 3));
        setRewards(inv);
        setLoading(false);
      }
    );
  }, []);

  const displayName = profile?.username ?? user?.email?.split('@')[0] ?? 'Player';

  return (
    <main className="px-6 pb-24 pt-32">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10">
          <p className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-best-cyan">
            {t('account.eyebrow')}
          </p>
          <h1 className="mt-2 font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl md:text-4xl">
            {t('account.overviewTitle')}
          </h1>
          <p className="mt-2 text-best-muted">
            {t('account.overviewWelcome', { name: displayName })}
          </p>
        </header>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: t('account.level', { level: summary?.level ?? 1 }), sub: t('account.monthlyPoints') },
            { label: String(summary?.monthly_points ?? 0), sub: t('account.monthlyPoints') },
            { label: String(summary?.spin_credits ?? 0), sub: t('account.spinCredits') },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-xl border border-best-border bg-best-elevated p-5"
            >
              <p className="font-display text-2xl font-black text-white">{stat.label}</p>
              <p className="mt-1 text-sm text-best-muted">{stat.sub}</p>
            </div>
          ))}
        </div>

        <section className="mb-8 rounded-xl border border-best-border bg-best-elevated p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-best-muted">
              {t('account.overviewRecentOrders')}
            </h2>
            <Link
              href="/account/orders"
              className="flex items-center gap-1 text-sm font-semibold text-best-cyan hover:underline"
            >
              {t('account.overviewViewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-best-caption">{t('common.loading')}</p>
          ) : orders.length === 0 ? (
            <p className="mt-6 text-sm text-best-caption">{t('account.ordersEmpty')}</p>
          ) : (
            <ul className="mt-6 space-y-3">
              {orders.map((order) => {
                const items = (order.items_json ?? []) as OrderItemSnapshot[];
                return (
                  <li
                    key={order.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-best-border/60 bg-best-bg/50 p-4"
                  >
                    <div>
                      <p className="font-mono text-sm font-bold text-white">
                        #{shortOrderId(order.id)}
                      </p>
                      <p className="mt-1 text-sm text-best-muted">{itemsPreview(items)}</p>
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
                        order.status === 'delivered'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : order.status === 'cancelled'
                            ? 'bg-red-500/15 text-red-400'
                            : order.status === 'confirmed'
                              ? 'bg-best-cyan/15 text-best-cyan'
                              : 'bg-amber-500/15 text-amber-400'
                      )}
                    >
                      {order.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mb-8 rounded-xl border border-best-border bg-best-elevated p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-widest text-best-muted">
              <Gift className="h-4 w-4 text-best-gold" />
              {t('account.spinRewardsTitle')}
            </h2>
            <Link
              href="/checkout"
              className="text-sm font-semibold text-best-cyan hover:underline"
            >
              {t('account.spinRewardsUseAtCheckout')}
            </Link>
          </div>
          {loading ? (
            <p className="mt-6 text-sm text-best-caption">{t('common.loading')}</p>
          ) : rewards.length === 0 ? (
            <p className="mt-6 text-sm text-best-caption">{t('account.spinRewardsEmptyAccount')}</p>
          ) : (
            <ul className="mt-6 space-y-3">
              {rewards.map((item) => (
                <li
                  key={item.inventoryId}
                  className="flex items-center justify-between gap-3 rounded-lg border border-best-border/60 bg-best-bg/50 p-4"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {localizePrizeName(item.prize.name, locale)}
                    </p>
                    <p className="text-xs text-best-muted">
                      {formatPrizeEffectPreview(
                        item.prize.prize_type,
                        item.prize.value,
                        formatPrice
                      )}
                    </p>
                  </div>
                  <span className="rounded-full bg-best-gold/15 px-2.5 py-0.5 text-xs font-bold text-best-gold">
                    x{item.quantity}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-widest text-best-muted">
            {t('account.overviewQuickLinks')}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/account/orders"
              className="flex items-center gap-3 rounded-xl border border-best-border bg-best-elevated p-4 transition-colors hover:border-best-cyan/40"
            >
              <ShoppingBag className="h-5 w-5 text-best-cyan" />
              <span className="font-heading text-sm font-semibold text-white">
                {t('account.purchaseOrders')}
              </span>
            </Link>
            <Link
              href="/account/settings/account"
              className="flex items-center gap-3 rounded-xl border border-best-border bg-best-elevated p-4 transition-colors hover:border-best-cyan/40"
            >
              <User className="h-5 w-5 text-best-cyan" />
              <span className="font-heading text-sm font-semibold text-white">
                {t('account.settingsAccount')}
              </span>
            </Link>
            <Link
              href="/spin"
              className="flex items-center gap-3 rounded-xl border border-best-border bg-best-elevated p-4 transition-colors hover:border-best-gold/40"
            >
              <Sparkles className="h-5 w-5 text-best-gold" />
              <span className="font-heading text-sm font-semibold text-white">
                {t('account.spinAndWin')}
              </span>
            </Link>
            <Link
              href="/account/settings/privacy"
              className="flex items-center gap-3 rounded-xl border border-best-border bg-best-elevated p-4 transition-colors hover:border-best-cyan/40"
            >
              <Settings className="h-5 w-5 text-best-cyan" />
              <span className="font-heading text-sm font-semibold text-white">
                {t('account.settingsPrivacy')}
              </span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
