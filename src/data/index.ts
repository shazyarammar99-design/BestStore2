export type Category = {
  id: string;
  name: string;
  tag: string;
  fromPrice: number;
  description: string;
};

export type ProductVariant = {
  id: string;
  duration: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  categoryId: string;
  variants?: ProductVariant[];
};

export const CATEGORIES: Category[] = [
  {
    id: 'bypass-pubg',
    name: 'Bypass PUBG',
    tag: 'Anti-Detect',
    fromPrice: 15000,
    description: 'Premium PUBG bypass tools with anti-detection',
  },
  {
    id: 'steam-games',
    name: 'Steam Games',
    tag: 'Verified',
    fromPrice: 12000,
    description: 'Premium Steam game accounts and tools',
  },
  {
    id: 'discounted-games',
    name: 'Discounted Games',
    tag: 'Deals',
    fromPrice: 5000,
    description: 'Best deals on popular games',
  },
  {
    id: 'other-games',
    name: 'Other Games',
    tag: 'Tools',
    fromPrice: 2000,
    description: 'Various gaming products and utilities',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'pubg-1day',
    name: 'PUBG Bypass',
    description: 'Premium PUBG bypass with anti-detection',
    duration: '1 Day',
    price: 1500,
    categoryId: 'bypass-pubg',
  },
  {
    id: 'pubg-1week',
    name: 'PUBG Bypass',
    description: 'Premium PUBG bypass with anti-detection',
    duration: '1 Week',
    price: 12000,
    categoryId: 'bypass-pubg',
  },
  {
    id: 'pubg-1month',
    name: 'PUBG Bypass',
    description: 'Premium PUBG bypass with anti-detection',
    duration: '1 Month',
    price: 22000,
    categoryId: 'bypass-pubg',
  },
  {
    id: 'pubg-lifetime',
    name: 'PUBG Bypass',
    description: 'Premium PUBG bypass with anti-detection',
    duration: 'Lifetime',
    price: 150000,
    categoryId: 'bypass-pubg',
  },
  {
    id: 'steam-account-1',
    name: 'Steam Premium Account',
    description: 'High-level Steam account with games',
    duration: 'Permanent',
    price: 37000,
    categoryId: 'steam-games',
  },
  {
    id: 'steam-account-2',
    name: 'Steam VIP Account',
    description: 'Premium Steam account with rare games',
    duration: 'Permanent',
    price: 66000,
    categoryId: 'steam-games',
  },
  {
    id: 'steam-tools',
    name: 'Steam Tools Package',
    description: 'Complete Steam automation tools',
    duration: '1 Month',
    price: 29000,
    categoryId: 'steam-games',
  },
  {
    id: 'game-bundle-1',
    name: 'AAA Game Bundle',
    description: 'Collection of top-rated games',
    duration: 'Permanent',
    price: 51000,
    categoryId: 'discounted-games',
  },
  {
    id: 'indie-bundle',
    name: 'Indie Games Pack',
    description: 'Best indie games collection',
    duration: 'Permanent',
    price: 22000,
    categoryId: 'discounted-games',
  },
  {
    id: 'retro-bundle',
    name: 'Retro Classics Bundle',
    description: 'Classic games from the 90s',
    duration: 'Permanent',
    price: 17500,
    categoryId: 'discounted-games',
  },
  {
    id: 'best-chess',
    name: 'Best Chess',
    description: 'The best chess assistant you can find',
    duration: '1 Day',
    price: 2000,
    categoryId: 'other-games',
    variants: [
      { id: '1day', duration: '1 Day', price: 2000 },
      { id: '1week', duration: '1 Week', price: 7000 },
      { id: '1month', duration: '1 Month', price: 19000 },
      { id: 'lifetime', duration: 'Lifetime', price: 100000 },
    ],
  },
  {
    id: 'multi-game-tool',
    name: 'Universal Gaming Suite',
    description: 'Multi-game utility and enhancement tools',
    duration: '1 Month',
    price: 44000,
    categoryId: 'other-games',
  },
  {
    id: 'game-optimizer',
    name: 'Gaming Performance Booster',
    description: 'Optimize performance across multiple games',
    duration: '6 Months',
    price: 73000,
    categoryId: 'other-games',
  },
  {
    id: 'game-recorder',
    name: 'Multi-Game Recorder',
    description: 'Record gameplay from various games',
    duration: 'Lifetime',
    price: 110000,
    categoryId: 'other-games',
  },
];

export function formatPrice(price: number): string {
  return `${price.toLocaleString()} IQD`;
}

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getProductDisplayPrice(product: Product): string {
  if (product.variants?.length) {
    const minPrice = Math.min(...product.variants.map((v) => v.price));
    return `from ${formatPrice(minPrice)}`;
  }
  return formatPrice(product.price);
}

export const FEATURES = [
  {
    icon: 'Zap',
    title: 'Instant Delivery',
    description: 'Get your products immediately after purchase. No waiting, no delays.',
  },
  {
    icon: 'Shield',
    title: 'Premium Quality',
    description: 'All products are tested and verified before delivery to ensure reliability.',
  },
  {
    icon: 'Headphones',
    title: '24/7 Support',
    description: 'Our support team is available around the clock via Discord and WhatsApp.',
  },
  {
    icon: 'Sliders',
    title: 'Local IQD Payments',
    description: 'Pay in Iraqi Dinar with secure local payment options tailored for gamers.',
  },
  {
    icon: 'RefreshCw',
    title: 'Verified Accounts',
    description: 'Steam accounts and game bundles are checked and verified before handoff.',
  },
  {
    icon: 'Layers',
    title: 'Wide Selection',
    description: 'From PUBG bypass tools to Steam accounts and discounted game bundles.',
  },
];

export const STEPS = [
  {
    number: '01',
    title: 'Browse Products',
    description: 'Explore categories — PUBG bypass, Steam games, bundles, and more.',
  },
  {
    number: '02',
    title: 'Place Your Order',
    description: 'Choose your product and pay securely in IQD via WhatsApp or Discord.',
  },
  {
    number: '03',
    title: 'Instant Delivery',
    description: 'Receive your product immediately after payment confirmation.',
  },
];

export const TESTIMONIALS = [
  {
    name: 'Ahmed J.',
    handle: 'Verified Customer',
    quote:
      'Best place to buy gaming tools in Iraq. Fast delivery and the support was really helpful when I had a question.',
    initials: 'AJ',
    tag: 'Works on latest patch',
    hasVideo: true,
  },
  {
    name: 'Sara M.',
    handle: 'Elite Member',
    quote:
      'Got my Steam account within 5 minutes. No regional locking issues and the price was unbeatable.',
    initials: 'SM',
    tag: 'Verified purchase',
    hasVideo: false,
  },
  {
    name: 'Omar K.',
    handle: 'Verified Customer',
    quote:
      'The PUBG bypass works flawlessly. Been using it for a month with zero issues. Highly recommend BEST STORE.',
    initials: 'OK',
    tag: 'Works on latest patch',
    hasVideo: true,
  },
  {
    name: 'Layla H.',
    handle: 'Verified Customer',
    quote:
      'Great deals on game bundles. Saved a lot compared to other stores. Support replied instantly on WhatsApp.',
    initials: 'LH',
    tag: 'Verified purchase',
    hasVideo: false,
  },
];

export type PricingTier = {
  tier: string;
  name: string;
  price: number;
  annualPrice: number;
  period: string;
  annualPeriod: string;
  savings: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
};

export const PRICING_TIERS: PricingTier[] = [
  {
    tier: 'DAILY',
    name: 'Daily Access',
    price: 2000,
    annualPrice: 1500,
    period: '/day',
    annualPeriod: '/day billed yearly',
    savings: 'Save 25%',
    features: [
      'Access to 1 software',
      'Auto-updates included',
      'HWID spoofer included',
      '24/7 support',
      'Instant activation',
    ],
    highlighted: false,
  },
  {
    tier: 'WEEKLY',
    name: 'Weekly Warrior',
    price: 12000,
    annualPrice: 9000,
    period: '/week',
    annualPeriod: '/week billed yearly',
    savings: 'Save 25%',
    features: [
      'Access to 3 softwares',
      'Auto-updates included',
      'HWID spoofer included',
      '24/7 priority support',
      'Config library access',
      'Discord VIP role',
    ],
    highlighted: true,
    badge: 'MOST POPULAR',
  },
  {
    tier: 'MONTHLY',
    name: 'Monthly Legend',
    price: 35000,
    annualPrice: 26000,
    period: '/month',
    annualPeriod: '/month billed yearly',
    savings: 'Save 26%',
    features: [
      'Unlimited software access',
      'Auto-updates included',
      'HWID spoofer included',
      '24/7 dedicated support',
      'Early access to new tools',
      'Private build slots',
      'Custom config service',
    ],
    highlighted: false,
  },
];

export const FAQS = [
  {
    question: 'Is the software safe to use?',
    answer:
      'Every tool ships with anti-detection technology and is tested against the latest game patches before release. Status pages show real-time undetected status for each product.',
  },
  {
    question: 'How do I install the software?',
    answer:
      'After purchase you receive an instant download link and a step-by-step guide. The loader handles setup automatically — most users are in-game within 5 minutes.',
  },
  {
    question: 'What happens if a game update breaks the tool?',
    answer:
      'Auto-updates are included in every plan. When a patch drops, tools go into maintenance and update automatically — you never pay extra for updates.',
  },
  {
    question: 'What are the hardware requirements?',
    answer:
      'Windows 10 or 11 (64-bit), 8 GB RAM, and any modern CPU. The HWID spoofer included in all plans works on both Intel and AMD systems.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'If a product does not work as described and our support cannot resolve it, we offer a full refund or replacement. Customer satisfaction is our priority.',
  },
  {
    question: 'Which games are supported?',
    answer:
      'PUBG, Apex Legends, Warzone, Rust, Valorant, and more — plus Steam accounts and game bundles. New titles are added based on community demand.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept local IQD payments, crypto, PayPal, and cards. Contact us on WhatsApp or Discord to complete your order securely.',
  },
];

export const LOGOS = ['PUBG', 'STEAM', 'FORTNITE', 'COD', 'APEX', 'VALORANT'];

export const CATEGORY_COLORS: Record<string, string> = {
  'bypass-pubg': '#7c3aed',
  'steam-games': '#0084FF',
  'discounted-games': '#C87941',
  'other-games': '#10b981',
};

/* ---------- Cyberpunk redesign data ---------- */

export type FeaturedSoftware = {
  id: string;
  name: string;
  game: string;
  status: 'Undetected' | 'Updating';
  rating: number;
  reviews: number;
  price: number;
  period: string;
  icon: string;
  accent: string;
  boughtToday: number;
};

export const FEATURED_SOFTWARE: FeaturedSoftware[] = [
  {
    id: 'apex-aimbot',
    name: 'Apex Aimbot',
    game: 'Apex Legends',
    status: 'Undetected',
    rating: 4.9,
    reviews: 312,
    price: 12000,
    period: '/week',
    icon: 'Crosshair',
    accent: '#00F0FF',
    boughtToday: 23,
  },
  {
    id: 'warzone-esp',
    name: 'Warzone ESP',
    game: 'Call of Duty: Warzone',
    status: 'Undetected',
    rating: 4.8,
    reviews: 268,
    price: 15000,
    period: '/week',
    icon: 'Eye',
    accent: '#B026FF',
    boughtToday: 17,
  },
  {
    id: 'rust-cheat',
    name: 'Rust Cheat',
    game: 'Rust',
    status: 'Undetected',
    rating: 4.7,
    reviews: 194,
    price: 10000,
    period: '/week',
    icon: 'Wrench',
    accent: '#FFD700',
    boughtToday: 11,
  },
  {
    id: 'valorant-triggerbot',
    name: 'Valorant Triggerbot',
    game: 'Valorant',
    status: 'Undetected',
    rating: 4.9,
    reviews: 351,
    price: 14000,
    period: '/week',
    icon: 'Zap',
    accent: '#FF4655',
    boughtToday: 29,
  },
  {
    id: 'pubg-bypass-featured',
    name: 'PUBG Bypass',
    game: 'PUBG',
    status: 'Undetected',
    rating: 4.8,
    reviews: 420,
    price: 12000,
    period: '/week',
    icon: 'ShieldOff',
    accent: '#7c3aed',
    boughtToday: 34,
  },
  {
    id: 'best-chess-featured',
    name: 'Best Chess',
    game: 'Chess.com',
    status: 'Undetected',
    rating: 4.6,
    reviews: 158,
    price: 7000,
    period: '/week',
    icon: 'Trophy',
    accent: '#10b981',
    boughtToday: 8,
  },
];

export type SoftwareCategory = {
  id: string;
  name: string;
  icon: string;
  count: number;
  description: string;
  accent: string;
};

export const SOFTWARE_CATEGORIES: SoftwareCategory[] = [
  {
    id: 'aimbots',
    name: 'Aimbots',
    icon: 'Crosshair',
    count: 8,
    description: 'Precision aim assistance for every shooter',
    accent: '#00F0FF',
  },
  {
    id: 'esp-wallhacks',
    name: 'ESP / Wallhacks',
    icon: 'Eye',
    count: 6,
    description: 'See everything. Miss nothing.',
    accent: '#B026FF',
  },
  {
    id: 'mod-menus',
    name: 'Mod Menus',
    icon: 'Layers',
    count: 5,
    description: 'Full game control at your fingertips',
    accent: '#FFD700',
  },
  {
    id: 'unlock-tools',
    name: 'Unlock Tools',
    icon: 'Unlock',
    count: 7,
    description: 'Skins, accounts, and instant unlocks',
    accent: '#FF4655',
  },
  {
    id: 'spoofers',
    name: 'Spoofers',
    icon: 'Fingerprint',
    count: 4,
    description: 'HWID protection for every session',
    accent: '#7c3aed',
  },
  {
    id: 'game-boosters',
    name: 'Game Boosters',
    icon: 'Gauge',
    count: 6,
    description: 'FPS optimization and performance tools',
    accent: '#10b981',
  },
];

export const STATS = [
  { label: 'Active Users', value: 12400, suffix: '+' },
  { label: 'Games Supported', value: 38, suffix: '' },
  { label: 'Days Undetected', value: 412, suffix: '' },
  { label: 'Customer Reviews', value: 500, suffix: '+' },
];

export const TRUST_BADGES = [
  { icon: 'Lock', label: 'SSL Secured' },
  { icon: 'Fingerprint', label: 'HWID Lock' },
  { icon: 'Headphones', label: '24/7 Support' },
  { icon: 'ShieldCheck', label: 'Anti-Detect' },
];

export const LIVE_PROOF_EVENTS = [
  { name: 'Ahmed', action: 'just unlocked', product: 'Warzone Pro pack' },
  { name: 'Sara', action: 'subscribed to', product: 'Apex Aimbot' },
  { name: 'Omar', action: 'just purchased', product: 'PUBG Bypass — Lifetime' },
  { name: 'Layla', action: 'just unlocked', product: 'Valorant Triggerbot' },
  { name: 'Hassan', action: 'subscribed to', product: 'Monthly Legend plan' },
  { name: 'Zainab', action: 'just purchased', product: 'Steam VIP Account' },
  { name: 'Ali', action: 'just unlocked', product: 'Rust Cheat' },
  { name: 'Noor', action: 'subscribed to', product: 'Weekly Warrior plan' },
  { name: 'Mustafa', action: 'just purchased', product: 'AAA Game Bundle' },
  { name: 'Dina', action: 'just unlocked', product: 'Best Chess — 1 Month' },
];

export const DISCORD_REACTIONS = [
  { user: 'FragLord99', message: 'Warzone ESP is insane on the new patch 🔥', time: '2m ago' },
  { user: 'iraqi_sniper', message: 'HWID spoofer saved my account, instant W', time: '7m ago' },
  { user: 'NoScopeQueen', message: 'Support replied in under a minute. Crazy fast', time: '14m ago' },
  { user: 'apexgod_77', message: 'Aimbot smoothness settings are perfect now', time: '26m ago' },
  { user: 'BaghdadGamer', message: 'Best prices in IQD, no conversion fees 💸', time: '41m ago' },
];
