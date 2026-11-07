import React from 'react';
import { AppConfig, Service } from '../../types';
import { labourRateTtc, quoteCostLabel, servicePrice, travelTiers, vatNote } from '../../utils/pricing';
import { timeCountingText } from '../admin/quoteRules';

interface PricingSectionProps {
  config: AppConfig;
  services: Service[];
}

/**
 * Tarifs de la vitrine (Item 22, écart 7) : informations de l'article 2 de l'arrêté du 24 janvier 2017,
 * « aisément accessibles » sur l'espace en ligne du professionnel (art. 3), prix TTC (arrêté du
 * 3 décembre 1987, art. 1) et ce qu'ils ne comprennent pas (art. 3).
 */
const PricingSection: React.FC<PricingSectionProps> = ({ config, services }) => {
  const active = services.filter((s) => s.is_active);
  const labour = labourRateTtc(config);
  const counting = timeCountingText(config);
  const tiers =
    config.travel_mode !== 'premises' && active.some((s) => s.travel_fee_mode === 'distance_tiers') ? travelTiers(config) : [];
  const fixedTravel = config.travel_mode !== 'premises' && active.some((s) => s.travel_fee_mode === 'fixed');

  return (
    <section className="vitrine-section" id="tarifs" aria-labelledby="pricing-title">
      <div className="vitrine-container">
        <div className="section-header">
          <h2 className="section-title" id="pricing-title">
            Tarifs
          </h2>
          <p className="section-subtitle">{vatNote(config)}</p>
        </div>

        <dl className="vitrine-pricing">
          {active.length > 0 && (
            <div className="vitrine-pricing__row">
              <dt>Prestations</dt>
              <dd>
                <ul className="vitrine-pricing__list">
                  {active.map((s) => (
                    <li key={s.id}>
                      {s.name} : {servicePrice(s.price)}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
          {labour !== null && (
            <div className="vitrine-pricing__row">
              <dt>Main-d'œuvre</dt>
              <dd>
                {labour.toFixed(2).replace('.', ',')} € TTC de l'heure
                {counting && <span className="vitrine-pricing__hint">{counting}</span>}
              </dd>
            </div>
          )}
          {(tiers.length > 0 || fixedTravel) && (
            <div className="vitrine-pricing__row">
              <dt>Déplacement</dt>
              <dd>
                {tiers.length > 0 ? (
                  <ul className="vitrine-pricing__list">
                    {tiers.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                ) : (
                  'Forfait indiqué sur chaque prestation'
                )}
              </dd>
            </div>
          )}
          <div className="vitrine-pricing__row">
            <dt>Devis</dt>
            <dd>{quoteCostLabel(config)}</dd>
          </div>
          {config.pricing_exclusions && (
            <div className="vitrine-pricing__row">
              <dt>Non compris</dt>
              <dd>{config.pricing_exclusions}</dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
};

export default PricingSection;
