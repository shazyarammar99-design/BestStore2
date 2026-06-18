import type { Metadata } from 'next';
import CartCheckoutPage from '@/components/checkout/CartCheckoutPage';
import { getPaymentMethods } from '@/lib/payment-methods';

export const metadata: Metadata = {
  title: 'Checkout — BEST STORE',
  description: 'Review your order and complete checkout at BEST STORE.',
};

export default async function CheckoutPage() {
  const paymentMethods = await getPaymentMethods();
  return <CartCheckoutPage paymentMethods={paymentMethods} />;
}
