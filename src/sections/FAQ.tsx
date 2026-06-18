'use client';

import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getFaqs } from '@/i18n/content';
import { useCmsBlocks } from '@/hooks/useCmsBlocks';
import type { FaqPayload } from '@/types/site-content';
import { ChevronDown } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import { useTranslation } from '@/context/LocaleContext';

gsap.registerPlugin(ScrollTrigger);

function AccordionItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!answerRef.current) return;
    if (isOpen) {
      gsap.to(answerRef.current, {
        height: 'auto',
        opacity: 1,
        duration: 0.3,
        ease: 'power2.inOut',
      });
    } else {
      gsap.to(answerRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.inOut',
      });
    }
  }, [isOpen]);

  return (
    <div
      className={`faq-item overflow-hidden rounded-lg border bg-best-elevated transition-colors duration-300 ${
        isOpen ? 'border-best-cyan/50' : 'border-best-border'
      }`}
    >
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-white/[0.02]"
      >
        <span className="font-heading pr-4 text-base font-semibold text-white">{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-all duration-300 ${
            isOpen ? 'rotate-180 text-best-cyan' : 'text-best-caption'
          }`}
        />
      </button>
      <div ref={answerRef} className="h-0 overflow-hidden opacity-0">
        <div className="px-6 pb-5 text-sm leading-relaxed text-best-muted">{answer}</div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t, locale } = useTranslation();
  const { blocks } = useCmsBlocks('faq', locale);
  const cmsFaqs = blocks.map((b) => b.payload as FaqPayload);
  const faqs = cmsFaqs.length
    ? cmsFaqs
    : getFaqs(locale);

  useGSAP(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll('.faq-item');
    gsap.from(items, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%',
      },
    });
  }, { scope: containerRef });

  const handleClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeader eyebrow={t('sections.faq')} headline={t('sections.faq')} />

        <div ref={containerRef} className="mt-16 space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i}
              onClick={() => handleClick(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
