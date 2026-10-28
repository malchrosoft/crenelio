import { createPortal } from 'react-dom';
import React, { useEffect } from 'react';
import { XIcon } from '@phosphor-icons/react';

interface ConfirmDialogProps {
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Fenêtre de confirmation d'une action qui écrase des données (Échap pour annuler). */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ title, children, confirmLabel, onConfirm, onCancel }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  // Portail vers <body> : la fenêtre ne dépend jamais du conteneur qui l'ouvre (transformations, flou)
  return createPortal(
    <div className="admin-modal-overlay" role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className="admin-modal">
        <div className="admin-modal__header">
          <h3 className="admin-modal__title" id="confirm-dialog-title">
            {title}
          </h3>
          <button type="button" className="admin-modal__close" onClick={onCancel} aria-label="Fermer">
            <XIcon size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>
        <div className="admin-modal__body">
          <div className="confirm-dialog__text">{children}</div>
          <div className="admin-settings-actions confirm-dialog__actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Annuler
            </button>
            {/* Focus par défaut sur l'action pour un enchaînement au clavier */}
            <button type="button" className="btn btn-primary" onClick={onConfirm} autoFocus>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;
