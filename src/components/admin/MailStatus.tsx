import React, { useEffect, useState } from 'react';
import { EnvelopeSimpleIcon, PaperPlaneTiltIcon } from '@phosphor-icons/react';
import clsx from 'clsx';
import { api, MailStatusInfo } from '../../api';

interface MailStatusProps {
  /** Email professionnel actuel : destinataire du test, relu après chaque enregistrement. */
  proEmail?: string;
}

const TRANSPORT_LABELS: Record<MailStatusInfo['transport'], string> = {
  smtp: 'Serveur SMTP',
  mail: "Fonction mail() de l'hébergement",
  none: 'Désactivé',
};

/**
 * Envoi des emails : état en lecture seule (réglé dans `api/.env`, jamais depuis l'espace Pro)
 * et email de test vers l'email professionnel.
 */
/** L'expéditeur est-il sur le domaine du site (sous-domaines compris) ? */
function onSiteDomain(mailFrom: string, siteDomain: string): boolean {
  const domain = mailFrom.split('@')[1]?.toLowerCase() ?? '';
  return domain === siteDomain || domain.endsWith(`.${siteDomain}`);
}

const MailStatus: React.FC<MailStatusProps> = ({ proEmail }) => {
  const [status, setStatus] = useState<MailStatusInfo | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    api.getMailStatus().then(setStatus).catch(() => setStatus(null));
  }, []);

  async function sendTest() {
    setSending(true);
    setResult(null);
    try {
      const res = await api.sendTestMail();
      setResult({ ok: true, text: `${res.message}. Vérifiez aussi les indésirables.` });
    } catch (err: unknown) {
      setResult({ ok: false, text: err instanceof Error ? err.message : "Échec de l'envoi" });
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="admin-config-group" aria-labelledby="config-mail">
      <div className="admin-section-header">
        <h3 className="admin-section-title" id="config-mail">
          <EnvelopeSimpleIcon size={20} weight="fill" aria-hidden="true" />
          Envoi des emails
        </h3>
      </div>
      <p className="admin-settings-intro">
        Réglé à l'installation dans <code>api/.env</code>, non modifiable ici : un mauvais réglage couperait l'envoi de
        vos codes de connexion. Chez OVHcloud, l'adresse d'expédition doit appartenir à un domaine attaché à
        l'hébergement.
      </p>

      {status && (
        <dl className="mail-status">
          <dt>Mode d'envoi</dt>
          <dd className={clsx({ 'mail-status__off': status.transport === 'none' })}>
            {TRANSPORT_LABELS[status.transport]}
            {status.smtp_host && ` (${status.smtp_host})`}
          </dd>
          <dt>Expéditeur</dt>
          <dd>
            {status.mail_from ? `${status.mail_from_name} <${status.mail_from}>` : 'Non renseigné (MAIL_FROM)'}
            {status.mail_from_auto && <span className="mail-status__note">déduit de l'adresse du site</span>}
          </dd>
          <dt>Email de test envoyé à</dt>
          <dd>{proEmail || status.recipient || "Email de contact à renseigner ci-dessus"}</dd>
        </dl>
      )}

      {status?.mail_from && status.site_domain && !onSiteDomain(status.mail_from, status.site_domain) && (
        <p className="mail-status__warning" role="status">
          L'expéditeur n'est pas sur le domaine du site ({status.site_domain}). Chez OVHcloud, son domaine doit être
          attaché à l'hébergement (onglet Multisite), sinon les emails sont rejetés : vérifiez avec l'email de test.
        </p>
      )}

      <div className="admin-settings-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={sendTest}
          disabled={sending || !status || status.transport === 'none'}
        >
          <PaperPlaneTiltIcon size={18} weight="fill" aria-hidden="true" />
          {sending ? 'Envoi…' : "M'envoyer un email de test"}
        </button>
        {result && (
          <span className={result.ok ? 'admin-settings-message' : 'admin-settings-message admin-settings-message--error'} role="status">
            {result.text}
          </span>
        )}
      </div>
    </section>
  );
};

export default MailStatus;
