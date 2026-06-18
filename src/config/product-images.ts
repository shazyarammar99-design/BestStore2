/**
 * Local product hero images — files in public/products/{slug}.png
 */
export const PRODUCT_IMAGES: Record<string, string> = {
  discord: '/products/discord.png',
  netflix: '/products/netflix.png',
  claude: '/products/claude.png',
  youtube: '/products/youtube.png',
  gemini: '/products/gemini.png',
  chatgpt: '/products/chatgpt.png',
  deepseek: '/products/deepseek.png',
  spotify: '/products/spotify.png',
};

export const PREMIUM_SUBSCRIPTION_ORDER = [
  'discord',
  'netflix',
  'claude',
  'youtube',
  'gemini',
  'chatgpt',
  'deepseek',
  'spotify',
] as const;
