import type { Locale } from '@/i18n/types';

const BEST_KU = 'بێست';
const BEST_AR = 'بيست';

/** Phonetic "Best" — never translate as باشترین / أفضل in brand names. */
export function transliterateBest(text: string, locale: Locale): string {
  if (locale === 'en') return text;

  const best = locale === 'ku' ? BEST_KU : BEST_AR;

  return text
    .replace(/\bBEST\b/g, best)
    .replace(/\bBest\b/g, best)
    .replace(/باشترین/g, best)
    .replace(/أفضل/g, best);
}
