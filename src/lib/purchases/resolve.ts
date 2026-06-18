import { getProductBySlug } from '@/lib/catalog';
import type { RecordPurchaseRequest } from '@/lib/validation/purchases';

/** 1 leaderboard point per 1,000 IQD spent. */
export function pointsFromAmount(amount: number): number {
  return Math.floor(amount / 1000);
}

export async function resolvePurchaseTotals(
  items: RecordPurchaseRequest['items']
): Promise<{ amount: number; pointsEarned: number } | { error: string }> {
  let amount = 0;

  for (const item of items) {
    const product = await getProductBySlug(item.productId);
    if (!product) {
      return { error: `Unknown product: ${item.productId}` };
    }

    let unitPrice = product.base_price;
    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) {
        return { error: `Invalid variant for ${product.name}.` };
      }
      unitPrice = variant.price;
    } else if (product.variants.length > 0) {
      unitPrice = Math.min(...product.variants.map((v) => v.price));
    }

    amount += unitPrice * item.quantity;
  }

  return { amount, pointsEarned: pointsFromAmount(amount) };
}
