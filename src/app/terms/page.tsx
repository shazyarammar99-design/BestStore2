import type { Metadata } from 'next';
import TermsPageClient from './TermsPageClient';

export const metadata: Metadata = {
  title: 'Terms of Service — BEST STORE',
  description: 'Terms and conditions for using BEST STORE digital gaming products and services.',
};

export default function TermsPage() {
  return <TermsPageClient />;
}
