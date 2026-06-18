import type { Locale } from '@/i18n/types';
import type { NavItem } from '@/data/navigation';
import { transliterateBest } from '@/i18n/transliterate';

type TextEntry = { en: string; ku: string; ar: string };

const T = (en: string, ku: string, ar: string): TextEntry => ({ en, ku, ar });

function pick(entry: TextEntry | undefined, locale: Locale, fallback: string): string {
  if (!entry) return fallback;
  if (locale === 'ku') return entry.ku;
  if (locale === 'ar') return entry.ar;
  return entry.en;
}

export const CATEGORY_I18N: Record<string, { name: TextEntry; description?: TextEntry; tag?: TextEntry }> = {
  'bypass-pubg': {
    name: T('Bypass PUBG', 'بایپاس PUBG', 'تجاوز PUBG'),
    description: T(
      'Premium PUBG bypass tools with anti-detection',
      'ئامرازی بایپاسی PUBGی پێشکەوتوو لەگەڵ دژە دۆزینەوە',
      'أدوات تجاوز PUBG مميزة مع مكافحة الكشف'
    ),
    tag: T('Anti-Detect', 'دژە دۆزینەوە', 'مكافحة الكشف'),
  },
  'steam-games': {
    name: T('Steam Games', 'یارییەکانی ستیم', 'ألعاب ستيم'),
    description: T(
      'Premium Steam game accounts and tools',
      'هەژمار و ئامرازی یاری ستێمی پێشکەوتوو',
      'حسابات وأدوات ألعاب ستيم مميزة'
    ),
    tag: T('Verified', 'پشتڕاستکراو', 'موثق'),
  },
  'discounted-games': {
    name: T('Discounted Games', 'یارییە داشکاندراوەکان', 'ألعاب مخفضة'),
    description: T(
      'Best deals on popular games',
      'باشترین داشکاندن بۆ یارییە بەناوبانگەکان',
      'أفضل العروض على الألعاب الشائعة'
    ),
    tag: T('Deals', 'داشکاندن', 'عروض'),
  },
  'other-games': {
    name: T('Other Games', 'یارییەکانی تر', 'ألعاب أخرى'),
    description: T(
      'Various gaming products and utilities',
      'بەرهەم و ئامرازی جۆراوجۆری یاری',
      'منتجات وأدوات ألعاب متنوعة'
    ),
    tag: T('Tools', 'ئامراز', 'أدوات'),
  },
  'in-game-currency': {
    name: T('Premium Subscriptions', 'بەشداری پڕیمیۆم', 'اشتراكات مميزة'),
    description: T(
      'Premium AI, streaming, and social subscriptions — delivered instantly.',
      'بەشداری پڕیمیۆمی AI، ستریمینگ و کۆمەڵایەتی — بە خێرایی دەگەیەنرێت.',
      'اشتراكات مميزة للذكاء الاصطناعي والبث والتواصل — تُسلّم فوراً.'
    ),
    tag: T('Subscriptions', 'بەشداری', 'اشتراكات'),
  },
  'digital-services': {
    name: T('Digital Services', 'خزمەتگوزاری دیجیتاڵ', 'خدمات رقمية'),
    description: T(
      'Streaming, apps, game keys, and premium digital subscriptions.',
      'ستریمینگ، ئەپ، کلیلی یاری، و بەشداری دیجیتاڵی پڕیمیۆم.',
      'بث وتطبيقات ومفاتيح ألعاب واشتراكات رقمية مميزة.'
    ),
    tag: T('New', 'نوێ', 'جديد'),
  },
};

export const PRODUCT_I18N: Record<string, { name: TextEntry; description?: TextEntry }> = {
  'pubg-bypass': {
    name: T('PUBG Bypass', 'بایپاس PUBG', 'تجاوز PUBG'),
    description: T('Premium PUBG bypass with anti-detection', 'بایپاسی PUBGی پێشکەوتوو', 'تجاوز PUBG مميز'),
  },
  gemini: {
    name: T('Gemini', 'Gemini', 'Gemini'),
    description: T(
      'Google Gemini AI — premium access',
      'Google Gemini AI — دەستگەیشتنی پڕیمیۆم',
      'Google Gemini AI — وصول مميز'
    ),
  },
  chatgpt: {
    name: T('ChatGPT', 'ChatGPT', 'ChatGPT'),
    description: T(
      'OpenAI ChatGPT — premium access',
      'OpenAI ChatGPT — دەستگەیشتنی پڕیمیۆم',
      'OpenAI ChatGPT — وصول مميز'
    ),
  },
  claude: {
    name: T('Claude', 'Claude', 'Claude'),
    description: T(
      'Anthropic Claude — premium access',
      'Anthropic Claude — دەستگەیشتنی پڕیمیۆم',
      'Anthropic Claude — وصول مميز'
    ),
  },
  netflix: {
    name: T('Netflix', 'Netflix', 'Netflix'),
    description: T(
      'Netflix streaming subscription',
      'بەشداری ستریمینگی Netflix',
      'اشتراك بث Netflix'
    ),
  },
  discord: {
    name: T('Discord', 'Discord', 'Discord'),
    description: T(
      'Discord Nitro and premium features',
      'Discord Nitro و تایبەتمەندی پڕیمیۆم',
      'Discord Nitro وميزات مميزة'
    ),
  },
  youtube: {
    name: T('YouTube', 'YouTube', 'YouTube'),
    description: T(
      'YouTube Premium subscription',
      'بەشداری YouTube Premium',
      'اشتراك YouTube Premium'
    ),
  },
  deepseek: {
    name: T('DeepSeek', 'DeepSeek', 'DeepSeek'),
    description: T(
      'DeepSeek AI — premium access',
      'DeepSeek AI — دەستگەیشتنی پڕیمیۆم',
      'DeepSeek AI — وصول مميز'
    ),
  },
  spotify: {
    name: T('Spotify', 'Spotify', 'Spotify'),
    description: T(
      'Spotify Premium subscription',
      'بەشداری Spotify Premium',
      'اشتراك Spotify Premium'
    ),
  },
  'steam-account-1': {
    name: T('Steam Premium Account', 'هەژماری پڕیمیۆمی ستیم', 'حساب ستيم بريميوم'),
    description: T('Verified Steam account with premium games', 'هەژماری ستێمی پشتڕاستکراو', 'حساب ستيم موثق'),
  },
  'steam-account-2': {
    name: T('Steam VIP Account', 'هەژماری VIPی ستیم', 'حساب ستيم VIP'),
    description: T('VIP Steam account with exclusive titles', 'هەژماری ستێمی VIP', 'حساب ستيم VIP حصري'),
  },
  'steam-tools': {
    name: T('Steam Tools Package', 'پاکێجی ئامرازی ستیم', 'حزمة أدوات ستيم'),
    description: T('Complete Steam utility package', 'پاکێجی تەواوی ئامرازی ستیم', 'حزمة أدوات ستيم كاملة'),
  },
  'game-bundle-1': {
    name: T('AAA Game Bundle', 'پاکێجی یاری AAA', 'حزمة ألعاب AAA'),
    description: T('Bundle of top AAA titles', 'کۆمەڵەی باشترین یارییەکان', 'مجموعة من أفضل الألعاب'),
  },
  'indie-bundle': {
    name: T('Indie Games Pack', 'پاکێجی یاری ئیندی', 'حزمة ألعاب مستقلة'),
    description: T('Curated indie game collection', 'کۆمەڵەی یاری ئیندی', 'مجموعة ألعاب مستقلة'),
  },
  'retro-bundle': {
    name: T('Retro Classics Bundle', 'پاکێجی کلاسیکی کۆن', 'حزمة كلاسيكيات قديمة'),
    description: T('Classic games from the 90s', 'یارییە کلاسیکییەکانی ٩٠ەکان', 'ألعاب كلاسيكية من التسعينات'),
  },
  'best-chess': {
    name: T('Best Chess', 'بێست شەترەنج', 'بيست شطرنج'),
    description: T('The best chess assistant you can find', 'یاریدەدەری بێست شەترەنج', 'مساعد بيست شطرنج'),
  },
  'multi-game-tool': {
    name: T('Universal Gaming Suite', 'پاکێجی گشتی یاری', 'حزمة ألعاب شاملة'),
    description: T('Multi-game utility and enhancement tools', 'ئامرازی فرە یاری', 'أدوات متعددة الألعاب'),
  },
  'game-optimizer': {
    name: T('Gaming Performance Booster', 'بەرزکەرەوەی کارایی یاری', 'معزز أداء الألعاب'),
    description: T('Optimize performance across multiple games', 'باشترکردنی کارایی لە چەند یارییەکدا', 'تحسين الأداء عبر عدة ألعاب'),
  },
  'game-recorder': {
    name: T('Multi-Game Recorder', 'تۆمارکەری فرە یاری', 'مسجل متعدد الألعاب'),
    description: T('Record gameplay from various games', 'تۆمارکردنی یاری لە چەند یارییەکدا', 'تسجيل اللعب من ألعاب متعددة'),
  },
  'pubg-uc': {
    name: T('PUBG UC', 'PUBG UC', 'PUBG UC'),
    description: T(
      'Instant UC top-up delivered to your PUBG ID',
      'پڕکردنەوەی UC بە خێرایی دەگەیەنرێت بۆ ناسنامەی PUBGەکەت',
      'شحن UC فوري يُسلّم إلى معرف PUBG الخاص بك'
    ),
  },
  'free-fire-diamonds': {
    name: T('Free Fire Diamonds', 'ئەڵماسی Free Fire', 'ألماس Free Fire'),
    description: T(
      'Diamonds delivered instantly to your Free Fire',
      'ئەڵماس بە خێرایی دەگەیەنرێت بۆ Free Fireەکەت',
      'ألماس يُسلّم فوراً إلى فري فاير الخاص بك'
    ),
  },
  'cod-cp': {
    name: T('Call of Duty CP', 'CPی Call of Duty', 'CP كول أوف ديوتي'),
    description: T(
      'COD Points for Modern Warfare, Warzone & Mobile',
      'خاڵی COD بۆ Modern Warfare، Warzone و Mobile',
      'نقاط COD لمودرن وارفير ووارزون والموبايل'
    ),
  },
  'fortnite-vbucks': {
    name: T('Fortnite V-Bucks', 'V-Bucksی Fortnite', 'فيبوكس فورتنايت'),
    description: T(
      'Top up V-Bucks for skins, battle pass and emotes',
      'پڕکردنەوەی V-Bucks بۆ ستایل، باتڵ پاس و ئیمۆت',
      'اشحن فيبوكس للأزياء وبطاقة المعركة والإيموتات'
    ),
  },
  'steam-wallet-code': {
    name: T('Steam Wallet Code', 'کۆدی جزدانی ستیم', 'رمز محفظة ستيم'),
    description: T(
      'Steam Wallet codes - works on any Steam region',
      'کۆدی جزدانی ستیم — لە هەر ناوچەیەکی ستیمدا کاردەکات',
      'رموز محفظة ستيم — تعمل في أي منطقة ستيم'
    ),
  },
};

/** Fallback when slug has no description entry — keyed by exact English DB text */
export const PRODUCT_DESCRIPTION_I18N: Record<string, TextEntry> = {
  'Instant UC top-up delivered to your PUBG ID': PRODUCT_I18N['pubg-uc'].description!,
  'Diamonds delivered instantly to your Free Fire': PRODUCT_I18N['free-fire-diamonds'].description!,
  'COD Points for Modern Warfare, Warzone & Mobile': PRODUCT_I18N['cod-cp'].description!,
  'Top up V-Bucks for skins, battle pass and emotes': PRODUCT_I18N['fortnite-vbucks'].description!,
  'Steam Wallet codes - works on any Steam region': PRODUCT_I18N['steam-wallet-code'].description!,
};

export const NAV_I18N: Record<string, TextEntry> = {
  'cat-top-up': T('Premium Subscriptions', 'بەشداری پڕیمیۆم', 'اشتراكات مميزة'),
  'cat-game-item': T('Game Item', 'بەرهەمی یاری', 'عنصر لعبة'),
  'cat-game-accounts': T('Game Accounts', 'هەژماری یاری', 'حسابات ألعاب'),
  'cat-game-coins': T('Game Coins', 'دراوی یاری', 'عملات اللعبة'),
  'cat-gift-cards': T('Gift Cards', 'کارتی دیاری', 'بطاقات هدايا'),
  'cat-boosting': T('Boosting', 'بەرزکردنەوە', 'تعزيز'),
  'cat-game-cheats': T('Game Cheats', 'چیتەکانی یاری', 'غش الألعاب'),
  'coins-pubg': T('PUBG UC', 'PUBG UC', 'PUBG UC'),
  'coins-ff': T('Free Fire Diamonds', 'ئەڵماسی Free Fire', 'ألماس Free Fire'),
  'coins-cod': T('Call of Duty CP', 'CPی Call of Duty', 'CP كول أوف ديوتي'),
  'coins-fortnite': T('Fortnite V-Bucks', 'V-Bucksی Fortnite', 'فيبوكس فورتنايت'),
  'gift-steam': T('Steam Wallet Code', 'کۆدی جزدانی ستیم', 'رمز محفظة ستيم'),
  'boost-optimizer': T('Gaming Performance Booster', 'بەرزکەرەوەی کارایی یاری', 'معزز أداء الألعاب'),
  'boost-recorder': T('Multi-Game Recorder', 'تۆمارکەری فرە یاری', 'مسجل متعدد الألعاب'),
  'cheat-chess': T('Best Chess', 'بێست شەترەنج', 'بيست شطرنج'),
  'cheat-bypass-pubg': T('Bypass PUBG', 'بایپاس PUBG', 'تجاوز PUBG'),
  'bypass-1day': T('1 Day', '١ ڕۆژ', 'يوم واحد'),
  'bypass-1week': T('1 Week', '١ هەفتە', 'أسبوع واحد'),
  'bypass-1month': T('1 Month', '١ مانگ', 'شهر واحد'),
  'bypass-lifetime': T('Lifetime', 'هەمیشەیی', 'مدى الحياة'),
  'prod-currency': T('Premium Subscriptions', 'بەشداری پڕیمیۆم', 'اشتراكات مميزة'),
  'prod-discord': T('Discord', 'Discord', 'Discord'),
  'prod-netflix': T('Netflix', 'Netflix', 'Netflix'),
  'prod-claude': T('Claude', 'Claude', 'Claude'),
  'prod-youtube': T('YouTube', 'YouTube', 'YouTube'),
  'prod-gemini': T('Gemini', 'Gemini', 'Gemini'),
  'prod-chatgpt': T('ChatGPT', 'ChatGPT', 'ChatGPT'),
  'prod-deepseek': T('DeepSeek', 'DeepSeek', 'DeepSeek'),
  'prod-spotify': T('Spotify', 'Spotify', 'Spotify'),
  'prod-accounts': T('Steam Games', 'یارییەکانی ستیم', 'ألعاب ستيم'),
  'prod-discounted': T('Discounted Games', 'یارییە داشکاندراوەکان', 'ألعاب مخفضة'),
  'prod-cheats': T('Game Cheats', 'چیتەکانی یاری', 'غش الألعاب'),
  'prod-other': T('Other Games', 'یارییەکانی تر', 'ألعاب أخرى'),
  'prod-pubg-uc': T('PUBG UC', 'PUBG UC', 'PUBG UC'),
  'prod-ff': T('Free Fire Diamonds', 'ئەڵماسی Free Fire', 'ألماس Free Fire'),
  'prod-cod': T('Call of Duty CP', 'CPی Call of Duty', 'CP كول أوف ديوتي'),
  'prod-fortnite': T('Fortnite V-Bucks', 'V-Bucksی Fortnite', 'فيبوكس فورتنايت'),
  'prod-steam-wallet': T('Steam Wallet Code', 'کۆدی جزدانی ستیم', 'رمز محفظة ستيم'),
  'prod-steam-1': T('Steam Premium Account', 'هەژماری پڕیمیۆمی ستیم', 'حساب ستيم بريميوم'),
  'prod-steam-2': T('Steam VIP Account', 'هەژماری VIPی ستیم', 'حساب ستيم VIP'),
  'prod-steam-tools': T('Steam Tools Package', 'پاکێجی ئامرازی ستیم', 'حزمة أدوات ستيم'),
  'prod-aaa': T('AAA Game Bundle', 'پاکێجی یاری AAA', 'حزمة ألعاب AAA'),
  'prod-indie': T('Indie Games Pack', 'پاکێجی یاری ئیندی', 'حزمة ألعاب مستقلة'),
  'prod-retro': T('Retro Classics Bundle', 'پاکێجی کلاسیکی کۆن', 'حزمة كلاسيكيات قديمة'),
  'prod-chess': T('Best Chess', 'بێست شەترەنج', 'بيست شطرنج'),
  'prod-bypass': T('Bypass PUBG', 'بایپاس PUBG', 'تجاوز PUBG'),
  'prod-bypass-1day': T('1 Day', '١ ڕۆژ', 'يوم واحد'),
  'prod-bypass-1week': T('1 Week', '١ هەفتە', 'أسبوع واحد'),
  'prod-bypass-1month': T('1 Month', '١ مانگ', 'شهر واحد'),
  'prod-bypass-lifetime': T('Lifetime', 'هەمیشەیی', 'مدى الحياة'),
  'prod-suite': T('Universal Gaming Suite', 'پاکێجی گشتی یاری', 'حزمة ألعاب شاملة'),
  'prod-booster': T('Gaming Performance Booster', 'بەرزکەرەوەی کارایی یاری', 'معزز أداء الألعاب'),
  'prod-recorder': T('Multi-Game Recorder', 'تۆمارکەری فرە یاری', 'مسجل متعدد الألعاب'),
};

export const DURATION_I18N: Record<string, TextEntry> = {
  '3 Months': T('3 Months', '٣ مانگ', '٣ أشهر'),
  '6 Months': T('6 Months', '٦ مانگ', '٦ أشهر'),
  '1 Year': T('1 Year', '١ ساڵ', 'سنة واحدة'),
  '1 Day': T('1 Day', '١ ڕۆژ', 'يوم واحد'),
  '1 Week': T('1 Week', '١ هەفتە', 'أسبوع واحد'),
  '1 Month': T('1 Month', '١ مانگ', 'شهر واحد'),
  Lifetime: T('Lifetime', 'هەمیشەیی', 'مدى الحياة'),
  Permanent: T('Permanent', 'هەمیشەیی', 'دائم'),
  Standard: T('Standard', 'ستاندارد', 'قياسي'),
};

export const PLAN_TYPE_I18N: Record<string, TextEntry> = {
  Subscription: T('Subscription', 'بەشداری', 'اشتراك'),
  Account: T('Account', 'هەژمار', 'حساب'),
};

export const PRIZE_I18N: Record<string, TextEntry> = {
  '10% Store Credit': T('10% Store Credit', '١٠٪ کرێدیتی فرۆشگا', '١٠٪ رصيد متجر'),
  '500 IQD Bonus': T('500 IQD Bonus', '٥٠٠ دیناری عێراقی بۆنس', '٥٠٠ دينار عراقي مكافأة'),
  'Free Delivery Token': T('Free Delivery Token', 'نیشانەی گەیاندنی خۆڕایی', 'رمز توصيل مجاني'),
  '1000 IQD Bonus': T('1000 IQD Bonus', '١٠٠٠ دیناری عێراقی بۆنس', '١٠٠٠ دينار عراقي مكافأة'),
  'Rare Skin Voucher': T('Rare Skin Voucher', 'کوپۆنی پێستی نایاب', 'قسيمة سكن نادر'),
  'Grand Prize — 5000 IQD': T('Grand Prize — 5000 IQD', 'خەڵاتی گەورە — ٥٠٠٠ دینار', 'الجائزة الكبرى — ٥٠٠٠ دينار'),
};

export const FEATURE_I18N: Record<string, { title: TextEntry; description: TextEntry }> = {
  'Instant Delivery': {
    title: T('Instant Delivery', 'گەیاندنی خێرا', 'توصيل فوري'),
    description: T(
      'Get your products immediately after purchase. No waiting, no delays.',
      'بەرهەمەکانت دەستبەجێ دوای کڕین وەربگرە.',
      'احصل على منتجاتك فوراً بعد الشراء.'
    ),
  },
  'Premium Quality': {
    title: T('Premium Quality', 'کوالیتی پێشکەوتوو', 'جودة مميزة'),
    description: T(
      'All products are tested and verified before delivery to ensure reliability.',
      'هەموو بەرهەمەکان پێش گەیاندن تاقی دەکرێنەوە.',
      'جميع المنتجات مختبرة وموثقة قبل التوصيل.'
    ),
  },
  '24/7 Support': {
    title: T('24/7 Support', 'پشتگیری ٢٤/٧', 'دعم ٢٤/٧'),
    description: T(
      'Our support team is available around the clock via Discord and WhatsApp.',
      'تیمی پشتگیریمان بەردەستە لە ڕێگەی دیسکۆرد و واتساپ.',
      'فريق الدعم متاح على مدار الساعة عبر ديسكورد وواتساب.'
    ),
  },
  'Local IQD Payments': {
    title: T('Local IQD Payments', 'پارەدان بە دیناری عێراقی', 'الدفع بالدينار العراقي'),
    description: T(
      'Pay in Iraqi Dinar with secure local payment options tailored for gamers.',
      'بە دیناری عێراقی پارە بدە بە ڕێگاکانی پارەدانی پارێزراو.',
      'ادفع بالدينار العراقي بخيارات دفع محلية آمنة.'
    ),
  },
  'Verified Accounts': {
    title: T('Verified Accounts', 'هەژمارە پشتڕاستکراوەکان', 'حسابات موثقة'),
    description: T(
      'Steam accounts and game bundles are checked and verified before handoff.',
      'هەژمارەکانی ستیم پێش گەیاندن پشکنین دەکرێن.',
      'حسابات ستيم وحزم الألعاب تُفحص قبل التسليم.'
    ),
  },
  'Wide Selection': {
    title: T('Wide Selection', 'هەڵبژاردەی فراوان', 'تشكيلة واسعة'),
    description: T(
      'From PUBG bypass tools to Steam accounts and discounted game bundles.',
      'لە بایپاسی PUBG تا هەژماری ستیم و پاکێجی داشکاندراو.',
      'من أدوات تجاوز PUBG إلى حسابات ستيم وحزم مخفضة.'
    ),
  },
};

export const TAG_I18N: Record<string, TextEntry> = {
  'Anti-Detect': T('Anti-Detect', 'دژە دۆزینەوە', 'مكافحة الكشف'),
  Verified: T('Verified', 'پشتڕاستکراو', 'موثق'),
  Deals: T('Deals', 'داشکاندن', 'عروض'),
  Tools: T('Tools', 'ئامراز', 'أدوات'),
  'Top Up': T('Top Up', 'پڕکردنەوە', 'شحن'),
};

function localizeTag(tag: string | null | undefined, locale: Locale): string | null | undefined {
  if (!tag) return tag;
  const entry = TAG_I18N[tag];
  return entry ? pick(entry, locale, tag) : tag;
}

export function localizeCategory<T extends { slug?: string; id?: string; name: string; description?: string | null; tag?: string | null }>(
  category: T,
  locale: Locale
): T {
  const key = category.slug ?? category.id ?? '';
  const entry = CATEGORY_I18N[key];
  return {
    ...category,
    name: transliterateBest(
      entry ? pick(entry.name, locale, category.name) : category.name,
      locale
    ),
    description: entry?.description
      ? pick(entry.description, locale, category.description ?? '')
      : category.description,
    tag: entry?.tag
      ? pick(entry.tag, locale, category.tag ?? '')
      : localizeTag(category.tag, locale) ?? category.tag,
  };
}

export function localizeProduct<T extends { slug?: string; id?: string; name: string; description?: string | null }>(
  product: T,
  locale: Locale
): T {
  const key = product.slug ?? product.id ?? '';
  const entry = PRODUCT_I18N[key];
  const rawDescription = product.description ?? '';
  const descriptionEntry =
    entry?.description ??
    (rawDescription ? PRODUCT_DESCRIPTION_I18N[rawDescription] : undefined);

  return {
    ...product,
    name: transliterateBest(
      entry ? pick(entry.name, locale, product.name) : product.name,
      locale
    ),
    description: descriptionEntry
      ? pick(descriptionEntry, locale, rawDescription)
      : product.description,
  };
}

export function localizeNavItem(item: NavItem, locale: Locale): NavItem {
  const raw = NAV_I18N[item.id] ? pick(NAV_I18N[item.id], locale, item.label) : item.label;
  const label = transliterateBest(raw, locale);
  return {
    ...item,
    label,
    children: item.children?.map((child) => localizeNavItem(child, locale)),
  };
}

export function localizeDuration(duration: string | null | undefined, locale: Locale): string {
  if (!duration) return '';
  const entry = DURATION_I18N[duration];
  return entry ? pick(entry, locale, duration) : duration;
}

export function localizePlanType(planType: string | null | undefined, locale: Locale): string {
  if (!planType) return '';
  const entry = PLAN_TYPE_I18N[planType];
  return entry ? pick(entry, locale, planType) : planType;
}

export function localizePrizeName(name: string, locale: Locale): string {
  const entry = PRIZE_I18N[name];
  const raw = entry ? pick(entry, locale, name) : name;
  return transliterateBest(raw, locale);
}

export function localizeFeature(
  title: string,
  description: string,
  locale: Locale
): { title: string; description: string } {
  const entry = FEATURE_I18N[title];
  if (!entry) return { title, description };
  return {
    title: pick(entry.title, locale, title),
    description: pick(entry.description, locale, description),
  };
}
