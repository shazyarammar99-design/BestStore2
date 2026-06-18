const DISCORD_API = 'https://discord.com/api/v10';

export type OrderDiscordPayload = {
  orderId: string;
  shortId: string;
  username: string;
  userEmail?: string;
  amount: number;
  paymentMethod?: string;
  itemsSummary: string;
  deliverySummary?: string;
  sellerNotes?: string;
};

function isConfigured(): boolean {
  return Boolean(process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_ORDERS_CHANNEL_ID);
}

export async function notifyDiscordNewOrder(payload: OrderDiscordPayload): Promise<boolean> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_ORDERS_CHANNEL_ID;
  if (!token || !channelId) return false;

  const fields = [
    { name: 'Order', value: `\`${payload.shortId}\``, inline: true },
    { name: 'Customer', value: payload.username, inline: true },
    { name: 'Total', value: `${payload.amount.toLocaleString()} IQD`, inline: true },
    { name: 'Items', value: payload.itemsSummary.slice(0, 1024) },
  ];

  if (payload.paymentMethod) {
    fields.push({ name: 'Payment', value: payload.paymentMethod, inline: true });
  }
  if (payload.deliverySummary) {
    fields.push({ name: 'Delivery info', value: payload.deliverySummary.slice(0, 1024) });
  }
  if (payload.sellerNotes) {
    fields.push({ name: 'Notes', value: payload.sellerNotes.slice(0, 1024) });
  }
  if (payload.userEmail) {
    fields.push({ name: 'Email', value: payload.userEmail, inline: true });
  }

  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: `🛒 **New order** — confirm payment on Discord, then mark in admin panel.`,
      embeds: [
        {
          title: 'Pending order',
          color: 0xf5a623,
          fields,
          footer: { text: `Full ID: ${payload.orderId}` },
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });

  return res.ok;
}

export function getDiscordInviteUrl(): string {
  return (
    process.env.DISCORD_INVITE_URL?.trim() ||
    'https://discord.gg/SMw5HBnmMc'
  );
}

export function buildDiscordPrefillMessage(orderId: string, shortId: string): string {
  return encodeURIComponent(
    `Hi! I just placed order ${shortId} (${orderId}). I've completed payment — please confirm my order.`
  );
}
