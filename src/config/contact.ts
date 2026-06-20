/** Public support channels — configure via env vars (never commit personal numbers). */
export const SUPPORT_DISCORD_URL =
  process.env.NEXT_PUBLIC_DISCORD_URL ?? 'https://discord.gg/SMw5HBnmMc';

export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || null;

/** Reserved for future use; leave unset for Discord-only support. */
export const SUPPORT_WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() || null;
