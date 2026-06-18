import { createClient } from '@supabase/supabase-js';

export type PaymentMethod = {
  id: string;
  slug: string;
  label: string;
  icon: string;
  account_value: string | null;
  instructions: string;
  sort_order: number;
  is_active: boolean;
  available: boolean;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getClient() {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

const CRYPTO_PLACEHOLDER = 'YOUR_WALLET_HERE';

/** Static fallback so the storefront keeps working before/without Supabase. */
function fallbackPaymentMethods(): PaymentMethod[] {
  return [
    {
      id: 'visa-mastercard',
      slug: 'visa-mastercard',
      label: 'Visa / Mastercard',
      icon: 'CreditCard',
      account_value: null,
      instructions:
        'Pay with your bank card via FIB transfer to our number, then confirm your order on WhatsApp.',
      sort_order: 1,
      is_active: true,
      available: true,
    },
    {
      id: 'crypto',
      slug: 'crypto',
      label: 'BTC / USDT',
      icon: 'Bitcoin',
      account_value: CRYPTO_PLACEHOLDER,
      instructions:
        'Send the exact IQD equivalent in BTC or USDT to our wallet, then confirm on WhatsApp with the transaction hash.',
      sort_order: 2,
      is_active: true,
      available: true,
    },
    {
      id: 'fib-fastpay',
      slug: 'fib-fastpay',
      label: 'FIB / FastPay',
      icon: 'Smartphone',
      account_value: '9647503220525',
      instructions:
        'Send your payment to this number via FIB or FastPay, then confirm on WhatsApp.',
      sort_order: 3,
      is_active: true,
      available: true,
    },
    {
      id: 'whatsapp',
      slug: 'whatsapp',
      label: 'WhatsApp Pay',
      icon: 'MessageCircle',
      account_value: '9647503220525',
      instructions: 'Message us on WhatsApp to complete your payment details.',
      sort_order: 4,
      is_active: true,
      available: true,
    },
    {
      id: 'zain-cash',
      slug: 'zain-cash',
      label: 'Zain Cash',
      icon: 'Smartphone',
      account_value: '9647503220525',
      instructions: 'Zain Cash is currently unavailable. Please use another payment method.',
      sort_order: 5,
      is_active: true,
      available: false,
    },
  ];
}

/** Works in both server and client components (no next/cache dependency). */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const client = getClient();
  if (!client) return fallbackPaymentMethods();

  const { data, error } = await client
    .from('payment_methods')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !data?.length) return fallbackPaymentMethods();
  return data as PaymentMethod[];
}

/** True when the crypto wallet still holds the placeholder value. */
export function isPlaceholderAccount(value: string | null): boolean {
  return !value || value === CRYPTO_PLACEHOLDER;
}
