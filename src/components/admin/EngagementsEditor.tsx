import React, { useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { api } from '../../api';
import { AppConfig } from '../../types';

interface EngagementsEditorProps {
  config: AppConfig;
  onSaved: (config: AppConfig) => void;
}

const ENGAGEMENT_KEY = /^vitrine_engagement_(\d+)$/;

/** Clés `vitrine_engagement_N` présentes en config, triées par N. */
function engagementKeys(config: AppConfig): string[] {
  return Object.keys(config)
    .filter((key) => ENGAGEMENT_KEY.test(key))
    .sort((a, b) => Number(ENGAGEMENT_KEY.exec(a)![1]) - Number(ENGAGEMENT_KEY.exec(b)![1]));
}

const readEngagements = (config: AppConfig) =>
  engagementKeys(config)
    .map((key) => String(config[key] ?? '').trim())
    .filter(Boolean);

/**
 * Liste des engagements de la vitrine : ajout, suppression, réordonnancement.
 * À l'enregistrement, les clés sont renumérotées de 1 à N et les clés en trop supprimées.
 */
const EngagementsEditor: React.FC<EngagementsEditorProps> = ({ config, onSaved }) => {
  const [items, setItems] = useState(() => readEngagements(config));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function change(next: string[]) {
    setItems(next);
    setMessage(null);
  }

  function move(index: number, delta: number) {
    const next = [...items];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    change(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const kept = items.map((item) => item.trim()).filter(Boolean);
    const payload: Record<string, string | null> = Object.fromEntries(
      engagementKeys(config).map((key) => [key, null])
    );
    kept.forEach((item, i) => (payload[`vitrine_engagement_${i + 1}`] = item));
    try {
      const res = await api.updateAdminConfig(payload);
      onSaved(res.config);
      setItems(readEngagements(res.config));
      setMessage('Engagements enregistrés.');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-config-group" aria-labelledby="config-engagements">
      <div className="admin-section-header">
        <h3 className="admin-section-title" id="config-engagements">
          Engagements
        </h3>
      </div>
      <p className="admin-settings-intro">
        Cartes affichées sur la vitrine, dans cet ordre. L'icône est choisie selon le texte (ponctualité, garantie,
        domicile, devis…). Sans engagement, la section est masquée.
      </p>

      <form className="admin-settings-form engagements-editor" onSubmit={handleSubmit}>
        {items.length === 0 && <p className="engagements-editor__empty">Aucun engagement.</p>}
        {items.map((item, i) => (
          <div className="engagements-editor__item" key={i}>
            <input
              className="form-input"
              aria-label={`Engagement ${i + 1}`}
              value={item}
              onChange={(e) => change(items.map((v, j) => (j === i ? e.target.value : v)))}
            />
            <button
              type="button"
              className="btn btn-secondary btn-icon"
              aria-label="Monter"
              disabled={i === 0}
              onClick={() => move(i, -1)}
            >
              <ArrowUpIcon size={16} weight="fill" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-icon"
              aria-label="Descendre"
              disabled={i === items.length - 1}
              onClick={() => move(i, 1)}
            >
              <ArrowDownIcon size={16} weight="fill" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-icon"
              aria-label="Supprimer"
              onClick={() => change(items.filter((_, j) => j !== i))}
            >
              <TrashIcon size={16} weight="fill" aria-hidden="true" />
            </button>
          </div>
        ))}

        <div className="admin-settings-actions">
          <button type="button" className="btn btn-secondary" onClick={() => change([...items, ''])}>
            <PlusIcon size={18} weight="fill" aria-hidden="true" />
            Ajouter un engagement
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          {message && <span className="admin-settings-message">{message}</span>}
        </div>
      </form>
    </section>
  );
};

export default EngagementsEditor;
