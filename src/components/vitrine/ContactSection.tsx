import React from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneIcon,
  EnvelopeSimpleIcon,
  CalendarCheckIcon,
} from '@phosphor-icons/react';
import { AppConfig } from '../../types';

interface ContactSectionProps {
  config: AppConfig;
}

/**
 * Section contact rapide + CTA final de prise de rendez-vous.
 * Deux cartes au plus (téléphone, email), construites seulement si la valeur est renseignée ;
 * la zone desservie est déjà présentée par la carte et la section « À propos ».
 */
const ContactSection: React.FC<ContactSectionProps> = ({ config }) => {
  const phone = config.pro_phone?.trim();
  const email = config.pro_email?.trim();

  const cards = [
    phone && { key: 'phone', label: 'Téléphone', value: phone, Icon: PhoneIcon, href: `tel:${phone}`, aria: `Appeler le ${phone}` },
    email && { key: 'email', label: 'Email', value: email, Icon: EnvelopeSimpleIcon, href: `mailto:${email}`, aria: `Envoyer un email à ${email}` },
  ].filter(Boolean) as { key: string; label: string; value: string; Icon: typeof PhoneIcon; href: string; aria: string }[];

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
            Réservation en ligne 24h/24{(phone || email) && ' ou contact direct par téléphone et email'}.
          </p>
        </div>

        {/* Cartes de contact (absentes si aucune valeur configurée) */}
        {cards.length > 0 && (
          <div className="contact-grid">
            {cards.map(({ key, label, value, Icon, href, aria }) => {
              const content = (
                <>
                  <span className="contact-card__icon" aria-hidden="true">
                    <Icon size={32} weight="fill" />
                  </span>
                  <div>
                    <p className="contact-card__label">{label}</p>
                    <p className="contact-card__value">{value}</p>
                  </div>
                </>
              );
              return (
                <a key={key} href={href} className="contact-card" aria-label={aria}>
                  {content}
                </a>
              );
            })}
          </div>
        )}

        {/* CTA final */}
        <div className="contact-cta-block">
          <Link to="/booking" className="btn btn-primary btn--xl">
            <CalendarCheckIcon size={22} weight="fill" aria-hidden="true" />
            Réserver mon créneau en ligne
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
