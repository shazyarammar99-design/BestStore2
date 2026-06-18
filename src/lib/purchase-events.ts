import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { buyerLabelFromUser, maskBuyerName } from '@/lib/mask-buyer-name';

export type PurchaseEvent = {
  id: string;
  buyer_name_masked: string;
  product_name: string;
  created_at: string;
};

function formatProductLabel(productName: string, variant?: string): string {
  return variant ? `${productName} — ${variant}` : productName;
}

export type PurchaseEventMetadata = {
  delivery?: Record<string, string>;
  notes?: string;
  promoCode?: string | null;
  total?: number;
};

function appendMetadata(summary: string, meta?: PurchaseEventMetadata): string {
  if (!meta) return summary;
  const parts: string[] = [summary];
  if (meta.delivery && Object.keys(meta.delivery).length > 0) {
    const deliveryStr = Object.entries(meta.delivery)
      .filter(([, v]) => v.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ');
    if (deliveryStr) parts.push(`[delivery: ${deliveryStr}]`);
  }
  if (meta.notes?.trim()) parts.push(`[notes: ${meta.notes.trim().slice(0, 200)}]`);
  if (meta.promoCode) parts.push(`[promo: ${meta.promoCode}]`);
  if (meta.total != null) parts.push(`[total: ${meta.total}]`);
  return parts.join(' ');
}

/** Record when a logged-in user confirms checkout. */
export async function recordPurchaseEvent(
  user: User,
  productName: string,
  variant?: string,
  paymentMethodSlug?: string,
  metadata?: PurchaseEventMetadata
): Promise<void> {
  if (!supabase) return;

  const { visible, hidden } = maskBuyerName(buyerLabelFromUser(user));
  const buyer_name_masked = hidden ? `${visible}|${hidden}` : visible;

  const { error } = await supabase.from('purchase_events').insert({
    user_id: user.id,
    buyer_name_masked,
    product_name: appendMetadata(formatProductLabel(productName, variant), metadata),
    payment_method_slug: paymentMethodSlug ?? null,
  });

  if (error) console.error('Failed to record purchase event:', error.message);
}

/** Record a cart checkout (one row summarising the order). */
export async function recordCartPurchaseEvent(
  user: User,
  items: { name: string; variantLabel?: string; quantity: number }[],
  paymentMethodSlug?: string,
  metadata?: PurchaseEventMetadata
): Promise<void> {
  if (!supabase || items.length === 0) return;

  if (items.length === 1) {
    const item = items[0];
    await recordPurchaseEvent(user, item.name, item.variantLabel, paymentMethodSlug, metadata);
    return;
  }

  const { visible, hidden } = maskBuyerName(buyerLabelFromUser(user));
  const buyer_name_masked = hidden ? `${visible}|${hidden}` : visible;
  const summary = items
    .map((i) => {
      const label = formatProductLabel(i.name, i.variantLabel);
      return i.quantity > 1 ? `${i.quantity}x ${label}` : label;
    })
    .join(', ');

  const { error } = await supabase.from('purchase_events').insert({
    user_id: user.id,
    buyer_name_masked,
    product_name: appendMetadata(summary, metadata),
    payment_method_slug: paymentMethodSlug ?? null,
  });

  if (error) console.error('Failed to record purchase event:', error.message);
}

export async function fetchRecentPurchaseEvents(limit = 15): Promise<PurchaseEvent[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('purchase_events')
    .select('id, buyer_name_masked, product_name, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as PurchaseEvent[];
}

/** Split stored masked name back into visible + blurred parts for display. */
export function splitMaskedName(stored: string): { visible: string; hidden: string } {
  if (!stored) return { visible: 'Someone', hidden: '' };
  if (stored.includes('|')) {
    const [visible, hidden] = stored.split('|');
    const padded =
      hidden.length < 4 ? hidden + '•'.repeat(Math.max(0, 4 - hidden.length)) : hidden;
    return { visible: visible || 'Someone', hidden: padded };
  }
  const visibleLen = Math.max(1, Math.ceil(stored.length / 2));
  return {
    visible: stored.slice(0, visibleLen),
    hidden: stored.slice(visibleLen),
  };
}
