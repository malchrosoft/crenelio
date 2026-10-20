import React from 'react';
import { CalendarCheckIcon } from '@phosphor-icons/react';
import { AppConfig } from '../types';

interface BrandMarkProps {
  config: AppConfig;
  iconSize: number;
}

/** Logo de l'entreprise s'il existe, sinon icône et nom (repli). */
const BrandMark: React.FC<BrandMarkProps> = ({ config, iconSize }) => {
  const companyName = config.company_name || 'Crénelio';

  return config.branding_logo_url ? (
    <img className="brand-logo" src={config.branding_logo_url} alt={companyName} />
  ) : (
    <>
      <CalendarCheckIcon size={iconSize} weight="fill" aria-hidden="true" />
      {companyName}
    </>
  );
};

export default BrandMark;
