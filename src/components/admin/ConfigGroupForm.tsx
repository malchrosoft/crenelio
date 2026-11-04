import React, { useState } from 'react';
import { api } from '../../api';
import { AppConfig } from '../../types';
import { ConfigField, ConfigGroup } from '../../config/configSchema';
import ResetButton from './ResetButton';
import FieldHelp from './FieldHelp';
import { hasFieldHelp } from '../../config/fieldHelp';
import ConfirmDialog from './ConfirmDialog';

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
  // Case à cocher en attente de l'acceptation de son avertissement (`confirmEnable`)
  const [pending, setPending] = useState<ConfigField | null>(null);

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
        {group.fields.map((field) => {
          const { key, label, type, unit, step, hint, options, allowCustom, enableIf, disabledHint } = field;
          const disabled =
            enableIf !== undefined &&
            ((enableIf.equals !== undefined && values[enableIf.key] !== enableIf.equals) ||
              (enableIf.in !== undefined && !enableIf.in.includes(values[enableIf.key])));
          const id = `config-field-${key}`;
          if (type === 'checkbox') {
            return (
              <div className="form-group" key={key}>
                <div className="form-label-row">
                  <label className="form-check" htmlFor={id}>
                    <input
                      id={id}
                      type="checkbox"
                      checked={values[key] === '1'}
                      onChange={(e) =>
                        e.target.checked && field.confirmEnable ? setPending(field) : update(key, e.target.checked ? '1' : '0')
                      }
                    />
                    <span>{label}</span>
                  </label>
                  {hasFieldHelp(key) && <FieldHelp topic={key} />}
                </div>
                {hint && <p className="form-hint">{hint}</p>}
              </div>
            );
          }
          const input =
            type === 'select' ? (
              <SelectField
                id={id}
                value={values[key]}
                options={options ?? []}
                allowCustom={allowCustom}
                disabled={disabled}
                onChange={(value) => update(key, value)}
              />
            ) : type === 'textarea' ? (
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
                disabled={disabled}
                className={unit ? 'form-input form-input--compact' : 'form-input'}
                value={values[key]}
                onChange={(e) => update(key, e.target.value)}
              />
            );

          return (
            <div className="form-group" key={key}>
              <div className="form-label-row">
                <label className="form-label" htmlFor={id}>
                  {label}
                </label>
                {hasFieldHelp(key) && <FieldHelp topic={key} />}
              </div>
              {unit ? (
                <div className="form-field-unit">
                  {input}
                  <span className="form-unit">{unit}</span>
                </div>
              ) : (
                input
              )}
              {disabled && disabledHint ? (
                <p className="form-hint">{disabledHint}</p>
              ) : (
                hint && <p className="form-hint">{hint}</p>
              )}
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

      {pending?.confirmEnable &&
        (() => {
          const warning = pending.confirmEnable(config);
          return (
            <ConfirmDialog
              title={warning.title}
              confirmLabel={warning.confirmLabel}
              onConfirm={() => {
                update(pending.key, '1');
                setPending(null);
              }}
              onCancel={() => setPending(null)}
            >
              {warning.paragraphs.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </ConfirmDialog>
          );
        })()}
    </section>
  );
};

const CUSTOM = '__custom';

/** Liste de choix ; avec `allowCustom`, « Autre » ouvre une saisie libre (valeur hors liste). */
const SelectField: React.FC<{
  id: string;
  value: string;
  options: { value: string; label: string }[];
  allowCustom?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
}> = ({ id, value, options, allowCustom, disabled, onChange }) => {
  const listed = options.some((option) => option.value === value);
  const [custom, setCustom] = useState(Boolean(allowCustom) && !listed && value !== '');
  return (
    <>
      <select
        id={id}
        className="form-input"
        disabled={disabled}
        value={custom ? CUSTOM : value}
        onChange={(e) => {
          const isCustom = e.target.value === CUSTOM;
          setCustom(isCustom);
          onChange(isCustom ? '' : e.target.value);
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {allowCustom && <option value={CUSTOM}>Autre (saisie libre)</option>}
      </select>
      {custom && (
        <input
          className="form-input form-input--custom"
          aria-label="Valeur libre"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </>
  );
};

export default ConfigGroupForm;
