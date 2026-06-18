'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Search } from 'lucide-react';
import { fetchMyOrders } from '@/lib/orders/client';
import { filterOrders, orderStatusLabelKey, ordersForTab } from '@/lib/orders/account-filters';
import { shortOrderId } from '@/lib/orders/utils';
import { ORDER_TABS, type OrderTabId } from '@/data/account-menu';
import type { Order, OrderItemSnapshot } from '@/types/orders';
import { useFormatCurrency, useTranslation } from '@/context/LocaleContext';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const TAB_PARAM_MAP: Record<string, OrderTabId> = {
  'to-pay': 'to-pay',
  verify: 'verify',
  preparing: 'preparing',
  delivering: 'delivering',
  completed: 'completed',
  cancelled: 'cancelled',
  resolution: 'resolution',
};

function formatPlacedDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_PILL: Record<Order['status'], string> = {
  pending: 'border-amber-500/40 text-amber-400',
  confirmed: 'border-best-cyan/40 text-best-cyan',
  delivered: 'border-emerald-500/40 text-emerald-400',
  cancelled: 'border-red-500/40 text-red-400',
};

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const formatPrice = useFormatCurrency();

  const tabParam = searchParams?.get('tab') ?? 'completed';
  const activeTab: OrderTabId = TAB_PARAM_MAP[tabParam] ?? 'completed';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchMyOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const setTab = useCallback(
    (tab: OrderTabId) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      params.set('tab', tab);
      router.replace(`/account/orders?${params.toString()}`);
    },
    [router, searchParams]
  );

  const filtered = useMemo(() => {
    const byTab = ordersForTab(orders, activeTab);
    return filterOrders(byTab, search, fromDate, toDate);
  }, [orders, activeTab, search, fromDate, toDate]);

  return (
    <main className="px-6 pb-24 pt-32">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
          {t('account.ordersTitle')}
        </h1>

        <div className="mt-6 flex gap-1 overflow-x-auto border-b border-best-border pb-px">
          {ORDER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={cn(
                'shrink-0 px-4 py-3 text-sm font-semibold transition-colors',
                activeTab === tab.id
                  ? 'border-b-2 border-best-cyan text-best-cyan'
                  : 'text-best-muted hover:text-white'
              )}
            >
              {t(`account.${tab.labelKey}`)}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-best-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('account.ordersSearchPlaceholder')}
              className="border-best-border bg-best-elevated pl-10 text-white placeholder:text-best-caption"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-best-muted" />
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border-best-border bg-best-elevated pl-10 text-white sm:w-40"
                aria-label="From date"
              />
            </div>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-best-muted" />
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border-best-border bg-best-elevated pl-10 text-white sm:w-40"
                aria-label="To date"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <p className="mt-10 text-sm text-best-muted">{t('common.loading')}</p>
        ) : filtered.length === 0 ? (
          <p className="mt-10 text-sm text-best-muted">{t('account.ordersEmpty')}</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {filtered.map((order) => {
              const items = (order.items_json ?? []) as OrderItemSnapshot[];
              return (
                <li
                  key={order.id}
                  className="rounded-xl border border-best-border bg-best-elevated p-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-best-border/60 pb-4">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="text-sm font-semibold text-white">
                        {t('account.ordersOrderNo', { id: order.id.toUpperCase() })}
                      </span>
                      <span className="text-xs text-best-muted">
                        {t('account.ordersPlacedOn', { date: formatPlacedDate(order.created_at) })}
                      </span>
                    </div>
                  </div>

                  {items.map((item, idx) => {
                    const lineId = `${order.id.slice(0, 12).toUpperCase()}-${idx + 1}`;
                    const title = item.variantLabel
                      ? `${item.productName} — ${item.variantLabel}`
                      : item.productName;
                    const lineTotal = item.unitPrice * item.quantity;

                    return (
                      <div
                        key={`${order.id}-${idx}`}
                        className="flex flex-wrap items-start justify-between gap-4 py-4"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white">{title}</p>
                          <p className="mt-1 font-mono text-xs text-best-muted">#{lineId}</p>
                          <p className="mt-1 text-sm text-best-muted">
                            {t('account.ordersQty', { count: item.quantity })}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <p className="font-semibold text-white">{formatPrice(lineTotal)}</p>
                          <span
                            className={cn(
                              'rounded-full border px-3 py-0.5 text-xs font-semibold',
                              STATUS_PILL[order.status]
                            )}
                          >
                            {t(`account.${orderStatusLabelKey(order.status)}`)}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {items.length === 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-4 py-4">
                      <span className="font-mono text-sm text-best-muted">
                        #{shortOrderId(order.id)}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-white">{formatPrice(order.amount)}</span>
                        <span
                          className={cn(
                            'rounded-full border px-3 py-0.5 text-xs font-semibold',
                            STATUS_PILL[order.status]
                          )}
                        >
                          {t(`account.${orderStatusLabelKey(order.status)}`)}
                        </span>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
