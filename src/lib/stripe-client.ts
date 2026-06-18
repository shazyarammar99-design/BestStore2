export type StripeLineItem = {
  productId: string;
  variantId?: string;
  quantity: number;
  orderId?: string;
};

/** True when the publishable key is present, so the UI can offer card payment. */
export const isStripeEnabled = Boolean(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

/**
 * Create a Stripe Checkout session and redirect the browser to it.
 * Returns an error string if Stripe is unavailable so the caller can fall back.
 */
export async function startStripeCheckout(
  items: StripeLineItem[]
): Promise<string | null> {
  try {
    const res = await fetch('/api/checkout/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return data?.error ?? 'Card payment is unavailable right now.';
    }

    const { url } = await res.json();
    if (!url) return 'Could not start card payment.';
    window.location.href = url;
    return null;
  } catch {
    return 'Could not reach the payment server.';
  }
}
