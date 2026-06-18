import { NextResponse } from 'next/server';
import { stripe, isStripeConfigured, STRIPE_CURRENCY, toStripeAmount } from '@/lib/stripe';
import { resolvePurchaseTotals } from '@/lib/purchases/resolve';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { purchaseItemSchema } from '@/lib/validation/purchases';
import { z } from 'zod';

const stripeCheckoutSchema = z.object({
  items: z.array(purchaseItemSchema).min(1).max(20),
  orderId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  if (!isStripeConfigured || !stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to enable card payments.' },
      { status: 503 }
    );
  }

  const limit = await rateLimit(`stripe:${getClientIp(request)}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = stripeCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid request.' },
      { status: 400 }
    );
  }

  const resolved = await resolvePurchaseTotals(parsed.data.items);
  if ('error' in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: 400 });
  }

  const lineItems: { name: string; variantLabel?: string; price: number; quantity: number }[] = [];

  for (const item of parsed.data.items) {
    const { getProductBySlug } = await import('@/lib/catalog');
    const product = await getProductBySlug(item.productId);
    if (!product) {
      return NextResponse.json({ error: `Unknown product: ${item.productId}` }, { status: 400 });
    }

    let unitPrice = product.base_price;
    let variantLabel: string | undefined;
    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) {
        return NextResponse.json({ error: `Invalid variant for ${product.name}.` }, { status: 400 });
      }
      unitPrice = variant.price;
      variantLabel = variant.duration ?? variant.plan_type ?? undefined;
    } else if (product.variants.length > 0) {
      const min = Math.min(...product.variants.map((v) => v.price));
      unitPrice = min;
    }

    lineItems.push({
      name: product.name,
      variantLabel,
      price: unitPrice,
      quantity: item.quantity,
    });
  }

  const origin = request.headers.get('origin') ?? new URL(request.url).origin;
  const orderParam = parsed.data.orderId ? `&order=${parsed.data.orderId}` : '';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems.map((item) => ({
        quantity: Math.max(1, item.quantity),
        price_data: {
          currency: STRIPE_CURRENCY,
          unit_amount: toStripeAmount(item.price),
          product_data: {
            name: item.variantLabel ? `${item.name} — ${item.variantLabel}` : item.name,
          },
        },
      })),
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&method=stripe${orderParam}`,
      cancel_url: `${origin}/checkout`,
      metadata: parsed.data.orderId ? { order_id: parsed.data.orderId } : undefined,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe checkout failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
