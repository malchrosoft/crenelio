import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { ArrowDownIcon, ArrowUpIcon, MagicWandIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { api } from '../../api';
import { AppConfig } from '../../types';
import { ENGAGEMENT_ICONS, resolveEngagementIcon } from '../../config/engagementIcons';
import ResetButton from './ResetButton';

interface EngagementsEditorProps {
  config: AppConfig;
  onSaved: (config: AppConfig) => void;
}

/** Engagement en cours d'édition : texte et picto ('' = déduit du texte). */
interface Item {
  text: string;
  icon: string;
}

const ENGAGEMENT_KEY = /^vitrine_engagement_(\d+)$/;
const ICON_KEY = /^vitrine_engagement_\d+_icon$/;

/** Clés `vitrine_engagement_N` présentes en config, triées par N. */
function engagementKeys(config: AppConfig): string[] {
  return Object.keys(config)
    .filter((key) => ENGAGEMENT_KEY.test(key))
    .sort((a, b) => Number(ENGAGEMENT_KEY.exec(a)![1]) - Number(ENGAGEMENT_KEY.exec(b)![1]));
}

const readEngagements = (config: AppConfig): Item[] =>
  engagementKeys(config)
    .map((key) => ({ text: String(config[key] ?? '').trim(), icon: String(config[`${key}_icon`] ?? '') }))
    .filter((item) => item.text);

interface IconPickerProps {
  item: Item;
  index: number;
  onPick: (icon: string) => void;
}

/** Bouton affichant le picto de l'engagement ; ouvre une grille de choix (Échap ou clic extérieur pour fermer). */
const IconPicker: React.FC<IconPickerProps> = ({ item, index, onPick }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { icon: Current, label } = resolveEngagementIcon(item.text, item.icon);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  function pick(icon: string) {
    onPick(icon);
    setOpen(false);
  }

  return (
    <div className="icon-picker" ref={ref}>
      <button
        type="button"
        className={clsx('btn btn-secondary btn-icon icon-picker__trigger', { 'icon-picker__trigger--auto': !item.icon })}
        aria-label={`Picto de l'engagement ${index + 1} : ${item.icon ? label : `automatique (${label})`}`}
        aria-expanded={open}
        title={item.icon ? label : `Automatique : ${label}`}
        onClick={() => setOpen((o) => !o)}
      >
        <Current size={20} weight="fill" aria-hidden="true" />
      </button>

      {open && (
        <div className="icon-picker__panel" role="listbox" aria-label="Choisir un picto">
          <button
            type="button"
            role="option"
            aria-selected={!item.icon}
            className={clsx('icon-picker__option icon-picker__option--wide', { 'icon-picker__option--selected': !item.icon })}
            onClick={() => pick('')}
          >
            <MagicWandIcon size={18} weight="fill" aria-hidden="true" />
            Automatique (selon le texte)
          </button>
          {ENGAGEMENT_ICONS.map(({ id, label: optionLabel, icon: OptionIcon }) => (
            <button
              key={id}
              type="button"
              role="option"
              aria-selected={item.icon === id}
              title={optionLabel}
              className={clsx('icon-picker__option', { 'icon-picker__option--selected': item.icon === id })}
              onClick={() => pick(id)}
            >
              <OptionIcon size={22} weight="fill" aria-hidden="true" />
              <span>{optionLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Liste des engagements de la vitrine : texte, picto, ajout, suppression, réordonnancement.
 * À l'enregistrement, les clés sont renumérotées de 1 à N et les clés en trop supprimées.
 */
const EngagementsEditor: React.FC<EngagementsEditorProps> = ({ config, onSaved }) => {
  const [items, setItems] = useState(() => readEngagements(config));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const stored = readEngagements(config);
  const dirty = JSON.stringify(items) !== JSON.stringify(stored);

  function change(next: Item[]) {
    setItems(next);
    setMessage(null);
  }

  function update(index: number, patch: Partial<Item>) {
    change(items.map((item, j) => (j === index ? { ...item, ...patch } : item)));
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
    const kept = items.map((item) => ({ ...item, text: item.text.trim() })).filter((item) => item.text);
    // Anciennes clés (textes et pictos) supprimées, puis réécriture de 1 à N
    const payload: Record<string, string | null> = Object.fromEntries(
      Object.keys(config)
        .filter((key) => ENGAGEMENT_KEY.test(key) || ICON_KEY.test(key))
        .map((key) => [key, null])
    );
    kept.forEach((item, i) => {
      payload[`vitrine_engagement_${i + 1}`] = item.text;
      if (item.icon) payload[`vitrine_engagement_${i + 1}_icon`] = item.icon;
    });
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
        Cartes affichées sur la vitrine, dans cet ordre. Le picto est déduit du texte (ponctualité, garantie, devis,
        urgence, propreté…) ou choisi avec le bouton à gauche. Sans engagement, la section est masquée.
      </p>

      <form className="admin-settings-form engagements-editor" onSubmit={handleSubmit}>
        {items.length === 0 && <p className="engagements-editor__empty">Aucun engagement.</p>}
        {items.map((item, i) => (
          <div className="engagements-editor__item" key={i}>
            <IconPicker item={item} index={i} onPick={(icon) => update(i, { icon })} />
            <input
              className="form-input"
              aria-label={`Engagement ${i + 1}`}
              value={item.text}
              onChange={(e) => update(i, { text: e.target.value })}
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

        <button
          type="button"
          className="btn btn-secondary engagements-editor__add"
          onClick={() => change([...items, { text: '', icon: '' }])}
        >
          <PlusIcon size={18} weight="fill" aria-hidden="true" />
          Ajouter un engagement
        </button>

        <div className="admin-settings-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <ResetButton dirty={dirty} disabled={saving} onReset={() => change(stored)} />
          {message && <span className="admin-settings-message">{message}</span>}
        </div>
      </form>
    </section>
  );
};

export default EngagementsEditor;
