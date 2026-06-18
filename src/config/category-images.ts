/**
 * Local category hero images — drop files in public/categories/{slug}.webp
 * Rename SIXTH_CATEGORY_SLUG when you finalize the 6th category name.
 */
export const SIXTH_CATEGORY_SLUG = 'digital-services';

export const CATEGORY_IMAGES: Record<string, string> = {
  'in-game-currency': '/categories/in-game-currency.png',
  'bypass-pubg': '/categories/bypass-pubg.webp',
  'steam-games': '/categories/steam-games.webp',
  'discounted-games': '/categories/discounted-games.webp',
  'other-games': '/categories/other-games.webp',
  [SIXTH_CATEGORY_SLUG]: `/categories/${SIXTH_CATEGORY_SLUG}.webp`,
};
