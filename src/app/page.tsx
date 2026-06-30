import AdBanner from '@/components/AdBanner';
import NewReleaseCarousel from '@/components/NewReleaseCarousel';
import { HomeCategoriesSection, HomeProductsSection } from '@/components/HomeCatalogSections';
import HeroSection from '@/sections/HeroSection';
import TrustBar from '@/sections/TrustBar';
import HowItWorks from '@/sections/HowItWorks';
import FAQ from '@/sections/FAQ';
import FeaturedBento from '@/sections/FeaturedBento';
import { getCategories, getFeaturedProducts, getFeaturedBentoConfig, getProducts } from '@/lib/catalog';

export const revalidate = 60;

export default async function HomePage() {
  const [categories, allProducts, bentoConfig] = await Promise.all([
    getCategories(),
    getProducts(),
    getFeaturedBentoConfig(),
  ]);

  // Map bento config to full products
  const bentoItems = bentoConfig.map(config => {
    const product = allProducts.find(p => p.id === config.productId);
    return product ? { product, gridClasses: config.gridClasses } : null;
  }).filter(Boolean) as { product: any; gridClasses: string }[];



  return (
    <>
      <HeroSection />
      <AdBanner variant="promo" />
      <NewReleaseCarousel />
      <TrustBar />
      <HomeCategoriesSection categories={categories} />
      <FeaturedBento bentoItems={bentoItems} products={[]} />
      <HowItWorks />
      <FAQ />
    </>
  );
}
