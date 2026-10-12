import React from 'react';
import {
  ClockIcon,
  ShieldCheckIcon,
  MapPinIcon,
  ChatCircleTextIcon,
  CheckCircleIcon,
} from '@phosphor-icons/react';
import { AppConfig } from '../../types';

interface EngagementsSectionProps {
  config: AppConfig;
}

/**
 * Mappe un engagement vers une icône Phosphor fill et son libellé épuré
 */
const renderEngagementIcon = (text: string) => {
  const clean = text.replace(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}|\p{Emoji})+\s*/u, '').trim();
  const lower = text.toLowerCase();
  const iconProps = { size: 36, weight: 'fill' as const, className: 'engagement-icon-primary' };

  if (lower.includes('ponctual') || lower.includes('heure') || lower.includes('temps') || text.includes('🕐')) {
    return { icon: <ClockIcon {...iconProps} />, label: clean };
  }
  if (lower.includes('garanti') || lower.includes('soigné') || lower.includes('qualité') || text.includes('🛡️')) {
    return { icon: <ShieldCheckIcon {...iconProps} />, label: clean };
  }
  if (lower.includes('domicile') || lower.includes('intervention') || lower.includes('zone') || text.includes('📍')) {
    return { icon: <MapPinIcon {...iconProps} />, label: clean };
  }
  if (lower.includes('devis') || lower.includes('engagement') || lower.includes('contact') || text.includes('💬')) {
    return { icon: <ChatCircleTextIcon {...iconProps} />, label: clean };
  }
  return { icon: <CheckCircleIcon {...iconProps} />, label: clean };
};

/**
 * Section engagements / valeurs de l'artisan.
 * Toutes les clés `vitrine_engagement_N` renseignées en config, triées par N, avec Phosphor Icons fill.
 */
const EngagementsSection: React.FC<EngagementsSectionProps> = ({ config }) => {
  const engagements = Object.entries(config)
    .map(([key, value]) => [Number(/^vitrine_engagement_(\d+)$/.exec(key)?.[1]), String(value ?? '').trim()] as const)
    .filter(([n, value]) => !Number.isNaN(n) && value)
    .sort(([a], [b]) => a - b)
    .map(([, value]) => value);

  if (engagements.length === 0) return null;

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

        <div className="engagements-grid">
          {engagements.map((eng, i) => {
            const { icon, label } = renderEngagementIcon(eng);
            return (
              <div key={i} className="engagement-card">
                <span
                  className="engagement-card__icon"
                  aria-hidden="true"
                >
                  {icon}
                </span>
                <p className="engagement-card__text">{label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EngagementsSection;
