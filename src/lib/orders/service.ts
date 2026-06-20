import type { SupabaseClient } from '@supabase/supabase-js';
import { getProductBySlug } from '@/lib/catalog';
import { notifyDiscordNewOrder } from '@/lib/discord/orders';
import { sendAdminOrderEmail } from '@/lib/email/orders';
import { consumeInventoryReward, resolveOrderDiscount } from '@/lib/orders/discount';
import { pointsFromAmount } from '@/lib/purchases/resolve';
import { grantSpinCreditForPurchase } from '@/lib/spin/credits';
import type { OrderItemSnapshot, OrderStatus } from '@/types/orders';
import type { CreateOrderRequest } from '@/lib/validation/orders';

type AdminClient = SupabaseClient;

import { shortOrderId } from '@/lib/orders/utils';
export async function buildOrderSnapshots(
  items: CreateOrderRequest['items']
): Promise<{ snapshots: OrderItemSnapshot[]; amount: number } | { error: string }> {
  let amount = 0;
  const snapshots: OrderItemSnapshot[] = [];

  for (const item of items) {
    const product = await getProductBySlug(item.productId);
    if (!product) return { error: `Unknown product: ${item.productId}` };

    let unitPrice = product.base_price;
    let variantLabel: string | undefined;
    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) return { error: `Invalid variant for ${product.name}.` };
      unitPrice = variant.price;
      variantLabel = variant.duration ?? variant.plan_type ?? undefined;
    } else if (product.variants.length > 0) {
      unitPrice = Math.min(...product.variants.map((v) => v.price));
    }

    amount += unitPrice * item.quantity;
    snapshots.push({
      productId: item.productId,
      productName: product.name,
      variantId: item.variantId,
      variantLabel,
      quantity: item.quantity,
      unitPrice,
    });
  }

  return { snapshots, amount };
}

export async function createOrder(
  admin: AdminClient,
  userId: string,
  userEmail: string | undefined,
  username: string,
  input: CreateOrderRequest
) {
  const built = await buildOrderSnapshots(input.items);
  if ('error' in built) return { error: built.error };

  const pricing = await resolveOrderDiscount(
    admin,
    userId,
    built.amount,
    input.promoCode,
    input.inventoryId
  );
  if (!pricing.ok) return { error: pricing.error };

  const pointsEarned = pointsFromAmount(pricing.finalAmount);
  const itemsSummary = built.snapshots
    .map((i) => {
      const label = i.variantLabel ? `${i.productName} — ${i.variantLabel}` : i.productName;
      return i.quantity > 1 ? `${i.quantity}x ${label}` : label;
    })
    .join(', ');

  const deliveryJson = input.delivery ?? {};
  const deliverySummary = Object.entries(deliveryJson)
    .filter(([, v]) => v.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');

  const { data: order, error } = await admin
    .from('orders')
    .insert({
      user_id: userId,
      status: 'pending',
      amount: pricing.finalAmount,
      subtotal_amount: pricing.subtotal,
      discount_amount: pricing.discount,
      reward_inventory_id: pricing.rewardInventoryId,
      points_earned: pointsEarned,
      payment_method_slug: input.paymentMethodSlug ?? null,
      delivery_json: deliveryJson,
      seller_notes: input.sellerNotes?.trim() || null,
      promo_code: pricing.promoCode,
      items_json: built.snapshots,
    })
    .select('*')
    .single();

  if (error || !order) return { error: error?.message ?? 'Failed to create order.' };

  if (pricing.rewardInventoryId) {
    const consumed = await consumeInventoryReward(admin, userId, pricing.rewardInventoryId);
    if ('error' in consumed) {
      await admin.from('orders').delete().eq('id', order.id);
      return { error: consumed.error };
    }
  }

  const itemRows = built.snapshots.map((s, idx) => ({
    order_id: order.id,
    product_id: s.productId,
    product_name: s.productName,
    variant_id: s.variantId ?? null,
    variant_label: s.variantLabel ?? null,
    quantity: s.quantity,
    unit_price: s.unitPrice,
    sort_order: idx,
  }));

  await admin.from('order_items').insert(itemRows);

  const discordPayload = {
    orderId: order.id,
    shortId: shortOrderId(order.id),
    username,
    userEmail,
    amount: pricing.finalAmount,
    subtotal: pricing.subtotal,
    discount: pricing.discount,
    discountLabel: pricing.discountLabel ?? undefined,
    paymentMethod: input.paymentMethodSlug,
    itemsSummary,
    deliverySummary: deliverySummary || undefined,
    sellerNotes: input.sellerNotes?.trim(),
  };

  const [discordOk, emailOk] = await Promise.all([
    notifyDiscordNewOrder(discordPayload),
    sendAdminOrderEmail(discordPayload),
  ]);

  const updates: Record<string, string> = {};
  if (discordOk) updates.discord_notified_at = new Date().toISOString();
  if (emailOk) updates.email_notified_at = new Date().toISOString();
  if (Object.keys(updates).length) {
    await admin.from('orders').update(updates).eq('id', order.id);
  }

  return { order: { ...order, items_json: built.snapshots } };
}

export async function confirmOrder(
  admin: AdminClient,
  orderId: string,
  adminUserId: string
): Promise<{ ok: true } | { error: string }> {
  const { data: order, error } = await admin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();

  if (error || !order) return { error: 'Order not found.' };
  if (order.status !== 'pending') return { error: `Order is already ${order.status}.` };

  const { data: authUser } = await admin.auth.admin.getUserById(order.user_id);
  const email = authUser?.user?.email;

  const { data: purchase, error: purchaseError } = await admin
    .from('purchases')
    .insert({
      user_id: order.user_id,
      amount: order.amount,
      points_earned: order.points_earned,
      spin_credit_granted: false,
    })
    .select('id')
    .single();

  if (purchaseError || !purchase) {
    return { error: purchaseError?.message ?? 'Failed to record purchase.' };
  }

  await grantSpinCreditForPurchase(admin, order.user_id, email, purchase.id, Number(order.amount));

  const { error: updateError } = await admin
    .from('orders')
    .update({
      status: 'confirmed',
      purchase_id: purchase.id,
      confirmed_by: adminUserId,
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (updateError) return { error: updateError.message };
  return { ok: true };
}

export async function updateOrderStatus(
  admin: AdminClient,
  orderId: string,
  status: OrderStatus
): Promise<{ ok: true } | { error: string }> {
  const { data: order } = await admin.from('orders').select('status').eq('id', orderId).maybeSingle();
  if (!order) return { error: 'Order not found.' };

  if (status === 'delivered' && order.status !== 'confirmed') {
    return { error: 'Order must be confirmed before marking delivered.' };
  }
  if (status === 'cancelled' && order.status === 'delivered') {
    return { error: 'Cannot cancel a delivered order.' };
  }

  const patch: Record<string, unknown> = { status };
  if (status === 'delivered') patch.delivered_at = new Date().toISOString();
  if (status === 'cancelled') patch.cancelled_at = new Date().toISOString();

  const { error } = await admin.from('orders').update(patch).eq('id', orderId);
  if (error) return { error: error.message };
  return { ok: true };
}
