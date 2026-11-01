import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { InfoIcon, WarningIcon } from '@phosphor-icons/react';

/** Avertissement de l'espace Artisan (sécurité, configuration incomplète…). */
export interface AdminNotice {
  id: string;
  level: 'warning' | 'info';
  title: string;
  text: React.ReactNode;
  /** Raccourci vers l'écran qui règle le problème. */
  action?: { label: string; onClick: () => void };
}

interface AdminNoticesProps {
  notices: AdminNotice[];
}

/**
 * Avertissements regroupés dans le header (pastille avec compteur et liste déroulante) plutôt qu'en
 * bandeaux en tête de page : ils restent visibles sans prendre de hauteur sur les écrans de travail.
 */
const AdminNotices: React.FC<AdminNoticesProps> = ({ notices }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fermeture au clic extérieur et sur Échap
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (notices.length === 0) return null;
  const hasWarning = notices.some((n) => n.level === 'warning');

  return (
    <div className="admin-notices" ref={ref}>
      <button
        type="button"
        className={clsx('admin-notices__trigger', { 'admin-notices__trigger--warning': hasWarning })}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        title="Avertissements"
      >
        {hasWarning ? (
          <WarningIcon size={18} weight="fill" aria-hidden="true" />
        ) : (
          <InfoIcon size={18} weight="fill" aria-hidden="true" />
        )}
        <span className="admin-notices__count">{notices.length}</span>
        <span className="admin-notices__label">avertissement{notices.length > 1 ? 's' : ''}</span>
      </button>

      {open && (
        <div className="admin-notices__panel" role="dialog" aria-label="Avertissements">
          <ul>
            {notices.map((notice) => (
              <li key={notice.id} className={clsx('admin-notices__item', `admin-notices__item--${notice.level}`)}>
                {notice.level === 'warning' ? (
                  <WarningIcon size={18} weight="fill" aria-hidden="true" />
                ) : (
                  <InfoIcon size={18} weight="fill" aria-hidden="true" />
                )}
                <div>
                  <strong>{notice.title}</strong>
                  <p>{notice.text}</p>
                  {notice.action && (
                    <button
                      type="button"
                      className="btn btn-secondary admin-btn-sm"
                      onClick={() => {
                        setOpen(false);
                        notice.action?.onClick();
                      }}
                    >
                      {notice.action.label}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminNotices;
