import React, { useState, useEffect, useRef } from 'react';
import { AppConfig, Service } from '../types';
import HeroSection from '../components/vitrine/HeroSection';
import AboutSection from '../components/vitrine/AboutSection';
import ServicesSection from '../components/vitrine/ServicesSection';
import EngagementsSection from '../components/vitrine/EngagementsSection';
import MapSection from '../components/vitrine/MapSection';
import ContactSection from '../components/vitrine/ContactSection';
import Footer from '../components/vitrine/Footer';
import SiteHeader from '../components/SiteHeader';

interface VitrinePageProps {
  config: AppConfig;
  services: Service[];
}

/**
 * Page vitrine principale — longue page à scroll.
 * Header sticky avec CTA apparaissant dès que le bouton Hero n'est plus visible.
 */
const VitrinePage: React.FC<VitrinePageProps> = ({ config, services }) => {
  const heroCtaRef = useRef<HTMLAnchorElement | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(false);

  useEffect(() => {
    const target = heroCtaRef.current;
    if (!target) return;

    // Observer pour déclencher l'apparition dès que le CTA du hero quitte le viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderVisible(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="vitrine-page">
      {/* Header fixe conditionnel (apparaît quand le bouton du hero disparaît) */}
      <SiteHeader config={config} visible={isHeaderVisible} />

      {/* Sections en cascade (scroll infini) */}
      <main id="main-content">
        <HeroSection config={config} ctaRef={heroCtaRef} />
        <MapSection config={config} />
        <AboutSection config={config} />
        <ServicesSection services={services} />
        <EngagementsSection config={config} />
        <ContactSection config={config} />
      </main>

      <Footer config={config} />
    </div>
  );
};

export default VitrinePage;
