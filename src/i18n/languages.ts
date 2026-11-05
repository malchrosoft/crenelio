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

/** Langue préférée de l'Espace Artisan (français tant qu'elle n'est pas chargée ou choisie). */
export function useLanguagePreference(): [string, (code: string) => Promise<void>] {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  useEffect(() => {
    api
      .getUiState<{ code?: string }>(UI_STATE_ID)
      .then(({ state }) => state?.code && setLanguage(languageOf(state.code).code))
      .catch(() => undefined);
  }, []);
  const save = async (code: string) => {
    await api.saveUiState(UI_STATE_ID, { code });
    setLanguage(code);
  };
  return [language, save];
}
