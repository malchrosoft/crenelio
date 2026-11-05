/**
 * Langues de l'Espace Artisan (Item 40) : documentation traduite aujourd'hui, interface complète plus tard.
 * Le français fait foi. `dir` : sens d'écriture (l'arabe s'écrit de droite à gauche).
 * Préférence enregistrée par `/admin/ui-state/language` (pas une donnée personnelle).
 */
import { useEffect, useState } from 'react';
import { api } from '../api';

export interface Language {
  code: string;
  /** Nom de la langue dans la langue elle-même. */
  label: string;
  /** Nom en français, pour les écrans encore en français. */
  frenchLabel: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: Language[] = [
  { code: 'fr', label: 'Français', frenchLabel: 'Français', dir: 'ltr' },
  { code: 'en', label: 'English', frenchLabel: 'Anglais', dir: 'ltr' },
  { code: 'es', label: 'Español', frenchLabel: 'Espagnol', dir: 'ltr' },
  { code: 'pt', label: 'Português', frenchLabel: 'Portugais', dir: 'ltr' },
  { code: 'hy', label: 'Հայերեն', frenchLabel: 'Arménien', dir: 'ltr' },
  { code: 'it', label: 'Italiano', frenchLabel: 'Italien', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', frenchLabel: 'Allemand', dir: 'ltr' },
  { code: 'pl', label: 'Polski', frenchLabel: 'Polonais', dir: 'ltr' },
  { code: 'uk', label: 'Українська', frenchLabel: 'Ukrainien', dir: 'ltr' },
  { code: 'ru', label: 'Русский', frenchLabel: 'Russe', dir: 'ltr' },
  { code: 'tr', label: 'Türkçe', frenchLabel: 'Turc', dir: 'ltr' },
  { code: 'ro', label: 'Română', frenchLabel: 'Roumain', dir: 'ltr' },
  { code: 'gcf-gp', label: 'Kréyòl gwadloupéyen', frenchLabel: 'Créole guadeloupéen', dir: 'ltr' },
  { code: 'gcf-mq', label: 'Kréyòl matinik', frenchLabel: 'Créole martiniquais', dir: 'ltr' },
  // Variante régionale du français, pour le plaisir (le français fait foi)
  { code: 'fr-chti', label: "Ch'ti", frenchLabel: "Ch'ti", dir: 'ltr' },
  { code: 'ar', label: 'العربية', frenchLabel: 'Arabe', dir: 'rtl' },
];

export const DEFAULT_LANGUAGE = 'fr';

export const languageOf = (code: string): Language => LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];

const UI_STATE_ID = 'language';

/**
 * Langue préférée, partagée par tous les composants (une seule lecture de `/admin/ui-state/language`) :
 * un changement dans l'écran Compte se répercute aussitôt sur la documentation et l'aide « ? ».
 */
let current = DEFAULT_LANGUAGE;
let loading: Promise<void> | null = null;
const listeners = new Set<(code: string) => void>();

function publish(code: string) {
  current = code;
  listeners.forEach((listener) => listener(code));
}

/** Langue préférée de l'Espace Artisan (français tant qu'elle n'est pas chargée ou choisie). */
export function useLanguagePreference(): [string, (code: string) => Promise<void>] {
  const [language, setLanguage] = useState(current);
  useEffect(() => {
    listeners.add(setLanguage);
    loading ??= api
      .getUiState<{ code?: string }>(UI_STATE_ID)
      .then(({ state }) => {
        if (state?.code) publish(languageOf(state.code).code);
      })
      .catch(() => {
        loading = null;
      });
    setLanguage(current);
    return () => {
      listeners.delete(setLanguage);
    };
  }, []);
  const save = async (code: string) => {
    await api.saveUiState(UI_STATE_ID, { code });
    publish(code);
  };
  return [language, save];
}
