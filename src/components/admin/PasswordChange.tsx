import React, { useState } from 'react';
import { LockKeyIcon, WarningIcon } from '@phosphor-icons/react';
import { api } from '../../api';
import PasswordFields, { passwordFieldsError } from './PasswordFields';

interface PasswordChangeProps {
  /** Changement imposé (mot de passe par défaut) : présentation en écran d'accueil. */
  forced?: boolean;
  onChanged?: () => void;
}

/** Changement du mot de passe : ancien mot de passe redemandé, autres sessions fermées. */
const PasswordChange: React.FC<PasswordChangeProps> = ({ forced = false, onChanged }) => {
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const problem = passwordFieldsError(password, confirm);
    if (problem) {
      setResult({ ok: false, text: problem });
      return;
    }
    setSaving(true);
    setResult(null);
    try {
      const res = await api.changePassword(current, password);
      setResult({ ok: true, text: res.message });
      setCurrent('');
      setPassword('');
      setConfirm('');
      onChanged?.();
    } catch (err: unknown) {
      setResult({ ok: false, text: err instanceof Error ? err.message : 'Erreur lors du changement' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={forced ? 'card admin-login-card' : 'admin-config-group'} aria-labelledby="config-password">
      <div className="admin-section-header">
        <h3 className="admin-section-title" id="config-password">
          <LockKeyIcon size={20} weight="fill" aria-hidden="true" />
          {forced ? 'Choisissez votre mot de passe' : 'Mot de passe'}
        </h3>
      </div>
      {forced ? (
        <p className="admin-settings-intro password-forced-intro">
          <WarningIcon size={18} weight="fill" aria-hidden="true" />
          Le mot de passe par défaut (<code>admin123</code>) est encore actif : choisissez le vôtre pour accéder à
          l'espace Artisan.
        </p>
      ) : (
        <p className="admin-settings-intro">
          Le changement ferme les autres sessions ; les autres appareils devront saisir un nouveau code. Un email de
          confirmation est envoyé à l'email professionnel.
        </p>
      )}

      <form className="admin-settings-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="password-current">Mot de passe actuel</label>
          <input
            id="password-current"
            type="password"
            className="form-input"
            autoComplete="current-password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <PasswordFields
          idPrefix="password"
          password={password}
          confirm={confirm}
          onPassword={setPassword}
          onConfirm={setConfirm}
        />
        <div className="admin-settings-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Changer le mot de passe'}
          </button>
          {result && (
            <span className={result.ok ? 'admin-settings-message' : 'admin-settings-message admin-settings-message--error'} role="status">
              {result.text}
            </span>
          )}
        </div>
      </form>
    </section>
  );
};

export default PasswordChange;
