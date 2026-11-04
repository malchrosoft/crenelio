import React, { useEffect, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';
import { ArrowLeftIcon, BookOpenTextIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import { DocsSearchResult, fold, queryTerms, searchDocs } from '../../utils/docsSearch';

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

let allDocs: Promise<Record<string, string>> | null = null;
/** Toutes les fiches, chargées une seule fois (première recherche). */
function loadAll(): Promise<Record<string, string>> {
  allDocs ??= Promise.all(
    Object.entries(FILES).map(async ([key, load]) => [key.slice(ROOT.length), await load()] as const),
  ).then(Object.fromEntries);
  return allDocs;
}

/** Surligne les termes dans le contenu rendu et fait défiler jusqu'à la première occurrence. */
function highlight(container: HTMLElement, terms: string[]) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const text = node.data;
    const folded = fold(text);
    const ranges: [number, number][] = [];
    for (const term of terms) {
      for (let i = folded.indexOf(term); i !== -1; i = folded.indexOf(term, i + term.length)) ranges.push([i, i + term.length]);
    }
    if (ranges.length === 0) continue;
    ranges.sort((a, b) => a[0] - b[0]);
    const fragment = document.createDocumentFragment();
    let cursor = 0;
    for (const [from, to] of ranges) {
      if (from < cursor) continue;
      fragment.append(text.slice(cursor, from));
      const mark = document.createElement('mark');
      mark.className = 'docs-viewer__hit';
      mark.textContent = text.slice(from, to);
      fragment.append(mark);
      cursor = to;
    }
    fragment.append(text.slice(cursor));
    node.replaceWith(fragment);
  }
  container.querySelector('.docs-viewer__hit')?.scrollIntoView({ block: 'center' });
}

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
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DocsSearchResult[] | null>(null);
  /** Termes à surligner dans la fiche ouverte depuis un résultat. */
  const [hits, setHits] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (queryTerms(query).length === 0) {
      setResults(null);
      return;
    }
    let current = true;
    const timer = window.setTimeout(() => {
      loadAll().then((docs) => current && setResults(searchDocs(docs, query)));
    }, 200);
    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  const html = useMemo(() => (markdown === null ? '' : (marked.parse(markdown, { async: false }) as string)), [markdown]);

  useEffect(() => {
    if (contentRef.current && hits.length > 0) highlight(contentRef.current, hits);
  }, [html, hits]);

  useEffect(() => {
    setMarkdown(null);
    const load = FILES[ROOT + path];
    if (load) load().then(setMarkdown);
    else setMarkdown(`Fiche introuvable : \`${path}\``);
  }, [path]);


  function open(next: string, terms: string[] = []) {
    setHistory((prev) => [...prev, path]);
    setPath(next);
    setHits(terms);
  }

  function openResult(result: DocsSearchResult) {
    open(result.path, queryTerms(query));
    setQuery('');
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
              setHits([]);
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
        <label className="docs-viewer__search">
          <MagnifyingGlassIcon size={16} weight="bold" aria-hidden="true" />
          <input
            type="text"
            className="form-input form-input--compact"
            placeholder="Rechercher dans la documentation"
            aria-label="Rechercher dans la documentation"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" className="data-grid__icon-btn" title="Effacer la recherche" onClick={() => setQuery('')}>
              <XIcon size={14} weight="bold" aria-hidden="true" />
            </button>
          )}
        </label>
      </div>
      {results !== null ? (
        <div className="docs-viewer__results" aria-live="polite">
          <p className="form-hint">
            {results.length === 0 ? 'Aucune fiche ne contient ces mots.' : `${results.length} fiche${results.length > 1 ? 's' : ''} trouvée${results.length > 1 ? 's' : ''}`}
          </p>
          <ul>
            {results.map((result) => (
              <li key={result.path}>
                <button type="button" className="docs-viewer__result" onClick={() => openResult(result)}>
                  <span className="docs-viewer__result-title">{result.title}</span>
                  <span className="docs-viewer__result-meta">
                    docs/legal/{result.path} · {result.count} occurrence{result.count > 1 ? 's' : ''}
                  </span>
                  <span className="docs-viewer__result-excerpt">
                    {result.excerpt.map((part, i) => (part.match ? <mark key={i}>{part.text}</mark> : <React.Fragment key={i}>{part.text}</React.Fragment>))}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : markdown === null ? (
        <p>Chargement…</p>
      ) : (
        // Contenu Markdown du dépôt (fiches versionnées), jamais une saisie utilisateur
        <div ref={contentRef} className="docs-viewer__content" onClick={handleClick} dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </div>
  );
};

export default DocsViewer;
