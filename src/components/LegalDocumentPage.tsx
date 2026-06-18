'use client';

import Link from 'next/link';
import { useTranslation } from '@/context/LocaleContext';
import { LAST_UPDATED } from '@/legal/config';
import type { LegalDocument } from '@/legal/types';

type Props = {
  document: LegalDocument;
  alternateHref?: string;
  alternateLabel?: string;
};

export default function LegalDocumentPage({ document, alternateHref, alternateLabel }: Props) {
  const { t } = useTranslation();

  return (
    <div className="min-h-[70vh] bg-best-bg py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-10 border-b border-best-border pb-8">
          <p className="font-heading text-xs font-semibold uppercase tracking-widest text-best-cyan">
            {t('legal.lastUpdated', { date: LAST_UPDATED })}
          </p>
          <h1 className="font-display mt-4 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
            {document.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-best-muted">{document.subtitle}</p>
          {alternateHref && alternateLabel ? (
            <p className="mt-4 text-sm text-best-caption">
              {t('legal.seeAlso')}{' '}
              <Link href={alternateHref} className="text-best-cyan hover:underline">
                {alternateLabel}
              </Link>
            </p>
          ) : null}
        </div>

        <div className="space-y-10">
          {document.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-white">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4">
                {section.paragraphs.map((paragraph, i) => (
                  <p key={i} className="text-sm leading-relaxed text-best-muted md:text-base">
                    {paragraph}
                  </p>
                ))}
                {section.bullets?.length ? (
                  <ul className="ml-5 list-disc space-y-2 text-sm leading-relaxed text-best-muted md:text-base">
                    {section.bullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-14 border-t border-best-border pt-8 text-xs leading-relaxed text-best-caption">
          {t('legal.disclaimer')}
        </p>
      </div>
    </div>
  );
}
