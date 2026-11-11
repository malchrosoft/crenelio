import { createPortal } from 'react-dom';
import React, { useEffect, useState } from 'react';
import { BookOpenTextIcon, QuestionIcon, XIcon } from '@phosphor-icons/react';
import { FIELD_HELP, FIELD_HELP_LABELS, FieldHelpKey, FieldHelpTranslation, loadFieldHelpTranslation } from '../../config/fieldHelp';
import { languageOf, useLanguagePreference } from '../../i18n/languages';

/**
 * Bouton « ? » à côté d'un champ délicat (Item 40) : ouvre une fenêtre qui explique comment le remplir,
 * pourquoi il est demandé et sur quel texte il repose, avec un lien vers la fiche de la Documentation.
 * Contenu : `src/config/fieldHelp.ts` (français, fait foi) et ses traductions `src/config/fieldHelp/<langue>.json`,
 * affichées dans la langue préférée (écran Compte) ; les références des textes officiels restent en français.
 */
const FieldHelp: React.FC<{ topic: FieldHelpKey }> = ({ topic }) => {
  const [open, setOpen] = useState(false);
  const help = FIELD_HELP[topic];
  const [language] = useLanguagePreference();
  const [translation, setTranslation] = useState<FieldHelpTranslation | null>(null);

  useEffect(() => {
    if (!open) return;
    let current = true;
    loadFieldHelpTranslation(language).then((t) => current && setTranslation(t));
    return () => {
      current = false;
    };
  }, [open, language]);

  const entry = translation?.entries[topic];
  const labels = entry ? translation.labels : FIELD_HELP_LABELS;
  const text = entry ?? help;
  const lang = entry ? language : 'fr';
  const { dir } = languageOf(lang);

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
      {/* Pas un <button> : un <fieldset disabled> (devis envoyé, en lecture) le désactiverait, alors que l'aide
          doit rester consultable */}
      <span
        role="button"
        tabIndex={0}
        className="field-help"
        title={`Aide : ${help.title}`}
        aria-label={`Aide : ${help.title}`}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <QuestionIcon size={14} weight="bold" aria-hidden="true" />
      </span>
      {open &&
        createPortal(
          <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="field-help-title" onClick={() => setOpen(false)}>
            <div className="admin-modal field-help__dialog" lang={lang} dir={dir} onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal__header">
                <h3 className="admin-modal__title" id="field-help-title">
                  {text.title}
                </h3>
                <button type="button" className="admin-modal__close" onClick={() => setOpen(false)} aria-label="Fermer" autoFocus>
                  <XIcon size={18} weight="bold" aria-hidden="true" />
                </button>
              </div>
              <div className="admin-modal__body field-help__body">
                <h4>{labels.how}</h4>
                <p>{text.how}</p>
                <h4>{labels.why}</h4>
                <p>{text.why}</p>
                <h4>{labels.refs}</h4>
                {/* Références des textes officiels : toujours en français */}
                <ul lang="fr" dir="ltr">
                  {help.refs.map((ref) => (
                    <li key={ref}>{ref}</li>
                  ))}
                </ul>
                {'doc' in help && help.doc && (
                  <a className="btn btn-secondary admin-btn-sm" href={`/admin?doc=${encodeURIComponent(help.doc)}`} target="_blank" rel="noopener">
                    <BookOpenTextIcon size={14} weight="bold" aria-hidden="true" />
                    {labels.doc}
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
