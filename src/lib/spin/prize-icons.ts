const ICON_SVGS: Record<string, string> = {
  Percent: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
  Coins: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>`,
  Truck: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`,
  Gem: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>`,
  Sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1-.365-.365L.418 5.982a.5.5 0 0 1 .365-.365l6.135-1.582A2 2 0 0 0 8.5.418l1.582-6.135a.5.5 0 0 1 .365-.365l6.135 1.582a2 2 0 0 0 1.437 1.437l1.582 6.135a.5.5 0 0 1-.365.365l-6.135 1.582a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.365.365z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`,
  Trophy: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
  Gift: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>`,
};

const PRIZE_ICON_KEYS: Record<string, string> = {
  '10% Store Credit': 'Percent',
  '500 IQD Bonus': 'Coins',
  'Free Delivery Token': 'Truck',
  '1000 IQD Bonus': 'Gem',
  'Rare Skin Voucher': 'Sparkles',
  'Grand Prize — 5000 IQD': 'Trophy',
};

const imageCache = new Map<string, HTMLImageElement>();
const imagePromises = new Map<string, Promise<HTMLImageElement | null>>();

export function getPrizeIconKey(prizeName: string): string {
  return PRIZE_ICON_KEYS[prizeName] ?? 'Gift';
}

function iconSvgMarkup(iconKey: string, size: number, color: string): string {
  const template = ICON_SVGS[iconKey] ?? ICON_SVGS.Gift;
  return template.replace(/COLOR/g, color).replace(/width="24"/, `width="${size}"`).replace(/height="24"/, `height="${size}"`);
}

export function loadPrizeIconImage(
  iconKey: string,
  size = 24,
  color = '#FFFFFF'
): Promise<HTMLImageElement | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);

  const cacheKey = `${iconKey}-${size}-${color}`;
  const cached = imageCache.get(cacheKey);
  if (cached) return Promise.resolve(cached);

  const pending = imagePromises.get(cacheKey);
  if (pending) return pending;

  const promise = new Promise<HTMLImageElement | null>((resolve) => {
    const svg = iconSvgMarkup(iconKey, size, color);
    const img = new Image();
    img.onload = () => {
      imageCache.set(cacheKey, img);
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });

  imagePromises.set(cacheKey, promise);
  return promise;
}

export function loadPrizeImageFromUrl(url: string): Promise<HTMLImageElement | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);

  const cached = imageCache.get(url);
  if (cached) return Promise.resolve(cached);

  const pending = imagePromises.get(url);
  if (pending) return pending;

  const promise = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });

  imagePromises.set(url, promise);
  return promise;
}

export { PRIZE_ICON_KEYS };
