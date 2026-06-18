'use client';

import { useTranslation } from '@/context/LocaleContext';
import LegalDocumentPage from '@/components/LegalDocumentPage';
import { getTerms } from '@/legal/terms';

export default function TermsPageClient() {
  const { locale, t } = useTranslation();
  const document = getTerms(locale);

  return (
    <LegalDocumentPage
      document={document}
      alternateHref="/privacy"
      alternateLabel={t('footer.privacy')}
    />
  );
}
