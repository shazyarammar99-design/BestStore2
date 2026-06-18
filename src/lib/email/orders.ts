import type { OrderDiscordPayload } from '@/lib/discord/orders';

export async function sendAdminOrderEmail(payload: OrderDiscordPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_ORDER_EMAIL;
  const from = process.env.ORDER_EMAIL_FROM ?? 'orders@beststore.local';

  if (!apiKey || !to) return false;

  const html = `
    <h2>New order — ${payload.shortId}</h2>
    <p><strong>Customer:</strong> ${payload.username}${payload.userEmail ? ` (${payload.userEmail})` : ''}</p>
    <p><strong>Total:</strong> ${payload.amount.toLocaleString()} IQD</p>
    <p><strong>Payment:</strong> ${payload.paymentMethod ?? 'N/A'}</p>
    <p><strong>Items:</strong> ${payload.itemsSummary}</p>
    ${payload.deliverySummary ? `<p><strong>Delivery:</strong> ${payload.deliverySummary}</p>` : ''}
    ${payload.sellerNotes ? `<p><strong>Notes:</strong> ${payload.sellerNotes}</p>` : ''}
    <p><strong>Order ID:</strong> ${payload.orderId}</p>
    <p>Confirm payment on Discord, then approve in the admin panel.</p>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `[BEST STORE] New order ${payload.shortId}`,
      html,
    }),
  });

  return res.ok;
}
