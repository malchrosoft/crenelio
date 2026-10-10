import React, { useState } from 'react';
import { GithubLogoIcon, TranslateIcon } from '@phosphor-icons/react';
import { AppConfig } from '../types';
import legalCreditsI18n from '../data/legalCreditsI18n.json';

type LangKey = keyof typeof legalCreditsI18n;

interface LegalModalProps {
  config: AppConfig;
  onClose: () => void;
}

/**
 * Modal affichant les mentions légales configurées dans l'espace Pro.
 * Accessible : focus piégé, fermeture sur Echap et clic overlay.
 */
const LegalModal: React.FC<LegalModalProps> = ({ config, onClose }) => {
  const [selectedLang, setSelectedLang] = useState<LangKey>('fr');

  // Fermeture sur Echap
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const companyName = config.company_name || 'Crénelio';
  const hasLegal =
    config.legal_raison_sociale ||
    config.legal_siret ||
    config.legal_adresse;

  return (
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
            Mentions légales
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
                  <address>
                    <strong>{config.legal_raison_sociale}</strong>
                    {config.legal_adresse && <><br />{config.legal_adresse}</>}
                    {config.pro_phone && (
                      <><br />Tél. : <a href={`tel:${config.pro_phone}`}>{config.pro_phone}</a></>
                    )}
                    {config.pro_email && (
                      <><br />E-mail : <a href={`mailto:${config.pro_email}`}>{config.pro_email}</a></>
                    )}
                  </address>
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
                  <p>{config.legal_hebergeur}</p>
                </div>
              )}
            </>
          ) : (
            <div className="legal-section">
              <p>
                Ce site est édité par <strong>{config.pro_name || companyName}</strong>.
                {config.pro_phone && <> Tél. : <a href={`tel:${config.pro_phone}`}>{config.pro_phone}</a>.</>}
                {config.pro_email && <> E-mail : <a href={`mailto:${config.pro_email}`}>{config.pro_email}</a>.</>}
              </p>
              <p className="legal-section-pending">
                Les informations légales complètes (SIRET, assurance...) sont en cours de configuration.
              </p>
            </div>
          )}

          <div className="legal-section">
            <h3>Données personnelles</h3>
            <p>
              Les données collectées lors de la prise de rendez-vous (nom, téléphone, adresse d'intervention)
              sont utilisées exclusivement pour la gestion des interventions et ne sont jamais transmises
              à des tiers. Conformément au RGPD, vous pouvez exercer vos droits d'accès et de suppression
              en contactant directement {config.pro_name || companyName}.
            </p>
          </div>

          <div
            className="legal-section legal-section--opensource"
            dir={legalCreditsI18n[selectedLang]?.dir || 'ltr'}
          >
            <div className="legal-opensource-header">
              <h3>{legalCreditsI18n[selectedLang]?.title || legalCreditsI18n.fr.title}</h3>
              <div className="legal-lang-selector" dir="ltr">
                <TranslateIcon size={16} weight="fill" aria-hidden="true" />
                <label htmlFor="legal-credits-lang" className="legal-lang-label">
                  Langue :
                </label>
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
              </div>
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
