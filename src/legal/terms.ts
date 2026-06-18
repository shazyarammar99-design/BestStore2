import type { Locale } from '@/i18n/types';
import type { LegalDocument } from '@/legal/types';
import { TERMS_AR } from '@/legal/content/terms-ar';
import { TERMS_EN } from '@/legal/content/terms-en';
import { TERMS_KU } from '@/legal/content/terms-ku';

export function getTerms(locale: Locale): LegalDocument {
  if (locale === 'ku') return TERMS_KU;
  if (locale === 'ar') return TERMS_AR;
  return TERMS_EN;
}
