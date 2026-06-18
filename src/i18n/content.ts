import type { Locale } from '@/i18n/types';

type FaqItem = { question: string; answer: string };
type StepItem = { number: string; title: string; description: string };

const FAQ_EN: FaqItem[] = [
  {
    question: 'Is the software safe to use?',
    answer:
      'Every tool ships with anti-detection technology and is tested against the latest game patches before release.',
  },
  {
    question: 'How do I install the software?',
    answer:
      'After purchase you receive an instant download link and a step-by-step guide. Most users are in-game within 5 minutes.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept local IQD payments, crypto, PayPal, and cards. Contact us on WhatsApp or Discord to complete your order securely.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'If a product does not work as described and our support cannot resolve it, we offer a full refund or replacement.',
  },
];

const FAQ_KU: FaqItem[] = [
  {
    question: 'ئامرازەکە سەلامەتە بۆ بەکارهێنان؟',
    answer: 'هەموو ئامرازەکان لەگەڵ تەکنەلۆژیای دژە دۆزینەوە دەگەیەنرێن و پێش بڵاوکردنەوە تاقی دەکرێنەوە.',
  },
  {
    question: 'چۆن ئامرازەکە دامەزرێنم؟',
    answer: 'دوای کڕین بەستەری داگرتن و ڕێنمایی هەنگاو بە هەنگاو وەردەگریت. زۆربەی بەکارهێنەران لە ٥ خولەکدا دەست دەکەن.',
  },
  {
    question: 'چ ڕێگایەکی پارەدان قبوڵ دەکەن؟',
    answer: 'پارەدان بە دیناری عێراقی، کریپتۆ، پەیپاڵ و کارت قبوڵ دەکرێت. لە ڕێگەی واتساپ یان دیسکۆرد پەیوەندیمان پێوە بکە.',
  },
  {
    question: 'گەڕاندنەوەی پارە هەیە؟',
    answer: 'ئەگەر بەرهەمەکە وەک ڕاگەیاندراو کار نەکرد و پشتگیری چارەسەر نەکرد، گەڕاندنەوەی تەواو یان جێگرتنەوە دەدەین.',
  },
];

const FAQ_AR: FaqItem[] = [
  {
    question: 'هل البرنامج آمن للاستخدام؟',
    answer: 'كل أداة تأتي بتقنية مكافحة الكشف ويتم اختبارها قبل الإصدار.',
  },
  {
    question: 'كيف أثبت البرنامج؟',
    answer: 'بعد الشراء تحصل على رابط تحميل فوري ودليل خطوة بخطوة. معظم المستخدمين يبدأون خلال 5 دقائق.',
  },
  {
    question: 'ما طرق الدفع المقبولة؟',
    answer: 'نقبل الدينار العراقي والعملات الرقمية وباي بال والبطاقات. تواصل معنا عبر واتساب أو ديسكورد.',
  },
  {
    question: 'هل تقدمون استرداداً؟',
    answer: 'إذا لم يعمل المنتج كما هو موصوف ولم نتمكن من حله، نقدم استرداداً كاملاً أو بديلاً.',
  },
];

const STEPS_EN: StepItem[] = [
  { number: '01', title: 'Browse Products', description: 'Explore categories — PUBG bypass, Steam games, bundles, and more.' },
  { number: '02', title: 'Place Your Order', description: 'Choose your product and pay securely via WhatsApp or Discord.' },
  { number: '03', title: 'Instant Delivery', description: 'Receive your product immediately after payment confirmation.' },
];

const STEPS_KU: StepItem[] = [
  { number: '01', title: 'بەرهەم بگەڕێ', description: 'پۆلەکان بگەڕێ — بایپاسی PUBG، یاری ستێم، پاکێج و زیاتر.' },
  { number: '02', title: 'داواکاری بنێرە', description: 'بەرهەم هەڵبژێرە و بە پارێزراوی لە ڕێگەی واتساپ یان دیسکۆرد پارە بدە.' },
  { number: '03', title: 'گەیاندنی خێرا', description: 'بەرهەمەکەت دەستبەجێ دوای پشتڕاستکردنەوەی پارە وەربگرە.' },
];

const STEPS_AR: StepItem[] = [
  { number: '01', title: 'تصفح المنتجات', description: 'استكشف الفئات — تجاوز PUBG، ألعاب ستيم، الحزم والمزيد.' },
  { number: '02', title: 'قدّم طلبك', description: 'اختر منتجك وادفع بأمان عبر واتساب أو ديسكورد.' },
  { number: '03', title: 'توصيل فوري', description: 'استلم منتجك فوراً بعد تأكيد الدفع.' },
];

const TRUST_BADGES_EN = [
  { icon: 'Headphones', label: '24/7 Support' },
  { icon: 'ShieldCheck', label: 'Anti-Detect' },
];

const TRUST_BADGES_KU = [
  { icon: 'Headphones', label: 'پشتگیری ٢٤/٧' },
  { icon: 'ShieldCheck', label: 'دژە دۆزینەوە' },
];

const TRUST_BADGES_AR = [
  { icon: 'Headphones', label: 'دعم ٢٤/٧' },
  { icon: 'ShieldCheck', label: 'مكافحة الكشف' },
];

export function getFaqs(locale: Locale): FaqItem[] {
  if (locale === 'ku') return FAQ_KU;
  if (locale === 'ar') return FAQ_AR;
  return FAQ_EN;
}

export function getSteps(locale: Locale): StepItem[] {
  if (locale === 'ku') return STEPS_KU;
  if (locale === 'ar') return STEPS_AR;
  return STEPS_EN;
}

export function getTrustBadges(locale: Locale) {
  if (locale === 'ku') return TRUST_BADGES_KU;
  if (locale === 'ar') return TRUST_BADGES_AR;
  return TRUST_BADGES_EN;
}
