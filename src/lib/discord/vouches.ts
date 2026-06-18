import { unstable_cache } from 'next/cache';

const DISCORD_API = 'https://discord.com/api/v10';

type DiscordMessage = {
  id: string;
  author: { bot?: boolean };
};

function isConfigured(): boolean {
  return Boolean(process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_VOUCH_CHANNEL_ID);
}

async function fetchVouchCountUncached(): Promise<number | null> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_VOUCH_CHANNEL_ID;
  if (!token || !channelId) return null;

  let total = 0;
  let before: string | undefined;

  for (let page = 0; page < 50; page++) {
    const url = new URL(`${DISCORD_API}/channels/${channelId}/messages`);
    url.searchParams.set('limit', '100');
    if (before) url.searchParams.set('before', before);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bot ${token}` },
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const messages = (await res.json()) as DiscordMessage[];
    if (!messages.length) break;

    total += messages.filter((m) => !m.author?.bot).length;
    before = messages[messages.length - 1]?.id;

    if (messages.length < 100) break;
  }

  return total;
}

const getCachedVouchCount = unstable_cache(
  async () => {
    if (!isConfigured()) return null;
    return fetchVouchCountUncached();
  },
  ['discord-vouch-count'],
  { revalidate: 300 }
);

export async function getDiscordVouchCount(): Promise<number | null> {
  return getCachedVouchCount();
}
