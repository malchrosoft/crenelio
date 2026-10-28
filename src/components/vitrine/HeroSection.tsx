import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheckIcon, PhoneCallIcon } from '@phosphor-icons/react';
import { AppConfig } from '../../types';

interface HeroSectionProps {
  config: AppConfig;
  ctaRef?: React.Ref<HTMLAnchorElement>;
}

/**
 * Section héro de la page vitrine.
 * CTA proéminent, accessible seniors (police large, contraste fort).
 */
const HeroSection: React.FC<HeroSectionProps> = ({ config, ctaRef }) => {
  const companyName = config.company_name || 'Crénelio';
  const tagline = config.vitrine_tagline || 'Votre artisan de confiance, à domicile';

  return (
    <section className="vitrine-hero" aria-labelledby="hero-title">
      <div className="hero__content">
        {config.branding_logo_url && (
          <img className="hero__logo" src={config.branding_logo_url} alt={companyName} />
        )}

        {config.pro_name && (
          <p className="hero__name">{companyName}</p>
        )}

        <h1 className="hero__title" id="hero-title">
          {tagline}
        </h1>

        <p className="hero__subtitle">
          Intervention rapide, travail soigné et garanti.
        </p>

        <div>
          <Link ref={ctaRef} to="/booking" className="btn btn-primary btn--xl">
            <CalendarCheckIcon size={24} weight="fill" aria-hidden="true" />
            Prendre rendez-vous en ligne
          </Link>

          {config.pro_phone && (
            <a href={`tel:${config.pro_phone}`} className="hero__cta-secondary">
              <PhoneCallIcon size={20} weight="fill" aria-hidden="true" />
              ou appeler directement
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
