import { authFetch } from '@/lib/auth-fetch';
import type { Order } from '@/types/orders';
import type { CreateOrderRequest } from '@/lib/validation/orders';

export type CreateOrderResult =
  | { ok: true; order: Order }
  | { ok: false; error: string };

export async function submitOrder(input: CreateOrderRequest): Promise<CreateOrderResult> {
  try {
    const res = await authFetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? 'Failed to place order.' };
    return { ok: true, order: data.order };
  } catch {
    return { ok: false, error: 'Network error placing order.' };
  }
}

export async function fetchMyOrders(): Promise<Order[]> {
  try {
    const res = await authFetch('/api/orders');
    if (!res.ok) return [];
    const data = await res.json();
    return data.orders ?? [];
  } catch {
    return [];
  }
}
