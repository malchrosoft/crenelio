import React, { useState } from 'react';
import { LANGUAGES, useLanguagePreference } from '../../i18n/languages';

/**
 * Langue préférée de l'Espace Artisan (écran Compte, Item 40) : ouvre la documentation dans cette
 * langue ; servira à la traduction complète de l'interface. Le français fait foi.
 */
const LanguageSettings: React.FC = () => {
  const [language, save] = useLanguagePreference();
  const [status, setStatus] = useState<string | null>(null);

  async function change(code: string) {
    setStatus(null);
    try {
      await save(code);
      setStatus('Langue enregistrée.');
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Erreur');
    }
  }

  return (
    <section className="admin-config-group" aria-labelledby="config-language">
      <div className="admin-section-header">
        <h3 className="admin-section-title" id="config-language">
          Langue
        </h3>
      </div>
      <p className="admin-settings-intro">
        Langue de la documentation (menu Aide), puis de tout l'Espace Artisan quand l'interface sera traduite. Les textes
        officiels restent cités en français, et la version française fait foi. Les pages vues par vos clients restent en français.
      </p>
      <div className="form-group">
        <label className="form-label" htmlFor="config-language-select">
          Langue préférée
        </label>
        <select
          id="config-language-select"
          className="form-input form-input--compact"
          value={language}
          onChange={(e) => change(e.target.value)}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
              {l.label !== l.frenchLabel ? ` (${l.frenchLabel})` : ''}
            </option>
          ))}
        </select>
        {status && <p className="form-hint">{status}</p>}
      </div>
    </section>
  );
};

export default LanguageSettings;
