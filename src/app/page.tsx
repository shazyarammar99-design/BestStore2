import AdBanner from '@/components/AdBanner';
import NewReleaseCarousel from '@/components/NewReleaseCarousel';
import { HomeCategoriesSection, HomeProductsSection } from '@/components/HomeCatalogSections';
import HeroSection from '@/sections/HeroSection';
import TrustBar from '@/sections/TrustBar';
import HowItWorks from '@/sections/HowItWorks';
import FAQ from '@/sections/FAQ';
import { getCategories, getFeaturedProducts } from '@/lib/catalog';

export const revalidate = 60;

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <>
      <HeroSection />
      <AdBanner variant="promo" />
      <NewReleaseCarousel />
      <TrustBar />
      <HomeCategoriesSection categories={categories} />
      <HomeProductsSection products={products} />
      <HowItWorks />
      <FAQ />
    </>
  );
}
