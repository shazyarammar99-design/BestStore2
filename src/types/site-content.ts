export type AdPlacement = 'navbar' | 'sidebar' | 'footer';

export type SiteAd = {
  id: string;
  placement: AdPlacement;
  image_url: string;
  link_url: string;
  alt_text: string;
  sort_order: number;
  active: boolean;
  created_at: string;
};

export type CmsSection = 'hero' | 'feature' | 'step' | 'testimonial' | 'faq';

export type CmsBlock = {
  id: string;
  section: CmsSection;
  locale: 'en' | 'ku' | 'ar';
  payload: Record<string, unknown>;
  sort_order: number;
  active: boolean;
  created_at: string;
};

export type HeroPayload = {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subtitle: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

export type FaqPayload = { question: string; answer: string };
export type StepPayload = { number: string; title: string; description: string };
export type FeaturePayload = { icon: string; title: string; description: string };
export type TestimonialPayload = {
  name: string;
  handle: string;
  quote: string;
  initials: string;
  tag: string;
  hasVideo: boolean;
};
