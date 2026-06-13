import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HeroSection from '@/sections/HeroSection';
import TrustBar from '@/sections/TrustBar';
import FeaturedCarousel from '@/sections/FeaturedCarousel';
import HowItWorks from '@/sections/HowItWorks';
import Pricing from '@/sections/Pricing';
import CategoriesGrid from '@/sections/CategoriesGrid';
import ProductList from '@/sections/ProductList';
import LiveProofFeed from '@/sections/LiveProofFeed';
import Testimonials from '@/sections/Testimonials';
import FAQ from '@/sections/FAQ';
import LiveProofPopups from '@/components/LiveProofPopups';
import SupportBubble from '@/components/SupportBubble';
import CursorTrail from '@/components/CursorTrail';
import ExitIntentPopup from '@/components/ExitIntentPopup';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <TrustBar />
        <FeaturedCarousel />
        <HowItWorks />
        <Pricing />
        <CategoriesGrid />
        <ProductList />
        <LiveProofFeed />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />

      {/* Overlays */}
      <LiveProofPopups />
      <SupportBubble />
      <CursorTrail />
      <ExitIntentPopup />
    </div>
  );
}
