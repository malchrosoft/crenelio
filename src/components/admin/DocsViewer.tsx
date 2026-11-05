import React, { useEffect, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';
import { ArrowLeftIcon, BookOpenTextIcon, MagnifyingGlassIcon, TranslateIcon, XIcon } from '@phosphor-icons/react';
import { DocsSearchResult, fold, queryTerms, searchDocs } from '../../utils/docsSearch';
import { DEFAULT_LANGUAGE, LANGUAGES, languageOf, useLanguagePreference } from '../../i18n/languages';

/**
 * Documentation de l'artisan (Item 40) : fiches Markdown de `docs/legal/`, embarquées dans le bundle
 * (aucun service tiers, aucun stockage serveur) et chargées à la demande. Liens entre fiches suivis
 * dans l'écran ; liens externes ouverts dans un nouvel onglet. Contenu versionné du dépôt (de confiance).
 *
 * Traductions : `docs/legal/<langue>/` reprend les noms des fiches de `fr/` (et `README.md` pour le
 * sommaire). L'écran raisonne sur le chemin français (« canonique ») et affiche la traduction de la
 * langue choisie si elle existe, sinon le français ; les textes officiels (`fr/textes/`) restent en
 * français. Langue par défaut : préférence de l'écran Compte ; sélecteur pour changer en lecture.
 */
const FILES = import.meta.glob('../../../docs/legal/**/*.md', { query: '?raw', import: 'default' }) as Record<
  string,
  () => Promise<string>
>;

const ROOT = '../../../docs/legal/';
/** Chemin d'une fiche relatif à `docs/legal/` (ex. `fr/debours.md`) ; l'index est `README.md`. */
export const DOCS_INDEX = 'README.md';

const TRANSLATIONS = LANGUAGES.map((l) => l.code).filter((code) => code !== DEFAULT_LANGUAGE);
const translationOf = (path: string) => (TRANSLATIONS.includes(path.split('/')[0]) ? path.split('/')[0] : null);

/** Langues disposant d'une documentation traduite (sommaire présent). */
const DOC_LANGUAGES = LANGUAGES.filter((l) => l.code === DEFAULT_LANGUAGE || FILES[`${ROOT}${l.code}/README.md`]);

/** Fiche à afficher pour un chemin canonique : traduction si elle existe, sinon français. */
function localize(path: string, lang: string): string {
  if (lang === DEFAULT_LANGUAGE || path.startsWith('fr/textes/')) return path;
  const candidate = path === DOCS_INDEX ? `${lang}/README.md` : path.startsWith('fr/') ? `${lang}/${path.slice(3)}` : null;
  return candidate && FILES[ROOT + candidate] ? candidate : path;
}

/** Chemin canonique (français) d'une fiche, traduite ou non. */
function canonical(path: string): string {
  const lang = translationOf(path);
  if (!lang) return path;
  const rest = path.slice(lang.length + 1);
  return rest === 'README.md' ? DOCS_INDEX : `fr/${rest}`;
}

let allDocs: Promise<Record<string, string>> | null = null;
/** Toutes les fiches, chargées une seule fois (première recherche). */
function loadAll(): Promise<Record<string, string>> {
  allDocs ??= Promise.all(
    Object.entries(FILES).map(async ([key, load]) => [key.slice(ROOT.length), await load()] as const),
  ).then(Object.fromEntries);
  return allDocs;
}

/**
 * Textes officiels cités (citations Markdown) présentés comme sur Légifrance, sans toucher au texte :
 * titre ou numéro d'article isolé en gras, mention de version en petit, « NOTA » en intertitre, un alinéa par point, sous-points a), b) en retrait.
 */
const LAW_META = /^(Modifié par|Modifiés par|Création|Créé par|Version en vigueur|En vigueur|Abrogé par|Transféré par|Rectifié par)\b/;
const LAW_ITEM = /^(\d+° |[IVX]+\s?\.\s?-)/;
const LAW_SUBITEM = /^[a-h]\) /;
/** Titre seul sur sa ligne : « Article 4 », « Annexe 1 », numéro de paragraphe du BOFiP (« 140 »). */
const LAW_TITLE = /^(Article|Annexe)\s+\S+$|^\d{1,4}$/;

function styleOfficialTexts(container: HTMLElement) {
  for (const p of container.querySelectorAll<HTMLParagraphElement>('blockquote p')) {
    const text = p.textContent?.trim() ?? '';
    if (LAW_TITLE.test(text)) p.classList.add('law-title');
    else if (LAW_META.test(text) && text.length < 240) p.classList.add('law-meta');
    else if (/^NOTA\s*:?$/.test(text)) p.classList.add('law-note');
    else if (LAW_ITEM.test(text)) p.classList.add('law-item');
    else if (LAW_SUBITEM.test(text)) p.classList.add('law-item', 'law-item--sub');
  }
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
  const [preferred] = useLanguagePreference();
  /** Langue de lecture : la préférence, sauf choix dans le sélecteur (non enregistré). */
  const [chosen, setChosen] = useState<string | null>(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    return fromUrl && DOC_LANGUAGES.some((l) => l.code === fromUrl) ? fromUrl : null;
  });
  const lang = DOC_LANGUAGES.some((l) => l.code === (chosen ?? preferred)) ? (chosen ?? preferred) : DEFAULT_LANGUAGE;
  /** Chemin canonique (français) de la fiche ouverte. */
  const [path, setPath] = useState(initialPath && FILES[ROOT + initialPath] ? canonical(initialPath) : DOCS_INDEX);
  const shown = localize(path, lang);
  const shownLang = translationOf(shown) ?? DEFAULT_LANGUAGE;
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
      loadAll().then((docs) => {
        if (!current) return;
        // Une version par fiche, dans la langue de lecture (repli sur le français), indexée par chemin canonique
        const set: Record<string, string> = {};
        for (const key of Object.keys(docs).filter((key) => !translationOf(key))) set[key] = docs[localize(key, lang)];
        setResults(searchDocs(set, query));
      });
    }, 200);
    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [query, lang]);

  // Adresse tenue à jour : `doc` (fiche, chemin français) et `lang` (langue choisie dans le sélecteur) ;
  // un rechargement ou un lien copié rouvre la même fiche dans la même langue. Retirés en quittant l'écran.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('doc', path);
    if (chosen) url.searchParams.set('lang', chosen);
    else url.searchParams.delete('lang');
    window.history.replaceState(window.history.state, '', url);
  }, [path, chosen]);

  useEffect(
    () => () => {
      const url = new URL(window.location.href);
      url.searchParams.delete('doc');
      url.searchParams.delete('lang');
      window.history.replaceState(window.history.state, '', url);
    },
    [],
  );

  const html = useMemo(() => (markdown === null ? '' : (marked.parse(markdown, { async: false }) as string)), [markdown]);

  useEffect(() => {
    if (!contentRef.current) return;
    styleOfficialTexts(contentRef.current);
    if (hits.length > 0) highlight(contentRef.current, hits);
  }, [html, hits]);

  useEffect(() => {
    setMarkdown(null);
    const load = FILES[ROOT + shown];
    if (load) load().then(setMarkdown);
    else setMarkdown(`Fiche introuvable : \`${shown}\``);
  }, [shown]);


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
      const target = resolve(shown, href);
      if (FILES[ROOT + target]) open(canonical(target));
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
        <span className="docs-viewer__path">docs/legal/{shown}</span>
        {DOC_LANGUAGES.length > 1 && (
          <label className="docs-viewer__language" title="Langue de la documentation">
            <TranslateIcon size={18} weight="fill" aria-hidden="true" />
            <select
              className="form-input form-input--compact"
              aria-label="Langue de la documentation"
              value={lang}
              onChange={(e) => setChosen(e.target.value)}
            >
              {DOC_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        )}
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
                    docs/legal/{localize(result.path, lang)} · {result.count} occurrence{result.count > 1 ? 's' : ''}
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
        <>
          {shownLang !== lang && !path.startsWith('fr/textes/') && (
            <p className="docs-viewer__fallback">Cette fiche n'est pas encore traduite : version française.</p>
          )}
          {/* Contenu Markdown du dépôt (fiches versionnées), jamais une saisie utilisateur */}
          <div
            ref={contentRef}
            className="docs-viewer__content"
            lang={shownLang}
            dir={languageOf(shownLang).dir}
            onClick={handleClick}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </>
      )}
    </div>
  );
};

export default DocsViewer;
