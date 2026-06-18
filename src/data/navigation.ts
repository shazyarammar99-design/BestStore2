export type NavItem = {
  id: string;
  label: string;
  categoryId?: string;
  productId?: string;
  children?: NavItem[];
};

export const CATEGORY_MENU: NavItem[] = [
  { id: 'cat-top-up', label: 'Premium Subscriptions', categoryId: 'in-game-currency' },
  { id: 'cat-game-item', label: 'Game Item', categoryId: 'other-games' },
  { id: 'cat-game-accounts', label: 'Game Accounts', categoryId: 'steam-games' },
  {
    id: 'cat-gift-cards',
    label: 'Gift Cards',
    children: [{ id: 'gift-steam', label: 'Steam Wallet Code', productId: 'steam-wallet-code' }],
  },
  {
    id: 'cat-boosting',
    label: 'Boosting',
    children: [
      { id: 'boost-optimizer', label: 'Gaming Performance Booster', productId: 'game-optimizer' },
      { id: 'boost-recorder', label: 'Multi-Game Recorder', productId: 'game-recorder' },
    ],
  },
  {
    id: 'cat-game-cheats',
    label: 'Game Cheats',
    children: [
      { id: 'cheat-chess', label: 'Best Chess', productId: 'best-chess' },
      { id: 'cheat-bypass-pubg', label: 'Bypass PUBG', productId: 'pubg-bypass' },
    ],
  },
];

const SUBSCRIPTION_NAV_PRODUCTS: NavItem[] = [
  { id: 'prod-discord', label: 'Discord', productId: 'discord' },
  { id: 'prod-netflix', label: 'Netflix', productId: 'netflix' },
  { id: 'prod-claude', label: 'Claude', productId: 'claude' },
  { id: 'prod-youtube', label: 'YouTube', productId: 'youtube' },
  { id: 'prod-gemini', label: 'Gemini', productId: 'gemini' },
  { id: 'prod-chatgpt', label: 'ChatGPT', productId: 'chatgpt' },
  { id: 'prod-deepseek', label: 'DeepSeek', productId: 'deepseek' },
  { id: 'prod-spotify', label: 'Spotify', productId: 'spotify' },
];

export const PRODUCT_MENU: NavItem[] = [
  {
    id: 'prod-currency',
    label: 'Premium Subscriptions',
    categoryId: 'in-game-currency',
    children: SUBSCRIPTION_NAV_PRODUCTS,
  },
  {
    id: 'prod-accounts',
    label: 'Steam Games',
    categoryId: 'steam-games',
    children: [
      { id: 'prod-steam-1', label: 'Steam Premium Account', productId: 'steam-account-1' },
      { id: 'prod-steam-2', label: 'Steam VIP Account', productId: 'steam-account-2' },
      { id: 'prod-steam-tools', label: 'Steam Tools Package', productId: 'steam-tools' },
    ],
  },
  {
    id: 'prod-discounted',
    label: 'Discounted Games',
    categoryId: 'discounted-games',
    children: [
      { id: 'prod-aaa', label: 'AAA Game Bundle', productId: 'game-bundle-1' },
      { id: 'prod-indie', label: 'Indie Games Pack', productId: 'indie-bundle' },
      { id: 'prod-retro', label: 'Retro Classics Bundle', productId: 'retro-bundle' },
    ],
  },
  {
    id: 'prod-cheats',
    label: 'Game Cheats',
    children: [
      { id: 'prod-chess', label: 'Best Chess', productId: 'best-chess' },
      { id: 'prod-bypass', label: 'Bypass PUBG', productId: 'pubg-bypass' },
    ],
  },
  {
    id: 'prod-other',
    label: 'Other Games',
    categoryId: 'other-games',
    children: [
      { id: 'prod-suite', label: 'Universal Gaming Suite', productId: 'multi-game-tool' },
      { id: 'prod-booster', label: 'Gaming Performance Booster', productId: 'game-optimizer' },
      { id: 'prod-recorder', label: 'Multi-Game Recorder', productId: 'game-recorder' },
    ],
  },
];
