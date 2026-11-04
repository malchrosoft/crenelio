/**
 * Recherche textuelle dans la documentation (Item 40) : faite dans le navigateur, sur les fiches déjà
 * embarquées, sans service tiers. Insensible à la casse et aux accents ; tous les mots doivent figurer
 * dans la fiche. Résultats classés par nombre d'occurrences, titre en tête.
 */

export interface DocsSearchResult {
  path: string;
  title: string;
  /** Extrait autour de la première occurrence, découpé pour surligner les termes trouvés. */
  excerpt: { text: string; match: boolean }[];
  count: number;
}

/** Minuscules sans accents ; même longueur que le texte d'origine (positions conservées). */
export function fold(text: string): string {
  return Array.from(text, (char) => {
    const base = char.normalize('NFD').replace(/[̀-ͯ]/g, '');
    return (base.length === 1 ? base : char).toLowerCase();
  }).join('');
}

/** Mots de la requête (2 caractères au moins), repliés. */
export function queryTerms(query: string): string[] {
  return [...new Set(fold(query).split(/\s+/).filter((term) => term.length >= 2))];
}

/** Texte lisible d'une fiche Markdown : sans balisage de titres, d'emphase, de citations ni de liens. */
function plain(markdown: string): string {
  return markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^[>#\s|*-]+/gm, '')
    .replace(/[*_`|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const EXCERPT = 90;

function excerpt(text: string, folded: string, terms: string[], at: number): DocsSearchResult['excerpt'] {
  const start = Math.max(0, at - EXCERPT);
  const end = Math.min(text.length, at + EXCERPT * 2);
  const slice = text.slice(start, end);
  const foldedSlice = folded.slice(start, end);
  const marks: [number, number][] = [];
  for (const term of terms) {
    for (let i = foldedSlice.indexOf(term); i !== -1; i = foldedSlice.indexOf(term, i + term.length)) {
      marks.push([i, i + term.length]);
    }
  }
  marks.sort((a, b) => a[0] - b[0]);
  const parts: DocsSearchResult['excerpt'] = [{ text: start > 0 ? '…' : '', match: false }];
  let cursor = 0;
  for (const [from, to] of marks) {
    if (from < cursor) continue;
    parts.push({ text: slice.slice(cursor, from), match: false }, { text: slice.slice(from, to), match: true });
    cursor = to;
  }
  parts.push({ text: slice.slice(cursor) + (end < text.length ? '…' : ''), match: false });
  return parts.filter((part) => part.text);
}

export function searchDocs(docs: Record<string, string>, query: string): DocsSearchResult[] {
  const terms = queryTerms(query);
  if (terms.length === 0) return [];
  const results: (DocsSearchResult & { inTitle: boolean })[] = [];
  for (const [path, markdown] of Object.entries(docs)) {
    const title = /^#\s+(.+)$/m.exec(markdown)?.[1].trim() ?? path;
    const text = plain(markdown);
    const folded = fold(text);
    if (!terms.every((term) => folded.includes(term))) continue;
    const count = terms.reduce((sum, term) => sum + folded.split(term).length - 1, 0);
    const first = Math.min(...terms.map((term) => folded.indexOf(term)));
    const foldedTitle = fold(title);
    results.push({
      path,
      title,
      excerpt: excerpt(text, folded, terms, first),
      count,
      inTitle: terms.some((term) => foldedTitle.includes(term)),
    });
  }
  return results
    .sort((a, b) => Number(b.inTitle) - Number(a.inTitle) || b.count - a.count)
    .map(({ inTitle: _inTitle, ...result }) => result);
}
