/**
 * Default category hero images (remote URLs until uploaded via admin icon_url).
 * Override per category in Supabase categories.icon_url.
 */
export const SIXTH_CATEGORY_SLUG = 'digital-services';

const U = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const CATEGORY_IMAGES: Record<string, string> = {
  'in-game-currency': U('1550745165-9bc0b252726f'),
  'bypass-pubg': U('1542759564-16f6c3f7f1b1'),
  'steam-games': U('1511882150382-421056c89033'),
  'discounted-games': U('1493711662060-fa541cb35d15'),
  'other-games': U('1538481199705-c710c4e965fc'),
  [SIXTH_CATEGORY_SLUG]: U('1552820728-8b83bb6b773f'),
};
