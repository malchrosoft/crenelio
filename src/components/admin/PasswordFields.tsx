import React from 'react';

/** Longueur minimale, identique à Auth::MIN_LENGTH (api/core/Auth.php). */
export const PASSWORD_MIN_LENGTH = 12;

interface PasswordFieldsProps {
  idPrefix: string;
  password: string;
  confirm: string;
  onPassword: (value: string) => void;
  onConfirm: (value: string) => void;
}

/** Nouveau mot de passe + confirmation, avec rappel des règles (vérifiées aussi par le serveur). */
const PasswordFields: React.FC<PasswordFieldsProps> = ({ idPrefix, password, confirm, onPassword, onConfirm }) => (
  <>
    <div className="form-group">
      <label className="form-label" htmlFor={`${idPrefix}-new`}>Nouveau mot de passe</label>
      <input
        id={`${idPrefix}-new`}
        type="password"
        className="form-input"
        autoComplete="new-password"
        minLength={PASSWORD_MIN_LENGTH}
        required
        value={password}
        onChange={(e) => onPassword(e.target.value)}
      />
      <p className="form-hint">
        Au moins {PASSWORD_MIN_LENGTH} caractères. Une courte phrase est plus simple à retenir et plus sûre qu'un mot
        compliqué. Évitez le nom de l'entreprise et votre email.
      </p>
    </div>
    <div className="form-group">
      <label className="form-label" htmlFor={`${idPrefix}-confirm`}>Confirmer le mot de passe</label>
      <input
        id={`${idPrefix}-confirm`}
        type="password"
        className="form-input"
        autoComplete="new-password"
        required
        value={confirm}
        onChange={(e) => onConfirm(e.target.value)}
      />
    </div>
  </>
);

/** Contrôles côté navigateur avant envoi (le serveur refuse aussi les mots de passe trop courants). */
export function passwordFieldsError(password: string, confirm: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) return `Le mot de passe doit comporter au moins ${PASSWORD_MIN_LENGTH} caractères`;
  if (password !== confirm) return 'Les deux mots de passe ne correspondent pas';
  return null;
}

export default PasswordFields;
