import React from 'react';
import { HardHatIcon, MapPinIcon } from '@phosphor-icons/react';
import { AppConfig } from '../../types';

interface AboutSectionProps {
  config: AppConfig;
}

/**
 * Section présentation de l'artisan.
 * Photo optionnelle, texte configurable, zone d'intervention.
 */
const AboutSection: React.FC<AboutSectionProps> = ({ config }) => {
  const aboutText =
    config.vitrine_about ||
    'Artisan qualifié et expérimenté, j\'interviens rapidement chez vous pour tous vos travaux. Devis gratuit, travail soigné et garanti.';

  return (
    <section
      className="vitrine-section vitrine-section--alt"
      aria-labelledby="about-title"
    >
      <div className="vitrine-container">
        <div className="about-layout">
          {/* Photo */}
          <div className="about-photo">
            {config.vitrine_photo_url ? (
              <img
                src={config.vitrine_photo_url}
                alt={`Portrait de ${config.pro_name || 'l\'artisan'}`}
                loading="lazy"
              />
            ) : (
              <span className="about-photo__placeholder" aria-hidden="true">
                <HardHatIcon size={56} weight="fill" />
              </span>
            )}
          </div>

          {/* Contenu */}
          <div className="about-content">
            {config.pro_name && (
              <h2 className="about-name" id="about-title">
                {config.pro_name}
              </h2>
            )}
            <p className="about-role">
              {config.company_name || 'Artisan à domicile'}
            </p>
            <p className="about-text">{aboutText}</p>

            {config.service_area && (
              <span className="about-area">
                <MapPinIcon size={18} weight="fill" aria-hidden="true" />
                {config.service_area}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
