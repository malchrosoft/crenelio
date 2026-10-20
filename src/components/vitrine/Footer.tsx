import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheckIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeSimpleIcon,
  LockKeyIcon,
  GithubLogoIcon,
} from '@phosphor-icons/react';
import BrandMark from '../BrandMark';
import { AppConfig } from '../../types';
import LegalModal from '../LegalModal';

interface FooterProps {
  config: AppConfig;
}

/**
 * Footer complet de la page vitrine.
 * Coordonnées, liens, mentions légales via modal avec Phosphor Icons fill.
 */
const Footer: React.FC<FooterProps> = ({ config }) => {
  const [showLegal, setShowLegal] = useState(false);

  const companyName = config.company_name || 'Crénelio';
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="vitrine-footer">
        <div className="footer-grid">
          {/* Colonne Marque */}
          <div className="footer-brand">
            <div className="footer-brand__name">
              <BrandMark config={config} iconSize={24} />
            </div>
            {config.vitrine_tagline && (
              <p className="footer-brand__tagline">{config.vitrine_tagline}</p>
            )}
          </div>

          {/* Colonne Navigation */}
          <div>
            <p className="footer-col__title">Navigation</p>
            <ul className="footer-links">
              <li><a href="/#">Accueil</a></li>
              <li><a href="/#prestations">Prestations</a></li>
              <li><a href="/#zone">Zone d'intervention</a></li>
              <li><a href="/#contact">Contact</a></li>
              <li>
                <Link to="/booking" className="footer-cta-link">
                  <CalendarCheckIcon size={16} weight="fill" aria-hidden="true" />
                  Prendre rendez-vous
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne Contact */}
          <div>
            <p className="footer-col__title">Contact</p>
            <div className="footer-contact-list">
              {config.pro_phone && (
                <a href={`tel:${config.pro_phone}`}>
                  <PhoneIcon size={16} weight="fill" aria-hidden="true" />
                  {config.pro_phone}
                </a>
              )}
              {config.pro_email && (
                <a href={`mailto:${config.pro_email}`}>
                  <EnvelopeSimpleIcon size={16} weight="fill" aria-hidden="true" />
                  {config.pro_email}
                </a>
              )}
              {config.service_area && (
                <span className="footer-contact-item--muted">
                  <MapPinIcon size={16} weight="fill" aria-hidden="true" />
                  {config.service_area}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Barre du bas */}
        <div className="footer-bottom">
          <div className="footer-bottom__left">
            <span className="footer-bottom__copy">
              © {currentYear} {companyName}. Tous droits réservés.
            </span>
            <span className="footer-bottom__powered">
              Powered by{' '}
              <a
                href="https://github.com/malchrosoft/crenelio"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-bottom__project-link"
              >
                <GithubLogoIcon size={14} weight="fill" aria-hidden="true" />
                Crénelio
              </a>
              <span className="footer-bottom__slogan">
                — Book appointments directly with your local pro
              </span>
            </span>
          </div>
          <div className="footer-bottom__actions">
            <button
              type="button"
              className="footer-legal-btn"
              onClick={() => setShowLegal(true)}
            >
              Mentions légales
            </button>
            <Link
              to="/booking?view=admin"
              className="footer-bottom__admin"
              title="Espace d'administration artisan"
            >
              <LockKeyIcon size={14} weight="fill" aria-hidden="true" />
              Espace Pro
            </Link>
          </div>
        </div>
      </footer>

      {/* Modal Mentions légales */}
      {showLegal && (
        <LegalModal
          config={config}
          onClose={() => setShowLegal(false)}
        />
      )}
    </>
  );
};

export default Footer;
