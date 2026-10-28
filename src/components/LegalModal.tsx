import { createPortal } from 'react-dom';
import React, { useState } from 'react';
import { GithubLogoIcon, TranslateIcon } from '@phosphor-icons/react';
import { AppConfig } from '../types';
import { legalAddressLines, postalLines, premisesLabel } from '../utils/zone';
import PrivacyPolicy from './PrivacyPolicy';
import PostalContact from './PostalContact';
import Panel from './Panel';
import legalCreditsI18n from '../data/legalCreditsI18n.json';

type LangKey = keyof typeof legalCreditsI18n;

interface LegalModalProps {
  config: AppConfig;
  onClose: () => void;
  /** Ouvre directement sur la politique de confidentialité (lien du formulaire de réservation). */
  section?: 'privacy';
}

/**
 * Modal affichant les mentions légales configurées dans l'espace Pro.
 * Accessible : focus piégé, fermeture sur Echap et clic overlay.
 */
const LegalModal: React.FC<LegalModalProps> = ({ config, onClose, section }) => {
  const [selectedLang, setSelectedLang] = useState<LangKey>('fr');
  const privacyRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (section === 'privacy') privacyRef.current?.scrollIntoView({ block: 'start' });
  }, [section]);

  // Fermeture sur Echap
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const companyName = config.company_name || 'Crénelio';
  // Siège social : adresse dédiée, sinon celle de l'entreprise (cas le plus courant chez un artisan)
  const legalAddress = config.legal_adresse?.trim() || premisesLabel(config);
  const hasLegal =
    config.legal_raison_sociale ||
    config.legal_siret ||
    legalAddress;

  // Portail vers <body> : la fenêtre ne dépend jamais du conteneur qui l'ouvre (transformations, flou)
  return createPortal(
    <div
      className="legal-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={onClose}
    >
      <div
        className="legal-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="legal-modal__header">
          <h2 className="legal-modal__title" id="legal-modal-title">
            Mentions légales et confidentialité
          </h2>
          <button
            className="legal-modal__close"
            onClick={onClose}
            aria-label="Fermer les mentions légales"
          >
            ✕
          </button>
        </div>

        <div className="legal-modal__body">
          {hasLegal ? (
            <>
              {config.legal_raison_sociale && (
                <div className="legal-section">
                  <h3>Éditeur du site</h3>
                  <PostalContact
                    name={config.legal_raison_sociale}
                    addressLines={legalAddressLines(config)}
                    phone={config.pro_phone}
                    email={config.pro_email}
                  />
                </div>
              )}

              {(config.legal_siret || config.legal_naf) && (
                <div className="legal-section">
                  <h3>Informations légales</h3>
                  <p>
                    {config.legal_siret && <>SIRET : {config.legal_siret}<br /></>}
                    {config.legal_naf && <>Code NAF/APE : {config.legal_naf}<br /></>}
                    {config.legal_assurance && <>Assurance : {config.legal_assurance}</>}
                  </p>
                </div>
              )}

              {config.legal_hebergeur && (
                <div className="legal-section">
                  <h3>Hébergement</h3>
                  {(() => {
                    // Première ligne saisie = nom de l'hébergeur, comme pour l'éditeur du site
                    const [name, ...lines] = postalLines(config.legal_hebergeur);
                    return <PostalContact name={name} addressLines={lines} />;
                  })()}
                </div>
              )}
            </>
          ) : (
            <div className="legal-section">
              <p>Ce site est édité par :</p>
              <PostalContact
                name={config.pro_name || companyName}
                addressLines={legalAddressLines(config)}
                phone={config.pro_phone}
                email={config.pro_email}
              />
              <p className="legal-section-pending">
                Les informations légales complètes (SIRET, assurance...) sont en cours de configuration.
              </p>
            </div>
          )}

          <div className="legal-section legal-section--privacy" id="confidentialite" ref={privacyRef}>
            <PrivacyPolicy config={config} />
          </div>

          <Panel
            className="legal-section legal-credits"
            dir={legalCreditsI18n[selectedLang]?.dir === 'rtl' ? 'rtl' : 'ltr'}
            title={legalCreditsI18n[selectedLang]?.title || legalCreditsI18n.fr.title}
            actions={
              <label className="legal-lang-selector">
                <TranslateIcon size={16} weight="fill" aria-hidden="true" />
                <span className="legal-lang-label">Langue :</span>
                <select
                  id="legal-credits-lang"
                  className="legal-lang-select"
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value as LangKey)}
                  aria-label="Sélectionner la langue des crédits open source"
                >
                  {(Object.keys(legalCreditsI18n) as LangKey[]).map((langKey) => (
                    <option key={langKey} value={langKey}>
                      {legalCreditsI18n[langKey].lang}
                    </option>
                  ))}
                </select>
              </label>
            }
          >
            <p>
              {legalCreditsI18n[selectedLang]?.poweredBy || legalCreditsI18n.fr.poweredBy}{' '}
              <a
                href="https://github.com/malchrosoft/crenelio"
                target="_blank"
                rel="noopener noreferrer"
                className="legal-opensource-link"
              >
                <GithubLogoIcon size={16} weight="fill" aria-hidden="true" />
                <strong>Crénelio</strong>
              </a>
              {' '}
              {legalCreditsI18n[selectedLang]?.description || legalCreditsI18n.fr.description}
            </p>

            <p className="legal-license-info">
              {legalCreditsI18n[selectedLang]?.licensePrefix || legalCreditsI18n.fr.licensePrefix}{' '}
              <a
                href="https://www.gnu.org/licenses/agpl-3.0.fr.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                {legalCreditsI18n[selectedLang]?.licenseName || legalCreditsI18n.fr.licenseName}
              </a>
              . {legalCreditsI18n[selectedLang]?.licenseSuffix || legalCreditsI18n.fr.licenseSuffix}
            </p>
          </Panel>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LegalModal;
