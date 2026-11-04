import React from 'react';
import { AppConfig } from '../types';
import { quoteCostLabel, vatNote } from '../utils/pricing';

/**
 * Précisions sous le total de la réservation (arrêté du 3 décembre 1987, art. 1, 3 et 14) :
 * mention de TVA, ce que le prix ne comprend pas, coût d'un éventuel devis.
 */
const PricingNotice: React.FC<{ config: AppConfig }> = ({ config }) => (
  <p className="form-hint">
    {[vatNote(config), config.pricing_exclusions, `${quoteCostLabel(config)}.`].filter(Boolean).join(' ')}
  </p>
);

export default PricingNotice;
