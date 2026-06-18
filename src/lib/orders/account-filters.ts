import type { Order, OrderStatus } from '@/types/orders';
import type { OrderTabId } from '@/data/account-menu';

export function ordersForTab(orders: Order[], tab: OrderTabId): Order[] {
  switch (tab) {
    case 'to-pay':
    case 'verify':
      return orders.filter((o) => o.status === 'pending');
    case 'preparing':
    case 'delivering':
      return orders.filter((o) => o.status === 'confirmed');
    case 'completed':
      return orders.filter((o) => o.status === 'delivered');
    case 'cancelled':
      return orders.filter((o) => o.status === 'cancelled');
    case 'resolution':
      return [];
    default:
      return orders;
  }
}

export function orderStatusLabelKey(
  status: OrderStatus
): 'ordersStatusPending' | 'ordersStatusConfirmed' | 'ordersStatusDelivered' | 'ordersStatusCancelled' | 'ordersStatusReceived' {
  switch (status) {
    case 'pending':
      return 'ordersStatusPending';
    case 'confirmed':
      return 'ordersStatusConfirmed';
    case 'delivered':
      return 'ordersStatusReceived';
    case 'cancelled':
      return 'ordersStatusCancelled';
    default:
      return 'ordersStatusPending';
  }
}

export function filterOrders(
  orders: Order[],
  search: string,
  fromDate: string,
  toDate: string
): Order[] {
  const q = search.trim().toLowerCase();
  const from = fromDate ? new Date(fromDate).getTime() : null;
  const to = toDate ? new Date(`${toDate}T23:59:59`).getTime() : null;

  return orders.filter((order) => {
    if (from !== null && new Date(order.created_at).getTime() < from) return false;
    if (to !== null && new Date(order.created_at).getTime() > to) return false;
    if (!q) return true;

    const items = order.items_json ?? [];
    const haystack = [
      order.id,
      ...items.map((i) => i.productName),
      ...items.map((i) => i.variantLabel ?? ''),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });
}
