import React, { useState } from 'react';
import { EnvelopeSimpleIcon, LockKeyIcon } from '@phosphor-icons/react';
import { api } from '../../api';

interface AdminLoginProps {
  /** Session ouverte ; `twoFactor` indique si le second facteur est actif côté serveur. */
  onAuthenticated: (twoFactor: boolean) => void;
}

/**
 * Connexion à l'espace Artisan en deux temps : mot de passe, puis code à 6 chiffres
 * reçu par email lorsque l'appareil n'est pas reconnu (appareil de confiance 10 jours).
 */
const AdminLogin: React.FC<AdminLoginProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [emailHint, setEmailHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function run(action: () => Promise<void>) {
    setError(null);
    setSubmitting(true);
    try {
      await action();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setSubmitting(false);
    }
  }

  function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    run(async () => {
      const res = await api.adminLogin(password);
      if (res.status === 'authenticated') {
        onAuthenticated(res.two_factor);
      } else {
        setEmailHint(res.email_hint ?? '');
        setCode('');
      }
    });
  }

  function submitCode(e: React.FormEvent) {
    e.preventDefault();
    run(async () => {
      const res = await api.adminVerifyCode(code);
      onAuthenticated(res.two_factor);
    });
  }

  function backToPassword() {
    setEmailHint(null);
    setError(null);
    setPassword('');
  }

  return (
    <div className="card admin-login-card">
      <h2 className="card-title">Connexion à l'espace Artisan</h2>

      {emailHint === null ? (
        <p className="admin-login-hint">
          Saisissez votre mot de passe d'administration (par défaut : <code>admin123</code>).
        </p>
      ) : (
        <p className="admin-login-hint">
          <EnvelopeSimpleIcon size={18} weight="fill" aria-hidden="true" className="admin-login-hint__icon" />
          Nouvel appareil : un code à 6 chiffres vient d'être envoyé à <strong>{emailHint}</strong>. Il est
          valable 15 minutes ; cet appareil sera ensuite reconnu pendant 10 jours.
        </p>
      )}

      {error && <div className="admin-login-error" role="alert">{error}</div>}

      {emailHint === null ? (
        <form onSubmit={submitPassword}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">Mot de passe</label>
            <input
              id="admin-password"
              type="password"
              className="form-input"
              autoComplete="current-password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="admin-login-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <LockKeyIcon size={18} weight="fill" aria-hidden="true" />
              {submitting ? 'Vérification…' : 'Se connecter'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={submitCode}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-code">Code reçu par email</label>
            <input
              id="admin-code"
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
            />
          </div>
          <div className="admin-login-actions">
            <button type="button" className="btn btn-secondary" onClick={backToPassword} disabled={submitting}>
              Recommencer
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || code.length !== 6}>
              {submitting ? 'Vérification…' : 'Valider le code'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminLogin;
