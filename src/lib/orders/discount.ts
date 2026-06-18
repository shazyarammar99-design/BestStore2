import { CHECKOUT_SERVICE_FEE_PERCENT } from '@/config/checkout';
import { calculateCheckoutPricing, type SpinRewardSelection } from '@/lib/checkout-pricing';
import { computePrizeDiscount, type PrizeType } from '@/lib/spin/prize-effects';
import type { SupabaseClient } from '@supabase/supabase-js';

export type OrderDiscountResult =
  | {
      ok: true;
      subtotal: number;
      serviceFee: number;
      discount: number;
      finalAmount: number;
      promoCode: string | null;
      rewardInventoryId: string | null;
      discountLabel: string | null;
    }
  | { ok: false; error: string };

export async function resolveOrderDiscount(
  admin: SupabaseClient,
  userId: string,
  subtotal: number,
  promoCode?: string,
  inventoryId?: string
): Promise<OrderDiscountResult> {
  if (promoCode && inventoryId) {
    return { ok: false, error: 'Cannot apply both a promo code and a spin reward.' };
  }

  const serviceFee = Math.round(subtotal * (CHECKOUT_SERVICE_FEE_PERCENT / 100));

  if (inventoryId) {
    const { data: row, error } = await admin
      .from('inventory')
      .select('id, quantity, prize_id, prizes ( id, name, prize_type, value )')
      .eq('id', inventoryId)
      .eq('user_id', userId)
      .gt('quantity', 0)
      .maybeSingle();

    if (error || !row) {
      return { ok: false, error: 'Spin reward not found or already used.' };
    }

    const rawPrize = row.prizes as unknown;
    const prize = (Array.isArray(rawPrize) ? rawPrize[0] : rawPrize) as {
      id: string;
      name: string;
      prize_type: string;
      value: number;
    } | null;

    if (!prize) {
      return { ok: false, error: 'Invalid spin reward.' };
    }

    const prizeType = (prize.prize_type ?? 'fixed_off') as PrizeType;
    const effect = computePrizeDiscount({
      prizeType,
      value: Number(prize.value),
      subtotal,
      serviceFee,
    });

    const finalAmount = Math.max(0, subtotal + serviceFee - effect.discount);

    return {
      ok: true,
      subtotal,
      serviceFee,
      discount: effect.discount,
      finalAmount,
      promoCode: null,
      rewardInventoryId: row.id,
      discountLabel: `${prize.name} (${effect.label})`,
    };
  }

  if (promoCode) {
    const pricing = calculateCheckoutPricing(subtotal, promoCode, null);
    if (!pricing.promo) {
      return { ok: false, error: 'Invalid promo code.' };
    }

    return {
      ok: true,
      subtotal,
      serviceFee: pricing.serviceFee,
      discount: pricing.discount,
      finalAmount: pricing.total,
      promoCode: pricing.promoCode,
      rewardInventoryId: null,
      discountLabel: pricing.discountLabel,
    };
  }

  return {
    ok: true,
    subtotal,
    serviceFee,
    discount: 0,
    finalAmount: subtotal + serviceFee,
    promoCode: null,
    rewardInventoryId: null,
    discountLabel: null,
  };
}

export async function consumeInventoryReward(
  admin: SupabaseClient,
  userId: string,
  inventoryId: string
): Promise<{ ok: true } | { error: string }> {
  const { data: row, error: fetchError } = await admin
    .from('inventory')
    .select('id, quantity')
    .eq('id', inventoryId)
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError || !row || row.quantity <= 0) {
    return { error: 'Failed to consume spin reward.' };
  }

  const nextQty = row.quantity - 1;

  if (nextQty <= 0) {
    const { error: deleteError } = await admin
      .from('inventory')
      .delete()
      .eq('id', inventoryId)
      .eq('user_id', userId);
    if (deleteError) return { error: deleteError.message };
  } else {
    const { error: updateError } = await admin
      .from('inventory')
      .update({ quantity: nextQty })
      .eq('id', inventoryId)
      .eq('user_id', userId)
      .eq('quantity', row.quantity);
    if (updateError) return { error: updateError.message };
  }

  return { ok: true };
}
