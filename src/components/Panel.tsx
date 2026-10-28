import React from 'react';
import clsx from 'clsx';

interface PanelProps {
  title: React.ReactNode;
  /** Contrôles placés à droite du titre (sélecteur, bouton…). */
  actions?: React.ReactNode;
  className?: string;
  dir?: 'ltr' | 'rtl';
  children: React.ReactNode;
}

/**
 * Encart à en-tête : fond gris clair, en-tête légèrement plus soutenu, bordure et coins réguliers.
 * À réutiliser pour tout encart titré (crédits, récapitulatifs…).
 */
const Panel: React.FC<PanelProps> = ({ title, actions, className, dir, children }) => (
  <section className={clsx('panel', className)} dir={dir}>
    <header className="panel__header">
      <h3 className="panel__title">{title}</h3>
      {actions && (
        <div className="panel__actions" dir="ltr">
          {actions}
        </div>
      )}
    </header>
    <div className="panel__body">{children}</div>
  </section>
);

export default Panel;
