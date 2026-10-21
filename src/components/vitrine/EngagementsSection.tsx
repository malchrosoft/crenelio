import React from 'react';
import { AppConfig } from '../../types';
import { resolveEngagementIcon, stripLeadingEmoji } from '../../config/engagementIcons';

interface EngagementsSectionProps {
  config: AppConfig;
}

/**
 * Section engagements / valeurs de l'artisan.
 * Toutes les clés `vitrine_engagement_N` renseignées, triées par N ; picto choisi (`vitrine_engagement_N_icon`) ou déduit du texte.
 */
const EngagementsSection: React.FC<EngagementsSectionProps> = ({ config }) => {
  const engagements = Object.entries(config)
    .map(([key, value]) => [Number(/^vitrine_engagement_(\d+)$/.exec(key)?.[1]), String(value ?? '').trim()] as const)
    .filter(([n, value]) => !Number.isNaN(n) && value)
    .sort(([a], [b]) => a - b)
    .map(([n, value]) => ({ value, iconId: config[`vitrine_engagement_${n}_icon`] }));

  if (engagements.length === 0) return null;

  // Rangées équilibrées de 4 cartes au plus : 5 → 3 + 2, 6 → 3 + 3, 7 → 4 + 3…
  const columns = Math.ceil(engagements.length / Math.ceil(engagements.length / 4));

  return (
    <section
      className="vitrine-section vitrine-section--alt"
      aria-labelledby="engagements-title"
    >
      <div className="vitrine-container">
        <div className="section-header">
          <h2 className="section-title" id="engagements-title">
            Engagements
          </h2>
        </div>

        <div className={`engagements-grid engagements-grid--cols-${columns}`}>
          {engagements.map(({ value, iconId }, i) => {
            const { icon: EngagementIcon } = resolveEngagementIcon(value, iconId);
            return (
              <div key={i} className="engagement-card">
                <span className="engagement-card__icon" aria-hidden="true">
                  <EngagementIcon size={36} weight="fill" className="engagement-icon-primary" />
                </span>
                <p className="engagement-card__text">{stripLeadingEmoji(value)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EngagementsSection;
