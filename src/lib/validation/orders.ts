import { z } from 'zod';
import { purchaseItemSchema } from '@/lib/validation/purchases';

export const createOrderSchema = z.object({
  items: z.array(purchaseItemSchema).min(1).max(20),
  paymentMethodSlug: z.string().min(1).optional(),
  delivery: z.record(z.string(), z.string()).optional(),
  sellerNotes: z.string().max(2000).optional(),
  promoCode: z.string().max(64).optional(),
});

export type CreateOrderRequest = z.infer<typeof createOrderSchema>;

export const adminOrderActionSchema = z.object({
  action: z.enum(['confirm', 'deliver', 'cancel']),
});
