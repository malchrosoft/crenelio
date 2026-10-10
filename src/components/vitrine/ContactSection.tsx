import React from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneIcon,
  EnvelopeSimpleIcon,
  MapPinIcon,
  CalendarCheckIcon,
} from '@phosphor-icons/react';
import { AppConfig } from '../../types';

interface ContactSectionProps {
  config: AppConfig;
}

/**
 * Section contact rapide + CTA final de prise de rendez-vous.
 */
const ContactSection: React.FC<ContactSectionProps> = ({ config }) => {
  return (
    <section
      className="vitrine-section vitrine-section--alt"
      id="contact"
      aria-labelledby="contact-title"
    >
      <div className="vitrine-container">
        <div className="section-header">
          <h2 className="section-title" id="contact-title">
            Contact
          </h2>
          <p className="section-subtitle">
            Réservation en ligne 24h/24 ou contact direct par téléphone et email.
          </p>
        </div>

        {/* Cartes de contact */}
        <div className="contact-grid">
          {config.pro_phone && (
            <a
              href={`tel:${config.pro_phone}`}
              className="contact-card"
              aria-label={`Appeler le ${config.pro_phone}`}
            >
              <span className="contact-card__icon" aria-hidden="true">
                <PhoneIcon size={32} weight="fill" />
              </span>
              <div>
                <p className="contact-card__label">Téléphone</p>
                <p className="contact-card__value">{config.pro_phone}</p>
              </div>
            </a>
          )}

          {config.pro_email && (
            <a
              href={`mailto:${config.pro_email}`}
              className="contact-card"
              aria-label={`Envoyer un email à ${config.pro_email}`}
            >
              <span className="contact-card__icon" aria-hidden="true">
                <EnvelopeSimpleIcon size={32} weight="fill" />
              </span>
              <div>
                <p className="contact-card__label">Email</p>
                <p className="contact-card__value">{config.pro_email}</p>
              </div>
            </a>
          )}

          {config.service_area && (
            <div className="contact-card contact-card--static">
              <span className="contact-card__icon" aria-hidden="true">
                <MapPinIcon size={32} weight="fill" />
              </span>
              <div>
                <p className="contact-card__label">Zone couverte</p>
                <p className="contact-card__value">{config.service_area}</p>
              </div>
            </div>
          )}
        </div>

        {/* CTA final */}
        <div className="contact-cta-block">
          <Link to="/booking" className="contact-cta-btn">
            <CalendarCheckIcon size={22} weight="fill" aria-hidden="true" />
            Réserver mon créneau en ligne
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
