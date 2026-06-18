'use client';

import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { fetchMyOrders } from '@/lib/orders/client';
import { shortOrderId } from '@/lib/orders/utils';
import type { Order, OrderItemSnapshot } from '@/types/orders';
import { cn } from '@/lib/utils';

const STATUS_STYLES = {
  pending: 'bg-amber-500/15 text-amber-400',
  confirmed: 'bg-best-cyan/15 text-best-cyan',
  delivered: 'bg-emerald-500/15 text-emerald-400',
  cancelled: 'bg-red-500/15 text-red-400',
};

function itemsLabel(items: OrderItemSnapshot[]): string {
  return items
    .map((i) => {
      const name = i.variantLabel ? `${i.productName} — ${i.variantLabel}` : i.productName;
      return i.quantity > 1 ? `${i.quantity}x ${name}` : name;
    })
    .join(', ');
}

export default function AccountOrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  return (
    <section className="rounded-xl border border-best-border bg-best-elevated p-6">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-best-cyan" />
        <h2 className="font-heading text-lg font-bold text-white">My orders</h2>
      </div>
      <p className="mt-1 text-sm text-best-muted">
        Orders stay pending until we confirm your payment on Discord.
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-best-caption">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="mt-6 text-sm text-best-caption">No orders yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((order) => {
            const items = (order.items_json ?? []) as OrderItemSnapshot[];
            return (
              <li
                key={order.id}
                className="rounded-lg border border-best-border/60 bg-best-bg/50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-white">
                    #{shortOrderId(order.id)}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
                      STATUS_STYLES[order.status]
                    )}
                  >
                    {order.status === 'delivered' ? 'Delivered' : order.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-best-muted">{itemsLabel(items)}</p>
                <p className="mt-1 text-sm font-semibold text-best-gold">
                  {Number(order.amount).toLocaleString()} IQD
                </p>
                <p className="mt-1 text-xs text-best-caption">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
