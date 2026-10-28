import React, { useState } from 'react';
import { ShieldCheckIcon } from '@phosphor-icons/react';
import { AppConfig } from '../types';
import LegalModal from './LegalModal';
import { formatRetention, retentionMonths } from './PrivacyPolicy';

interface PrivacyNoticeProps {
  config: AppConfig;
}

/**
 * Information RGPD au moment de la collecte (art. 13), sous le formulaire de réservation.
 * Pas de case à cocher : la base légale est l'exécution du contrat, pas le consentement.
 */
const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ config }) => {
  const [open, setOpen] = useState(false);
  const controller = config.company_name || config.pro_name || "l'artisan";

  return (
    <>
      <p className="privacy-notice">
        <ShieldCheckIcon size={18} weight="fill" aria-hidden="true" />
        <span>
          Vos coordonnées servent uniquement à organiser cette intervention et à vous envoyer sa confirmation. Elles
          sont destinées à {controller}, ne sont jamais revendues et sont effacées{' '}
          {formatRetention(retentionMonths(config))} après le rendez-vous. Vous pouvez y accéder, les corriger ou les
          faire supprimer :{' '}
          <button type="button" className="privacy-notice__link" onClick={() => setOpen(true)}>
            politique de confidentialité
          </button>
          .
        </span>
      </p>
      {open && <LegalModal config={config} section="privacy" onClose={() => setOpen(false)} />}
    </>
  );
};

export default PrivacyNotice;
