import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { CheckIcon, PaletteIcon, WarningIcon } from '@phosphor-icons/react';
import { api } from '../../api';
import { AppConfig } from '../../types';
import {
  RADIUS_OPTIONS,
  THEME_PRESETS,
  ThemeSettings,
  applyTheme,
  contrastWithWhite,
  themeFromConfig,
  themeToConfig,
} from '../../utils/theme';
import ResetButton from './ResetButton';

interface AppearanceEditorProps {
  config: AppConfig;
  onSaved: (config: AppConfig) => void;
}

/** Contraste minimal du texte blanc sur la couleur principale (WCAG AA). */
const MIN_CONTRAST = 4.5;

const EFFECTS: { key: 'softShadows' | 'glass' | 'motion'; label: string; hint: string }[] = [
  { key: 'softShadows', label: 'Ombres douces', hint: 'Ombres plus diffuses, légèrement teintées de la couleur principale.' },
  { key: 'glass', label: 'Verre dépoli', hint: "Barres et fenêtres translucides avec flou d'arrière-plan." },
  {
    key: 'motion',
    label: 'Animations',
    hint: "Cartes qui se soulèvent au survol, sections de la vitrine révélées au défilement. Coupées si l'appareil du visiteur demande moins d'animations.",
  },
];

/**
 * Apparence du site (Item 2) : couleur principale, arrondis et effets, avec aperçu en direct
 * sur tout le site (espace Pro compris) tant que le réglage n'est pas enregistré ou annulé.
 */
const AppearanceEditor: React.FC<AppearanceEditorProps> = ({ config, onSaved }) => {
  const stored = themeFromConfig(config);
  const [values, setValues] = useState<ThemeSettings>(stored);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const dirty = JSON.stringify(values) !== JSON.stringify(stored);
  const contrast = contrastWithWhite(values.primary);

  // Aperçu en direct ; le thème enregistré est rétabli en quittant l'écran sans enregistrer
  const savedConfig = useRef(config);
  savedConfig.current = config;
  useEffect(() => {
    applyTheme(values, false);
  }, [values]);
  useEffect(() => () => applyTheme(themeFromConfig(savedConfig.current)), []);

  function update(patch: Partial<ThemeSettings>) {
    setValues((prev) => ({ ...prev, ...patch }));
    setMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.updateAdminConfig(themeToConfig(values));
      onSaved(res.config);
      applyTheme(themeFromConfig(res.config));
      setMessage('Apparence enregistrée.');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-config-group" aria-labelledby="config-appearance">
      <div className="admin-section-header">
        <h3 className="admin-section-title" id="config-appearance">
          <PaletteIcon size={20} weight="fill" aria-hidden="true" />
          Apparence
        </h3>
      </div>
      <p className="admin-settings-intro">
        Couleur, arrondis et effets de la vitrine, du tunnel de réservation, de l'espace Artisan et des emails.
        L'aperçu s'applique immédiatement ; rien n'est visible des clients avant l'enregistrement.
      </p>

      <form className="admin-settings-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <span className="form-label" id="theme-color-label">Couleur principale</span>
          <div className="theme-swatches" role="radiogroup" aria-labelledby="theme-color-label">
            {THEME_PRESETS.map(({ name, color }) => {
              const active = values.primary.toLowerCase() === color;
              return (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={name}
                  title={name}
                  className={clsx('theme-swatch', `theme-swatch--${color.slice(1)}`, { 'theme-swatch--active': active })}
                  onClick={() => update({ primary: color })}
                >
                  {active && <CheckIcon size={16} weight="bold" aria-hidden="true" />}
                </button>
              );
            })}
            <label className="theme-custom-color">
              <input
                type="color"
                value={values.primary}
                onChange={(e) => update({ primary: e.target.value })}
                aria-label="Couleur personnalisée"
              />
              <span>Personnalisée</span>
              <code>{values.primary}</code>
            </label>
          </div>
          {contrast < MIN_CONTRAST && (
            <p className="theme-contrast-warning" role="status">
              <WarningIcon size={16} weight="fill" aria-hidden="true" />
              Couleur trop claire : le texte blanc des boutons sera peu lisible (contraste {contrast.toFixed(1)}:1, 4,5:1
              conseillé). Choisissez une teinte plus foncée.
            </p>
          )}
        </div>

        <div className="form-group">
          <span className="form-label" id="theme-radius-label">Arrondis</span>
          <div className="theme-radius" role="radiogroup" aria-labelledby="theme-radius-label">
            {RADIUS_OPTIONS.map(({ value, label }) => (
              <label key={value} className={clsx('theme-radius__option', { 'theme-radius__option--active': values.radius === value })}>
                <input
                  type="radio"
                  name="theme-radius"
                  value={value}
                  checked={values.radius === value}
                  onChange={() => update({ radius: value })}
                />
                <span className={`theme-radius__preview theme-radius__preview--${value}`} aria-hidden="true" />
                {label}
              </label>
            ))}
          </div>
        </div>

        <fieldset className="form-group theme-effects">
          <legend className="form-label">Effets</legend>
          {EFFECTS.map(({ key, label, hint }) => (
            <label key={key} className="theme-effect">
              <input type="checkbox" checked={values[key]} onChange={(e) => update({ [key]: e.target.checked })} />
              <span>
                <strong>{label}</strong>
                <span className="form-hint">{hint}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <div className="admin-settings-actions">
          <button type="submit" className="btn btn-primary" disabled={saving || !dirty}>
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

export default AppearanceEditor;
