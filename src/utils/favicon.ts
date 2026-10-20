/** URL servant le favicon personnalisé, ou l'icône par défaut si aucun fichier n'est présent. */
const DEFAULT_FAVICON_URL = '/api/branding/favicon';

/** Met à jour l'icône de l'onglet (l'URL versionnée contourne le cache après remplacement). */
export function applyFavicon(url: string | null | undefined): void {
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (link) link.href = url ?? `${DEFAULT_FAVICON_URL}?v=${Date.now()}`;
}
