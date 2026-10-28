import React from 'react';
import { AppConfig } from '../types';
import { legalAddressLines, postalLines } from '../utils/zone';
import PostalContact from './PostalContact';

/** Durée de conservation par défaut, identique à Appointment::DEFAULT_RETENTION_MONTHS (API). */
export const DEFAULT_RETENTION_MONTHS = 36;

export function retentionMonths(config: AppConfig): number {
  const months = parseInt(config.rgpd_retention_months ?? '', 10);
  return Number.isFinite(months) && months > 0 ? months : DEFAULT_RETENTION_MONTHS;
}

/** « 36 mois » → « 3 ans » quand la durée tombe juste. */
export function formatRetention(months: number): string {
  return months % 12 === 0 ? `${months / 12} an${months > 12 ? 's' : ''}` : `${months} mois`;
}

interface PrivacyPolicyProps {
  config: AppConfig;
}

/**
 * Politique de confidentialité (RGPD, articles 13 et 14) générée depuis la configuration :
 * responsable, données, finalités et bases légales, destinataires, services tiers, conservation,
 * droits, cookies. Modèle à faire relire par l'artisan : il reste responsable de son exactitude.
 */
const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ config }) => {
  const controller = config.legal_raison_sociale || config.company_name || config.pro_name || "l'entreprise";
  const email = config.pro_email?.trim();
  const retention = formatRetention(retentionMonths(config));

  return (
    <>
      <h3>Données personnelles</h3>

      <h4>Responsable du traitement</h4>
      <PostalContact name={controller} addressLines={legalAddressLines(config)} phone={config.pro_phone} email={email} />

      <h4>Données collectées et finalités</h4>
      <ul>
        <li>
          <strong>Prise de rendez-vous :</strong> nom, email, téléphone, adresse d'intervention et précisions
          d'accès que vous saisissez. Elles servent uniquement à organiser l'intervention, calculer les frais de
          déplacement, vous envoyer la confirmation et vous permettre de gérer ou d'annuler le rendez-vous. Base
          légale : mesures précontractuelles et exécution du contrat (RGPD, art. 6.1.b).
        </li>
        <li>
          <strong>Journal des emails :</strong> destinataire, date et état de chaque envoi, pour s'assurer que les
          confirmations sont bien parties. Même base légale.
        </li>
      </ul>
      <p>
        Aucune donnée n'est vendue, ni utilisée à des fins publicitaires, ni soumise à une décision automatisée.
      </p>

      <h4>Destinataires</h4>
      <p>
        L'artisan, seul utilisateur de l'espace de gestion ; l'hébergeur du site
        {config.legal_hebergeur ? <> ({postalLines(config.legal_hebergeur)[0]})</> : null}, qui stocke les données
        pour son compte ; le service d'envoi d'emails de l'hébergeur.
      </p>

      <h4>Services tiers utilisés par le site</h4>
      <ul>
        <li>
          <strong>Base Adresse Nationale</strong> (api-adresse.data.gouv.fr, État français) : reçoit l'adresse en
          cours de saisie pour proposer des suggestions.
        </li>
        <li>
          <strong>OpenStreetMap</strong> (fonds de carte) : votre navigateur télécharge les images de la carte ; le
          service voit votre adresse IP, comme pour toute page web.
        </li>
      </ul>
      <p>Ces services ne déposent aucun cookie et ne reçoivent ni votre nom, ni votre email, ni votre téléphone.</p>

      <h4>Durée de conservation</h4>
      <p>
        Les données d'un rendez-vous sont conservées {retention} après la date de l'intervention, puis effacées
        automatiquement (seuls restent la prestation, la date, le montant et la commune, sans lien avec vous).
      </p>

      <h4>Vos droits</h4>
      <p>
        Vous pouvez demander l'accès à vos données, leur rectification, leur effacement, la limitation de leur
        traitement, leur portabilité ou vous opposer à leur traitement
        {email ? (
          <>
            {' '}
            en écrivant à <a href={`mailto:${email}`}>{email}</a>
          </>
        ) : (
          <> en contactant {controller}</>
        )}
        . Une réponse vous sera apportée sous un mois. En cas de difficulté, vous pouvez adresser une réclamation à
        la CNIL (
        <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">
          cnil.fr
        </a>
        ).
      </p>

      <h4>Cookies et stockage dans le navigateur</h4>
      <p>
        Ce site n'utilise <strong>aucun cookie de mesure d'audience, publicitaire ou de réseau social</strong> : aucun
        consentement n'est donc demandé. Seuls des éléments strictement nécessaires sont utilisés, exemptés de
        consentement :
      </p>
      <ul>
        <li>
          <code>crenelio_admin</code> et <code>crenelio_device</code> : cookies de connexion et de sécurité de l'espace
          de gestion, déposés uniquement pour l'artisan.
        </li>
        <li>
          <code>crenelio.theme</code> et préférences d'affichage : mémorisés dans votre navigateur pour afficher le
          site sans attendre ; ils ne contiennent aucune donnée personnelle.
        </li>
      </ul>
    </>
  );
};

export default PrivacyPolicy;
