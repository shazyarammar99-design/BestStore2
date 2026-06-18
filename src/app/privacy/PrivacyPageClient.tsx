'use client';

import { useTranslation } from '@/context/LocaleContext';
import LegalDocumentPage from '@/components/LegalDocumentPage';
import { getPrivacyPolicy } from '@/legal/privacy';

export default function PrivacyPageClient() {
  const { locale, t } = useTranslation();
  const document = getPrivacyPolicy(locale);

  return (
    <LegalDocumentPage
      document={document}
      alternateHref="/terms"
      alternateLabel={t('footer.terms')}
    />
  );
}
