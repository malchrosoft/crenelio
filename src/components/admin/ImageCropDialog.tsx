import React, { useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import clsx from 'clsx';
import { CropArea, CropSource } from '../../utils/imageCrop';

export interface AspectOption {
  label: string;
  /** Rapport largeur / hauteur ; `undefined` = proportions d'origine. */
  value?: number;
}

interface ImageCropDialogProps {
  title: string;
  source: CropSource;
  aspects: AspectOption[];
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: (area: CropArea) => void;
}

/**
 * Modale de recadrage : glisser pour déplacer, molette ou curseur pour zoomer.
 * Le dézoom est permis pour ajouter des marges transparentes autour de l'image.
 */
const ImageCropDialog: React.FC<ImageCropDialogProps> = ({
  title,
  source,
  aspects,
  saving,
  error,
  onCancel,
  onConfirm,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectIndex, setAspectIndex] = useState(0);
  const [area, setArea] = useState<CropArea | null>(null);

  const aspect = aspects[aspectIndex].value ?? source.width / source.height;

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="crop-modal-title">
      <div className="admin-modal admin-modal--wide">
        <div className="admin-modal__header">
          <h3 className="admin-modal__title" id="crop-modal-title">
            {title}
          </h3>
          <button className="admin-modal__close" onClick={onCancel} aria-label="Fermer" disabled={saving}>
            ✕
          </button>
        </div>

        <div className="admin-modal__body">
          <div className="crop-area">
            <Cropper
              image={source.url}
              crop={crop}
              zoom={zoom}
              minZoom={0.5}
              maxZoom={5}
              aspect={aspect}
              restrictPosition={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_: Area, pixels: Area) => setArea(pixels)}
            />
          </div>

          <div className="crop-controls">
            <label className="form-label" htmlFor="crop-zoom">
              Zoom
            </label>
            <input
              id="crop-zoom"
              type="range"
              className="crop-controls__zoom"
              min={0.5}
              max={5}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </div>

          {aspects.length > 1 && (
            <div className="crop-aspects" role="group" aria-label="Proportions">
              {aspects.map((option, i) => (
                <button
                  key={option.label}
                  type="button"
                  className={clsx('btn', i === aspectIndex ? 'btn-primary' : 'btn-secondary')}
                  onClick={() => setAspectIndex(i)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {error && <p className="form-alert-error">{error}</p>}

          <div className="admin-modal__actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
              Annuler
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!area || saving}
              onClick={() => area && onConfirm(area)}
            >
              {saving ? 'Enregistrement…' : 'Valider et enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropDialog;
