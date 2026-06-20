'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { useTranslation } from '@/context/LocaleContext';
import { SUPPORT_DISCORD_URL } from '@/config/contact';
import { getDiscordInviteUrl } from '@/lib/discord/orders';

export default function CheckoutSuccessClient() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const isStripe =
    searchParams?.get('method') === 'stripe' || Boolean(searchParams?.get('session_id'));
  const orderId = searchParams?.get('order');
  const discordParam = searchParams?.get('discord');
  const discordUrl = discordParam ? decodeURIComponent(discordParam) : getDiscordInviteUrl();

  return (
    <main className="px-6 pb-24 pt-32">
      <div className="mx-auto max-w-lg rounded-2xl border border-best-border bg-best-elevated p-10 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
        <h1 className="font-display mt-6 text-3xl font-black uppercase tracking-tight text-white">
          {isStripe ? t('checkout.paymentReceived') : t('checkout.success')}
        </h1>
        <p className="mt-3 text-best-muted">
          {orderId
            ? 'Your order is pending. Join Discord so we can confirm your payment and deliver your products.'
            : isStripe
              ? t('checkout.paymentSuccessHint')
              : t('checkout.successHint')}
        </p>
        {orderId && (
          <p className="mt-2 font-mono text-xs text-best-caption">
            Order ref: {orderId.slice(0, 8).toUpperCase()}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3">
          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5865F2] px-8 py-3 font-heading text-sm font-bold uppercase tracking-widest text-white transition-transform hover:scale-[1.03]"
          >
            <MessageCircle className="h-5 w-5" />
            Join Discord to complete order
          </a>
          <Link
            href="/account"
            className="inline-block rounded-lg border border-best-border px-8 py-3 font-heading text-sm font-bold uppercase tracking-widest text-best-cyan transition-colors hover:border-best-cyan/50"
          >
            View my orders
          </Link>
          <Link
            href="/"
            className="inline-block rounded-lg bg-best-gold px-8 py-3 font-heading text-sm font-bold uppercase tracking-widest text-best-bg transition-transform hover:scale-[1.03]"
          >
            {t('checkout.continueShopping')}
          </Link>
        </div>
        <p className="mt-6 text-xs text-best-caption">
          {t('checkout.supportHint')}{' '}
          <a
            href={SUPPORT_DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-best-cyan hover:underline"
          >
            {t('footer.discord')}
          </a>
        </p>
      </div>
    </main>
  );
}
