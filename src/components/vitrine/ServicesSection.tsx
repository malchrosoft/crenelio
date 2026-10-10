import React from 'react';
import { Link } from 'react-router-dom';
import {
  WrenchIcon,
  LightningIcon,
  PaintBrushIcon,
  KeyIcon,
  FlameIcon,
  PlantIcon,
  BroomIcon,
  PackageIcon,
  HammerIcon,
  ClockIcon,
  CurrencyEurIcon,
  ArrowRightIcon,
} from '@phosphor-icons/react';
import { Service } from '../../types';

// Icônes Phosphor par mots-clés dans le nom de la prestation
const renderServiceIcon = (name: string) => {
  const n = name.toLowerCase();
  const iconProps = { size: 40, weight: 'fill' as const, className: 'service-icon-primary' };

  if (n.includes('plomb')) return <WrenchIcon {...iconProps} />;
  if (n.includes('electr') || n.includes('élect')) return <LightningIcon {...iconProps} />;
  if (n.includes('peint')) return <PaintBrushIcon {...iconProps} />;
  if (n.includes('serrur') || n.includes('clé') || n.includes('cle')) return <KeyIcon {...iconProps} />;
  if (n.includes('chauff')) return <FlameIcon {...iconProps} />;
  if (n.includes('jardin') || n.includes('extér')) return <PlantIcon {...iconProps} />;
  if (n.includes('nettoy')) return <BroomIcon {...iconProps} />;
  if (n.includes('déménag') || n.includes('carton')) return <PackageIcon {...iconProps} />;
  return <HammerIcon {...iconProps} />;
};

interface ServicesSectionProps {
  services: Service[];
}

/**
 * Section prestations de la vitrine.
 * Cartes cliquables depuis la DB, icônes Phosphor auto-assignées.
 */
const ServicesSection: React.FC<ServicesSectionProps> = ({ services }) => {
  const activeServices = services.filter((s) => s.is_active);

  if (activeServices.length === 0) return null;

  return (
    <section
      className="vitrine-section"
      id="prestations"
      aria-labelledby="services-title"
    >
      <div className="vitrine-container">
        <div className="section-header">
          <h2 className="section-title" id="services-title">
            Prestations
          </h2>
          <p className="section-subtitle">
            Sélectionnez une prestation pour réserver en ligne.
          </p>
        </div>

        <div className="vitrine-services-grid">
          {activeServices.map((service) => (
            <Link
              key={service.id}
              to={`/booking?service=${service.id}`}
              className="vitrine-service-card"
              aria-label={`Réserver : ${service.name}`}
            >
              <div className="vitrine-service-card__body">
                <span className="vitrine-service-card__icon" aria-hidden="true">
                  {renderServiceIcon(service.name)}
                </span>

                <h3 className="vitrine-service-card__name">{service.name}</h3>

                {service.description && (
                  <p className="vitrine-service-card__desc">{service.description}</p>
                )}
              </div>

              <div className="vitrine-service-card__footer">
                <div className="vitrine-service-card__meta">
                  <span className="badge badge-duration">
                    <ClockIcon size={16} weight="fill" aria-hidden="true" />
                    {service.duration_minutes} min
                  </span>
                  <span className="badge badge-price">
                    <CurrencyEurIcon size={16} weight="fill" aria-hidden="true" />
                    {Number(service.price) > 0
                      ? `À partir de ${Number(service.price).toFixed(0)} €`
                      : 'Devis gratuit'}
                  </span>
                </div>

                <span className="vitrine-service-card__cta">
                  Prendre rendez-vous
                  <ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
