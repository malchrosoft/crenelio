import React, { useState } from 'react';
import { api } from '../../api';
import { AppConfig } from '../../types';

interface ProEmailFieldProps {
  config: AppConfig;
  onSaved: (config: AppConfig) => void;
}

/**
 * Email professionnel : reçoit les fiches et les codes de connexion. Une nouvelle adresse n'est
 * retenue qu'après saisie du code qu'elle reçoit ; l'ancienne adresse est prévenue.
 */
const ProEmailField: React.FC<ProEmailFieldProps> = ({ config, onSaved }) => {
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  function close() {
    setEditing(false);
    setCodeSent(false);
    setEmail('');
    setCode('');
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setResult(null);
    try {
      await action();
    } catch (err: unknown) {
      setResult({ ok: false, text: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      setBusy(false);
    }
  }

  function saved(proEmail: string) {
    onSaved({ ...config, pro_email: proEmail });
    setResult({ ok: true, text: 'Email professionnel enregistré.' });
    close();
  }

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const res = await api.requestProEmail(email.trim());
      if (res.status === 'saved') {
        saved(email.trim());
      } else {
        setCodeSent(true);
      }
    });
  };

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => saved((await api.confirmProEmail(code)).pro_email));
  };

  return (
    <div className="form-group pro-email-field">
      <span className="form-label">Email professionnel</span>
      {!editing ? (
        <div className="pro-email-field__current">
          <strong>{config.pro_email || 'Non renseigné'}</strong>
          <button type="button" className="btn btn-secondary admin-btn-sm" onClick={() => setEditing(true)}>
            Modifier
          </button>
        </div>
      ) : !codeSent ? (
        <form className="pro-email-field__form" onSubmit={submitEmail}>
          <input
            type="email"
            className="form-input"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@votre-domaine.fr"
            aria-label="Nouvel email professionnel"
          />
          <button type="submit" className="btn btn-primary admin-btn-sm" disabled={busy}>
            {busy ? 'Envoi…' : 'Recevoir un code'}
          </button>
          <button type="button" className="btn btn-secondary admin-btn-sm" onClick={close} disabled={busy}>
            Annuler
          </button>
        </form>
      ) : (
        <form className="pro-email-field__form" onSubmit={submitCode}>
          <input
            className="form-input admin-login-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            aria-label={`Code reçu sur ${email}`}
          />
          <button type="submit" className="btn btn-primary admin-btn-sm" disabled={busy || code.length !== 6}>
            {busy ? 'Vérification…' : 'Valider'}
          </button>
          <button type="button" className="btn btn-secondary admin-btn-sm" onClick={close} disabled={busy}>
            Annuler
          </button>
        </form>
      )}
      <p className="form-hint">
        {codeSent
          ? `Un code à 6 chiffres vient d'être envoyé à ${email}. L'adresse ne sera retenue qu'après sa saisie.`
          : "Reçoit les fiches d'intervention et vos codes de connexion. Une nouvelle adresse est vérifiée par un code, et l'ancienne est prévenue."}
      </p>
      {result && (
        <p className={result.ok ? 'admin-settings-message' : 'admin-settings-message admin-settings-message--error'} role="status">
          {result.text}
        </p>
      )}
    </div>
  );
};

export default ProEmailField;
