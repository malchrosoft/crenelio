import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { CalendarCheckIcon } from '@phosphor-icons/react';
import { AppConfig } from '../types';
import BrandMark from './BrandMark';

interface SiteHeaderProps {
  config: AppConfig;
  /**
   * Header permanent, dans le flux de la page (tunnel de réservation).
   * Sinon fixe et piloté par `visible` (vitrine : apparaît quand le CTA du hero disparaît).
   */
  persistent?: boolean;
  visible?: boolean;
  /** Bouton « Prendre rendez-vous » (inutile sur la page de réservation elle-même) */
  showCta?: boolean;
}

/**
 * Header commun aux pages publiques (vitrine et réservation).
 */
const SiteHeader: React.FC<SiteHeaderProps> = ({
  config,
  persistent = false,
  visible = true,
  showCta = true,
}) => {
  const isVisible = persistent || visible;

  return (
    <header
      className={clsx('vitrine-header', {
        'vitrine-header--persistent': persistent,
        'vitrine-header--visible': !persistent && isVisible,
        'vitrine-header--hidden': !isVisible,
      })}
      aria-hidden={!isVisible}
    >
      <Link to="/" className="vitrine-header__brand" aria-label="Retour à l'accueil">
        <BrandMark config={config} iconSize={28} />
      </Link>
      {showCta && (
        <Link to="/booking" className="vitrine-header__cta">
          <CalendarCheckIcon size={20} weight="fill" aria-hidden="true" />
          Prendre rendez-vous
        </Link>
      )}
    </header>
  );
};

export default SiteHeader;
