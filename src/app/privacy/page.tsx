import type { Metadata } from 'next';
import PrivacyPageClient from './PrivacyPageClient';

export const metadata: Metadata = {
  title: 'Privacy Policy — BEST STORE',
  description: 'How BEST STORE collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}
