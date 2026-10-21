import React, { useState } from 'react';
import { api } from '../../api';
import { AppConfig } from '../../types';
import { ConfigField, ConfigGroup } from '../../config/configSchema';
import ResetButton from './ResetButton';

interface ConfigGroupFormProps {
  group: ConfigGroup;
  config: AppConfig;
  onSaved: (config: AppConfig) => void;
  /** Contenu propre au groupe, enregistré indépendamment du formulaire (ex. logo). */
  children?: React.ReactNode;
}

const pickValues = (fields: ConfigField[], config: AppConfig): Record<string, string> =>
  Object.fromEntries(fields.map(({ key }) => [key, config[key] ?? '']));

/**
 * Formulaire générique d'un groupe de paramètres : n'envoie que les clés du groupe.
 */
const ConfigGroupForm: React.FC<ConfigGroupFormProps> = ({ group, config, onSaved, children }) => {
  const [values, setValues] = useState(() => pickValues(group.fields, config));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const stored = pickValues(group.fields, config);
  const dirty = group.fields.some(({ key }) => values[key] !== stored[key]);

  function update(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.updateAdminConfig(values);
      onSaved(res.config);
      setValues(pickValues(group.fields, res.config));
      setMessage('Paramètres enregistrés.');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-config-group" aria-labelledby={`config-${group.id}`}>
      <div className="admin-section-header">
        <h3 className="admin-section-title" id={`config-${group.id}`}>
          {group.title}
        </h3>
      </div>
      {group.intro && <p className="admin-settings-intro">{group.intro}</p>}
      {children}

      <form className="admin-settings-form" onSubmit={handleSubmit}>
        {group.fields.map(({ key, label, type, unit, step, hint }) => {
          const id = `config-field-${key}`;
          const input =
            type === 'textarea' ? (
              <textarea
                id={id}
                className="form-textarea"
                value={values[key]}
                onChange={(e) => update(key, e.target.value)}
              />
            ) : (
              <input
                id={id}
                type={type}
                step={step}
                className={unit ? 'form-input form-input--compact' : 'form-input'}
                value={values[key]}
                onChange={(e) => update(key, e.target.value)}
              />
            );

          return (
            <div className="form-group" key={key}>
              <label className="form-label" htmlFor={id}>
                {label}
              </label>
              {unit ? (
                <div className="form-field-unit">
                  {input}
                  <span className="form-unit">{unit}</span>
                </div>
              ) : (
                input
              )}
              {hint && <p className="form-hint">{hint}</p>}
            </div>
          );
        })}

        <div className="admin-settings-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <ResetButton
            dirty={dirty}
            disabled={saving}
            onReset={() => {
              setValues(stored);
              setMessage(null);
            }}
          />
          {message && <span className="admin-settings-message">{message}</span>}
        </div>
      </form>
    </section>
  );
};

export default ConfigGroupForm;
