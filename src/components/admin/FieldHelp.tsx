import { createPortal } from 'react-dom';
import React, { useEffect, useState } from 'react';
import { BookOpenTextIcon, QuestionIcon, XIcon } from '@phosphor-icons/react';
import { FIELD_HELP, FieldHelpKey } from '../../config/fieldHelp';

/**
 * Bouton « ? » à côté d'un champ délicat (Item 40) : ouvre une fenêtre qui explique comment le remplir,
 * pourquoi il est demandé et sur quel texte il repose, avec un lien vers la fiche de la Documentation.
 * Contenu : `src/config/fieldHelp.ts`.
 */
const FieldHelp: React.FC<{ topic: FieldHelpKey }> = ({ topic }) => {
  const [open, setOpen] = useState(false);
  const help = FIELD_HELP[topic];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open]);

  return (
    <>
      <button type="button" className="field-help" title={`Aide : ${help.title}`} aria-label={`Aide : ${help.title}`} onClick={() => setOpen(true)}>
        <QuestionIcon size={14} weight="bold" aria-hidden="true" />
      </button>
      {open &&
        createPortal(
          <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="field-help-title" onClick={() => setOpen(false)}>
            <div className="admin-modal field-help__dialog" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal__header">
                <h3 className="admin-modal__title" id="field-help-title">
                  {help.title}
                </h3>
                <button type="button" className="admin-modal__close" onClick={() => setOpen(false)} aria-label="Fermer" autoFocus>
                  <XIcon size={18} weight="bold" aria-hidden="true" />
                </button>
              </div>
              <div className="admin-modal__body field-help__body">
                <h4>Comment le remplir</h4>
                <p>{help.how}</p>
                <h4>Pourquoi</h4>
                <p>{help.why}</p>
                <h4>Textes</h4>
                <ul>
                  {help.refs.map((ref) => (
                    <li key={ref}>{ref}</li>
                  ))}
                </ul>
                {'doc' in help && help.doc && (
                  <a className="btn btn-secondary admin-btn-sm" href={`/admin?doc=${encodeURIComponent(help.doc)}`} target="_blank" rel="noopener">
                    <BookOpenTextIcon size={14} weight="bold" aria-hidden="true" />
                    Lire la fiche dans la Documentation
                  </a>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default FieldHelp;
