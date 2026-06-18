import type { Locale } from '@/i18n/types';
import type { LegalDocument } from '@/legal/types';
import { PRIVACY_AR } from '@/legal/content/privacy-ar';
import { PRIVACY_EN } from '@/legal/content/privacy-en';
import { PRIVACY_KU } from '@/legal/content/privacy-ku';

export function getPrivacyPolicy(locale: Locale): LegalDocument {
  if (locale === 'ku') return PRIVACY_KU;
  if (locale === 'ar') return PRIVACY_AR;
  return PRIVACY_EN;
}
