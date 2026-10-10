import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { CalendarCheckIcon } from '@phosphor-icons/react';
import { AppConfig, Service } from '../types';
import HeroSection from '../components/vitrine/HeroSection';
import AboutSection from '../components/vitrine/AboutSection';
import ServicesSection from '../components/vitrine/ServicesSection';
import EngagementsSection from '../components/vitrine/EngagementsSection';
import MapSection from '../components/vitrine/MapSection';
import ContactSection from '../components/vitrine/ContactSection';
import Footer from '../components/vitrine/Footer';

interface VitrinePageProps {
  config: AppConfig;
  services: Service[];
}

/**
 * Page vitrine principale — longue page à scroll.
 * Header sticky avec CTA apparaissant dès que le bouton Hero n'est plus visible.
 */
const VitrinePage: React.FC<VitrinePageProps> = ({ config, services }) => {
  const companyName = config.company_name || 'Crénelio';
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
      {/* Header sticky conditionnel (apparaît quand le bouton du hero disparaît) */}
      <header
        className={clsx('vitrine-header', {
          'vitrine-header--visible': isHeaderVisible,
          'vitrine-header--hidden': !isHeaderVisible,
        })}
        aria-hidden={!isHeaderVisible}
      >
        <Link to="/" className="vitrine-header__brand" aria-label="Retour à l'accueil">
          <CalendarCheckIcon size={28} weight="fill" aria-hidden="true" />
          {companyName}
        </Link>
        <Link to="/booking" className="vitrine-header__cta">
          <CalendarCheckIcon size={20} weight="fill" aria-hidden="true" />
          Prendre rendez-vous
        </Link>
      </header>

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
