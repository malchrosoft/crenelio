import React, { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';
import { ArrowLeftIcon, BookOpenTextIcon } from '@phosphor-icons/react';

/**
 * Documentation de l'artisan (Item 40) : fiches Markdown de `docs/legal/`, embarquées dans le bundle
 * (aucun service tiers, aucun stockage serveur) et chargées à la demande. Liens entre fiches suivis
 * dans l'écran ; liens externes ouverts dans un nouvel onglet. Contenu versionné du dépôt (de confiance).
 */
const FILES = import.meta.glob('../../../docs/legal/**/*.md', { query: '?raw', import: 'default' }) as Record<
  string,
  () => Promise<string>
>;

const ROOT = '../../../docs/legal/';
/** Chemin d'une fiche relatif à `docs/legal/` (ex. `fr/debours.md`) ; l'index est `README.md`. */
export const DOCS_INDEX = 'README.md';

/** Résout un lien relatif d'une fiche (`../sources.md`, `debours.md#mandat`) depuis la fiche courante. */
function resolve(from: string, href: string): string {
  const parts = from.split('/').slice(0, -1);
  for (const segment of href.split('#')[0].split('/')) {
    if (segment === '..') parts.pop();
    else if (segment && segment !== '.') parts.push(segment);
  }
  return parts.join('/');
}

interface DocsViewerProps {
  /** Fiche à ouvrir (relative à `docs/legal/`). */
  initialPath?: string | null;
}

const DocsViewer: React.FC<DocsViewerProps> = ({ initialPath }) => {
  const [path, setPath] = useState(initialPath && FILES[ROOT + initialPath] ? initialPath : DOCS_INDEX);
  const [history, setHistory] = useState<string[]>([]);
  const [markdown, setMarkdown] = useState<string | null>(null);

  useEffect(() => {
    setMarkdown(null);
    const load = FILES[ROOT + path];
    if (load) load().then(setMarkdown);
    else setMarkdown(`Fiche introuvable : \`${path}\``);
  }, [path]);

  const html = useMemo(() => (markdown === null ? '' : (marked.parse(markdown, { async: false }) as string)), [markdown]);

  function open(next: string) {
    setHistory((prev) => [...prev, path]);
    setPath(next);
  }

  /** Liens : fiche interne suivie ici, lien externe dans un nouvel onglet. */
  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const link = (e.target as HTMLElement).closest('a');
    const href = link?.getAttribute('href');
    if (!link || !href) return;
    if (/^https?:/.test(href)) {
      link.target = '_blank';
      link.rel = 'noopener';
      return;
    }
    if (href.split('#')[0].endsWith('.md')) {
      e.preventDefault();
      const target = resolve(path, href);
      if (FILES[ROOT + target]) open(target);
    }
  }

  return (
    <div className="docs-viewer">
      <div className="docs-viewer__toolbar">
        {history.length > 0 && (
          <button
            type="button"
            className="btn btn-secondary admin-btn-sm"
            onClick={() => {
              setPath(history[history.length - 1]);
              setHistory((prev) => prev.slice(0, -1));
            }}
          >
            <ArrowLeftIcon size={14} weight="bold" aria-hidden="true" />
            Retour
          </button>
        )}
        {path !== DOCS_INDEX && (
          <button type="button" className="btn btn-secondary admin-btn-sm" onClick={() => open(DOCS_INDEX)}>
            <BookOpenTextIcon size={14} weight="bold" aria-hidden="true" />
            Sommaire
          </button>
        )}
        <span className="docs-viewer__path">docs/legal/{path}</span>
      </div>
      {markdown === null ? (
        <p>Chargement…</p>
      ) : (
        // Contenu Markdown du dépôt (fiches versionnées), jamais une saisie utilisateur
        <div className="docs-viewer__content" onClick={handleClick} dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </div>
  );
};

export default DocsViewer;
