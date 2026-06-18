import { z } from 'zod';

export const purchaseItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const recordPurchaseSchema = z.object({
  items: z.array(purchaseItemSchema).min(1).max(20),
});

export type RecordPurchaseRequest = z.infer<typeof recordPurchaseSchema>;
