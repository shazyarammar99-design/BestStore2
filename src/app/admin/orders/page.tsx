'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Package, Truck, XCircle } from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';
import { shortOrderId } from '@/lib/orders/utils';
import type { OrderItemSnapshot, OrderWithProfile } from '@/types/orders';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STATUS_STYLES = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  confirmed: 'bg-best-cyan/15 text-best-cyan border-best-cyan/30',
  delivered: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

function itemsLabel(items: OrderItemSnapshot[]): string {
  return items
    .map((i) => {
      const name = i.variantLabel ? `${i.productName} — ${i.variantLabel}` : i.productName;
      return i.quantity > 1 ? `${i.quantity}x ${name}` : name;
    })
    .join(', ');
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = filter !== 'all' ? `?status=${filter}` : '';
    const res = await adminFetch(`/api/admin/orders${qs}`);
    const json = await res.json();
    if (res.ok) setOrders(json.orders ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: string, action: 'confirm' | 'deliver' | 'cancel') => {
    setActing(id);
    const res = await adminFetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setActing(null);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(json.error ?? 'Action failed');
      return;
    }
    toast.success(`Order ${action === 'confirm' ? 'confirmed' : action === 'deliver' ? 'delivered' : 'cancelled'}`);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-black uppercase tracking-tight">Orders</h1>
      <p className="mt-1 text-sm text-best-muted">
        Confirm payment on Discord, then approve here. Mark delivered when the customer has their product.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(['all', 'pending', 'confirmed', 'delivered', 'cancelled'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              'min-h-11 rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors',
              filter === s
                ? 'border-best-cyan bg-best-cyan/15 text-best-cyan'
                : 'border-best-border text-best-muted hover:text-white'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-8 text-best-muted">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="mt-8 text-best-muted">No orders found.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => {
            const items = (order.items_json ?? []) as OrderItemSnapshot[];
            const delivery = order.delivery_json as Record<string, string>;
            const deliveryText = Object.entries(delivery)
              .filter(([, v]) => v?.trim())
              .map(([k, v]) => `${k}: ${v}`)
              .join(' · ');

            return (
              <div
                key={order.id}
                className="rounded-xl border border-best-border bg-best-elevated p-4 md:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">
                        #{shortOrderId(order.id)}
                      </span>
                      <span
                        className={cn(
                          'rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize',
                          STATUS_STYLES[order.status]
                        )}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-white">
                      {order.username ?? 'Customer'}
                      {order.user_email ? (
                        <span className="text-best-caption"> · {order.user_email}</span>
                      ) : null}
                    </p>
                    <p className="mt-2 text-sm text-best-muted">{itemsLabel(items)}</p>
                    <p className="mt-1 text-sm font-semibold text-best-gold">
                      {Number(order.amount).toLocaleString()} IQD
                      {order.payment_method_slug ? (
                        <span className="ml-2 font-normal text-best-caption">
                          via {order.payment_method_slug}
                        </span>
                      ) : null}
                    </p>
                    {deliveryText && (
                      <p className="mt-1 text-xs text-best-caption">Delivery: {deliveryText}</p>
                    )}
                    {order.seller_notes && (
                      <p className="mt-1 text-xs text-best-caption">Notes: {order.seller_notes}</p>
                    )}
                    <p className="mt-1 text-xs text-best-caption">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {order.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="min-h-11"
                          disabled={acting === order.id}
                          onClick={() => act(order.id, 'confirm')}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="min-h-11 border-red-500/30 text-red-400"
                          disabled={acting === order.id}
                          onClick={() => act(order.id, 'cancel')}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </>
                    )}
                    {order.status === 'confirmed' && (
                      <Button
                        size="sm"
                        className="min-h-11"
                        disabled={acting === order.id}
                        onClick={() => act(order.id, 'deliver')}
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Mark delivered
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
