import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ImageIcon, LightbulbIcon, MagicWandIcon, TrashIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { api } from '../../api';
import { BrandingKind, BrandingUrls } from '../../types';
import {
  analyzeImage,
  buildIco,
  cropSvg,
  cropToPng,
  CropArea,
  CropSource,
  ImageInsights,
  toCropSource,
} from '../../utils/imageCrop';
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
 * Conseils de lisibilité selon l'image enregistrée. Le logo s'affiche sur l'en-tête clair
 * et sur le pied de page sombre ; le favicon est réduit à 16-48 px dans les onglets.
 */
function adviceFor(kind: BrandingKind, { width, height, transparency, luminance }: ImageInsights, vector: boolean): string[] {
  const tips: string[] = [];
  const transparent = transparency > 0.05;
  const ratio = width / height;

  if (!transparent) {
    tips.push(
      kind === 'logo'
        ? "Fond opaque : un rectangle sera visible sur le pied de page sombre. Préférez un PNG à fond transparent ou un SVG."
        : 'Fond opaque : le favicon apparaîtra comme un carré plein dans les onglets. Un fond transparent est plus discret.'
    );
  } else if (kind === 'logo' && luminance < 0.35) {
    tips.push('Logo sombre sur fond transparent : il sera peu lisible sur le pied de page sombre. Une version claire ou un léger fond serait préférable.');
  } else if (kind === 'logo' && luminance > 0.8) {
    tips.push("Logo clair sur fond transparent : il sera peu lisible sur l'en-tête blanc. Une version plus foncée serait préférable.");
  } else if (kind === 'favicon' && luminance > 0.8) {
    tips.push('Favicon très clair : il disparaîtra sur les onglets en thème clair.');
  }

  if (kind === 'logo' && ratio > 5) {
    tips.push("Logo très allongé : affiché à 40 px de haut, le texte deviendra minuscule. Recadrez au plus près ou utilisez une version compacte.");
  }
  if (!vector && kind === 'logo' && height < 120) {
    tips.push('Résolution faible : le logo risque d’être flou sur les écrans haute densité. Un SVG ou un PNG d’au moins 120 px de haut est conseillé.');
  }
  return tips;
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
  const [advice, setAdvice] = useState<string[]>([]);

  useEffect(() => {
    if (!url) {
      setAdvice([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const blob = await (await fetch(url)).blob();
      const objectUrl = URL.createObjectURL(blob);
      try {
        const insights = await analyzeImage(objectUrl);
        if (!cancelled) setAdvice(adviceFor(kind, insights, blob.type === 'image/svg+xml'));
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    })().catch(() => !cancelled && setAdvice([]));
    return () => {
      cancelled = true;
    };
  }, [kind, url]);

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
      {advice.length > 0 && (
        <ul className="branding-field__advice">
          {advice.map((tip) => (
            <li key={tip}>
              <LightbulbIcon size={16} weight="fill" aria-hidden="true" />
              {tip}
            </li>
          ))}
        </ul>
      )}
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
