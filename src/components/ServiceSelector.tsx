import React from 'react';
import { Service } from '../types';

interface ServiceSelectorProps {
  services: Service[];
  selectedService: Service | null;
  onSelect: (service: Service) => void;
  onNext: () => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  services,
  selectedService,
  onSelect,
  onNext,
}) => {
  return (
    <div className="card">
      <h2 className="card-title">1. Choisissez votre prestation</h2>
      <p style={{ color: 'var(--gray-500)', marginBottom: 20, fontSize: '0.95rem' }}>
        Sélectionnez la nature de l'intervention à votre domicile.
      </p>

      <div className="services-grid">
        {services.map((service) => {
          const isSelected = selectedService?.id === service.id;
          const priceNum = typeof service.price === 'number' ? service.price : parseFloat(service.price || '0');
          const priceLabel = priceNum > 0 ? `${priceNum.toFixed(2).replace('.', ',')} €` : 'Gratuit';

          return (
            <div
              key={service.id}
              className={`service-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(service)}
            >
              <div>
                <div className="service-name">{service.name}</div>
                <div className="service-desc">{service.description}</div>
              </div>
              <div className="service-meta">
                <span className="badge badge-duration">⏱ {service.duration_minutes} min</span>
                <span className="badge badge-price">💶 {priceLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-primary"
          disabled={!selectedService}
          onClick={onNext}
          type="button"
        >
          Continuer vers le choix de la date →
        </button>
      </div>
    </div>
  );
};

export default ServiceSelector;
