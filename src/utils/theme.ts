/**
 * Thème réglable depuis l'espace Pro (Item 2) : couleur principale, arrondis, effets.
 *
 * Les clés `theme_*` de la table `config` sont traduites en variable CSS (`--color-primary`) et en
 * attributs `data-*` sur <html>, lus par `src/styles/_theme.scss`. Le dernier thème appliqué est
 * mémorisé localement pour être posé avant le premier rendu (pas de flash de la couleur par défaut).
 */
import { AppConfig } from '../types';

export type ThemeRadius = 'none' | 'compact' | 'standard' | 'rounded';
export type ThemeBackground =
  | 'slate' | 'white' | 'ivory' | 'linen' | 'sand' | 'stone'
  | 'sage' | 'mint' | 'sky' | 'lavender' | 'blush' | 'peach' | 'tint';
export type ThemeButtons = 'standard' | 'rounded' | 'flat' | 'material' | 'relief';

export interface ThemeSettings {
  primary: string;
  radius: ThemeRadius;
  buttons: ThemeButtons;
  background: ThemeBackground;
  softShadows: boolean;
  glass: boolean;
  motion: boolean;
}

/** Couleur par défaut, identique à `$default-primary` (_variables.scss). */
export const DEFAULT_PRIMARY = '#2563eb';

/** Palette prête à l'emploi : toutes lisibles avec un texte blanc (contraste ≥ 4,5:1). */
export const THEME_PRESETS: { name: string; color: string }[] = [
  { name: 'Bleu', color: DEFAULT_PRIMARY },
  { name: 'Vert forêt', color: '#15803d' },
  { name: 'Bordeaux', color: '#9f1239' },
  { name: 'Ardoise', color: '#334155' },
  { name: 'Terracotta', color: '#c2410c' },
  { name: 'Violet', color: '#6d28d9' },
];

/** Fonds clairs (valeurs dans $background-presets, _variables.scss) ; « tint » suit la couleur principale. */
export const BACKGROUND_OPTIONS: { value: ThemeBackground; label: string }[] = [
  { value: 'slate', label: 'Gris bleuté' },
  { value: 'white', label: 'Blanc' },
  { value: 'ivory', label: 'Ivoire' },
  { value: 'linen', label: 'Lin' },
  { value: 'sand', label: 'Sable' },
  { value: 'stone', label: 'Pierre' },
  { value: 'sage', label: 'Sauge' },
  { value: 'mint', label: 'Menthe' },
  { value: 'sky', label: 'Ciel' },
  { value: 'lavender', label: 'Lavande' },
  { value: 'blush', label: 'Rose poudré' },
  { value: 'peach', label: 'Pêche' },
  { value: 'tint', label: 'Teinte de la couleur principale' },
];

export const BUTTON_OPTIONS: { value: ThemeButtons; label: string; hint: string }[] = [
  { value: 'standard', label: 'Standard', hint: 'Légère ombre, forme selon le réglage des arrondis' },
  { value: 'rounded', label: 'Pilule', hint: 'Tous les boutons entièrement arrondis' },
  { value: 'flat', label: 'Plat', hint: 'Sans ombre ni relief, forme selon le réglage des arrondis' },
  { value: 'material', label: 'Material', hint: 'Angles droits, texte en capitales, ombre qui s\'élève au survol' },
  { value: 'relief', label: 'Relief', hint: 'Dégradé brillant, effet 3D enfoncé au clic' },
];

export const RADIUS_OPTIONS: { value: ThemeRadius; label: string }[] = [
  { value: 'none', label: 'Sans arrondi' },
  { value: 'compact', label: 'Compact' },
  { value: 'standard', label: 'Standard' },
  { value: 'rounded', label: 'Arrondi' },
];

const STORAGE_KEY = 'crenelio.theme';
const HEX = /^#[0-9a-f]{6}$/i;

/** Lit le thème depuis la configuration, avec valeurs par défaut (aucun effet activé). */
export function themeFromConfig(config: AppConfig): ThemeSettings {
  const radius = config.theme_radius as ThemeRadius;
  const buttons = config.theme_buttons as ThemeButtons;
  const background = config.theme_background as ThemeBackground;
  return {
    primary: HEX.test(config.theme_primary ?? '') ? (config.theme_primary as string) : DEFAULT_PRIMARY,
    radius: RADIUS_OPTIONS.some((o) => o.value === radius) ? radius : 'standard',
    buttons: BUTTON_OPTIONS.some((o) => o.value === buttons) ? buttons : 'standard',
    background: BACKGROUND_OPTIONS.some((o) => o.value === background) ? background : 'slate',
    softShadows: config.theme_shadows === 'soft',
    glass: config.theme_glass === '1',
    motion: config.theme_motion === '1',
  };
}

/** Clés `config` correspondant à un thème (enregistrement depuis l'espace Pro). */
export function themeToConfig(theme: ThemeSettings): Record<string, string> {
  return {
    theme_primary: theme.primary.toLowerCase(),
    theme_radius: theme.radius,
    theme_buttons: theme.buttons,
    theme_background: theme.background,
    theme_shadows: theme.softShadows ? 'soft' : 'standard',
    theme_glass: theme.glass ? '1' : '0',
    theme_motion: theme.motion ? '1' : '0',
  };
}

/** Applique un thème au document (aperçu en direct compris) et le mémorise localement. */
export function applyTheme(theme: ThemeSettings, remember = true): void {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primary);
  root.dataset.radius = theme.radius;
  root.dataset.buttons = theme.buttons;
  root.dataset.background = theme.background;
  root.dataset.shadows = theme.softShadows ? 'soft' : 'standard';
  root.dataset.glass = theme.glass ? 'on' : 'off';
  root.dataset.motion = theme.motion ? 'on' : 'off';
  if (remember) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    } catch {
      // Stockage indisponible (navigation privée) : le thème sera simplement réappliqué au chargement
    }
  }
}

/** Réapplique le dernier thème connu, avant le premier rendu (src/main.tsx). */
export function applyRememberedTheme(): void {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as ThemeSettings | null;
    // Thème mémorisé par une version antérieure : complété par les valeurs par défaut
    if (saved && HEX.test(saved.primary)) applyTheme({ ...themeFromConfig({}), ...saved }, false);
  } catch {
    // Valeur illisible : on garde le thème par défaut
  }
}

/** Contraste WCAG entre la couleur et le blanc (texte des boutons). 4,5:1 minimum conseillé. */
export function contrastWithWhite(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
  return 1.05 / (luminance + 0.05);
}
