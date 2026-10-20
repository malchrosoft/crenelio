import React, { lazy, Suspense, useRef, useState } from 'react';
import { ImageIcon, MagicWandIcon, TrashIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { api } from '../../api';
import { BrandingKind, BrandingUrls } from '../../types';
import { buildIco, cropSvg, cropToPng, CropArea, CropSource, toCropSource } from '../../utils/imageCrop';
import type { AspectOption } from './ImageCropDialog';

// Rogneur chargé à la demande : il n'alourdit pas le bundle de la vitrine
const ImageCropDialog = lazy(() => import('./ImageCropDialog'));

interface BrandingFieldProps {
  kind: BrandingKind;
  /** URL du fichier actuel, null si aucun (repli appliqué). */
  url: string | null | undefined;
  /** Logo actuel, proposé comme point de départ du favicon. */
  logoUrl?: string | null;
  onChange: (urls: BrandingUrls) => void;
}

const SETTINGS: Record<BrandingKind, { label: string; fallback: string; aspects: AspectOption[] }> = {
  logo: {
    label: 'Logo',
    fallback: "Aucun logo : le nom de l'entreprise est affiché à la place.",
    aspects: [
      { label: 'Original' },
      { label: 'Horizontal 3:1', value: 3 },
      { label: 'Paysage 4:3', value: 4 / 3 },
      { label: 'Carré', value: 1 },
    ],
  },
  favicon: {
    label: 'Favicon',
    fallback: "Aucun favicon : l'icône Crénelio par défaut est utilisée.",
    aspects: [{ label: 'Carré', value: 1 }],
  },
};

/** Fichiers à enregistrer pour une zone rognée : le favicon est décliné en PNG 512 px et ICO. */
async function buildFiles(kind: BrandingKind, source: CropSource, area: CropArea) {
  const svg = source.kind === 'svg' ? new Blob([cropSvg(source, area)], { type: 'image/svg+xml' }) : undefined;
  if (kind === 'logo') {
    return svg ? { svg } : { png: await cropToPng(source, area, 2048) };
  }
  const png = await cropToPng(source, area, 512, true);
  return { png, ico: await buildIco(png), svg };
}

/**
 * Logo ou favicon : aperçu, envoi d'un PNG/SVG avec recadrage, suppression (retour au repli).
 * Le favicon peut partir du logo actuel ou d'une image dédiée, plus épurée.
 */
const BrandingField: React.FC<BrandingFieldProps> = ({ kind, url, logoUrl, onChange }) => {
  const { label, fallback, aspects } = SETTINGS[kind];
  const inputRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<CropSource | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open(blob: Blob) {
    setError(null);
    try {
      setSource(await toCropSource(blob));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Image illisible");
    }
  }

  async function openFromLogo() {
    if (!logoUrl) return;
    const res = await fetch(logoUrl);
    open(await res.blob());
  }

  function close() {
    if (source?.kind === 'png') URL.revokeObjectURL(source.url);
    setSource(null);
  }

  async function save(area: CropArea) {
    if (!source) return;
    setSaving(true);
    setError(null);
    try {
      onChange(await api.uploadBranding(kind, await buildFiles(kind, source, area)));
      close();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setError(null);
    try {
      onChange(await api.deleteBranding(kind));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  }

  return (
    <div className="form-group branding-field">
      <span className="form-label">{label}</span>
      <div className="branding-field__row">
        <div className={`branding-field__preview branding-field__preview--${kind}`}>
          {url ? <img src={url} alt={`${label} actuel`} /> : <ImageIcon size={28} weight="fill" aria-hidden="true" />}
        </div>
        <div className="branding-field__actions">
          <button type="button" className="btn btn-secondary" onClick={() => inputRef.current?.click()}>
            <UploadSimpleIcon size={18} weight="fill" aria-hidden="true" />
            {url ? 'Remplacer' : 'Choisir une image'}
          </button>
          {kind === 'favicon' && logoUrl && (
            <button type="button" className="btn btn-secondary" onClick={openFromLogo}>
              <MagicWandIcon size={18} weight="fill" aria-hidden="true" />
              Générer depuis le logo
            </button>
          )}
          {url && (
            <button type="button" className="btn btn-secondary" onClick={remove}>
              <TrashIcon size={18} weight="fill" aria-hidden="true" />
              Supprimer
            </button>
          )}
        </div>
      </div>
      <p className="form-hint">{url ? 'PNG ou SVG, 2 Mo maximum.' : fallback}</p>
      {error && !source && <p className="form-alert-error">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/svg+xml"
        className="branding-field__input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) open(file);
        }}
      />

      {source && (
        <Suspense fallback={null}>
          <ImageCropDialog
            title={`Recadrer le ${label.toLowerCase()}`}
            source={source}
            aspects={aspects}
            saving={saving}
            error={error}
            onCancel={close}
            onConfirm={save}
          />
        </Suspense>
      )}
    </div>
  );
};

export default BrandingField;
