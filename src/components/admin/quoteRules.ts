/**
 * Règles des devis partagées par la grille et l'éditeur (Item 22) : libellés, valeurs par défaut des
 * lignes et totaux, calculés comme `Quote::totals` côté serveur (qui fait foi).
 * Cadre légal : docs/legal/ (devis, débours, achat-revente, rétractation).
 */
import { AppConfig, QuoteLine, QuoteLineKind, QuoteStatus } from '../../types';

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  accepted: 'Accepté',
  refused: 'Refusé',
  expired: 'Expiré',
  withdrawn: 'Rétracté',
};

export const LINE_KIND_LABELS: Record<QuoteLineKind, string> = {
  labour: "Main-d'œuvre",
  service: 'Forfait',
  travel: 'Déplacement',
  debours: 'Pièce au nom du client (débours)',
  supply: 'Fourniture revendue',
  discount: 'Remise',
};

/**
 * Désignation par défaut d'un type de ligne : main-d'œuvre, déplacement et remise n'attendent pas de
 * désignation (le complément saisi s'y ajoute). Identique à `Quote::DEFAULT_LABELS`.
 */
export const DEFAULT_LINE_LABELS: Partial<Record<QuoteLineKind, string>> = {
  labour: "Main-d'œuvre",
  travel: 'Frais de déplacement',
  discount: 'Remise exceptionnelle',
};

/** Unités proposées pour une pièce ou une fourniture ; les autres types ont une unité fixe. */
export const PART_UNITS = ['u', 'lot', 'm', 'm²', 'm³', 'kg', 'l'];

/** Unité fixe d'un type de ligne (null : choisie dans `PART_UNITS`). */
export function fixedUnit(kind: QuoteLineKind, config: AppConfig): string | null {
  if (kind === 'debours' || kind === 'supply') return null;
  return kind === 'labour' && isHourly(config) ? 'h' : 'forfait';
}

/**
 * Calcul saisi dans un champ numérique (« 120/3 », « 2*45,5 », « (80+40)/2 ») : nombres, + - * / et
 * parenthèses seulement, virgule décimale admise. Résultat arrondi au centime ; null si illisible.
 */
export function evaluate(input: string | number): number | null {
  const text = String(input).replace(/\s+/g, '').replace(/,/g, '.');
  if (text === '' || !/^[\d.+\-*/()]+$/.test(text)) return null;
  let pos = 0;
  const peek = () => text[pos];
  const expr = (): number => {
    let value = term();
    while (peek() === '+' || peek() === '-') value = text[pos++] === '+' ? value + term() : value - term();
    return value;
  };
  const term = (): number => {
    let value = factor();
    while (peek() === '*' || peek() === '/') value = text[pos++] === '*' ? value * factor() : value / factor();
    return value;
  };
  const factor = (): number => {
    if (peek() === '-') return pos++, -factor();
    if (peek() === '(') {
      pos++;
      const value = expr();
      if (text[pos++] !== ')') throw new Error();
      return value;
    }
    const match = /^\d*\.?\d+|^\d+\./.exec(text.slice(pos));
    if (!match) throw new Error();
    pos += match[0].length;
    return Number(match[0]);
  };
  try {
    const value = expr();
    return pos === text.length && Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
  } catch {
    return null;
  }
}

/** Modalités de paiement usuelles, proposées dans le devis avec le réglage `quote_payment_terms`. */
export const PAYMENT_TERMS_OPTIONS = [
  'Paiement à réception de la facture, par virement, chèque ou espèces.',
  "Paiement sur place à la fin de l'intervention, par carte, chèque ou espèces.",
  "Acompte de 30 % à l'acceptation du devis, solde à réception de la facture.",
  'Paiement à 30 jours à compter de la date de la facture, par virement.',
];

/** Décomptes du temps proposés dans le devis : chaque pas d'arrondi (minimum réglé compris), et le temps exact. */
export function timeCountingOptions(config: AppConfig): string[] {
  const options = Object.keys(STEP_LABELS).map((step) => timeCountingText({ ...config, quote_time_counting: '', quote_labour_hourly: '1', quote_time_step: step }));
  return [...new Set([timeCountingText(config), ...options, EXACT_TIME_COUNTING].filter(Boolean))];
}

/**
 * Réglages d'arrondi propres à un devis : le pas dont le décompte choisi dans le devis est le texte,
 * sinon les réglages (décompte saisi librement).
 */
export function countingConfig(config: AppConfig, counting: string | null): AppConfig {
  const step = Object.keys(STEP_LABELS).find(
    (s) => timeCountingText({ ...config, quote_time_counting: '', quote_labour_hourly: '1', quote_time_step: s }) === counting,
  );
  return step ? { ...config, quote_time_step: step } : config;
}

/**
 * Doublons d'un devis : lignes de même type et de même désignation (casse et espaces ignorés). Le
 * déplacement est unique par intervention : deux lignes de déplacement sont des doublons quelle que soit
 * leur désignation (« Frais de déplacement » et « Frais de déplacement (0,62 km) »).
 */
export function duplicateGroups(lines: QuoteLine[]): number[][] {
  const groups = new Map<string, number[]>();
  lines.forEach((line, index) => {
    const key = line.kind === 'travel' ? 'travel' : `${line.kind}|${line.label.trim().toLowerCase().replace(/\s+/g, ' ')}`;
    groups.set(key, [...(groups.get(key) ?? []), index]);
  });
  return [...groups.values()].filter((group) => group.length > 1);
}

/**
 * Date ou délai d'exécution (L221-5 3°). Hors urgence, 15 jours par défaut : le délai de rétractation de
 * 14 jours (L221-18) est écoulé, l'exécution ne commence pas avant sauf demande expresse du client (L221-25).
 */
export const DEFAULT_EXECUTION_DAYS = 15;
export const executionDateText = (date: Date) => `Le ${date.toLocaleDateString('fr-FR')}`;
export const executionDelayText = (days: number) => `Sous ${days} jours à compter de l'acceptation du devis`;
export function parseExecution(text: string | null): { mode: 'date' | 'delay' | 'free'; date?: string; days?: number } {
  const date = /^Le (\d{2})\/(\d{2})\/(\d{4})$/.exec(text ?? '');
  if (date) return { mode: 'date', date: `${date[3]}-${date[2]}-${date[1]}` };
  const delay = /^Sous (\d+) jours à compter de l'acceptation du devis$/.exec(text ?? '');
  if (delay) return { mode: 'delay', days: Number(delay[1]) };
  return { mode: text ? 'free' : 'date' };
}

/** Taux de TVA proposés (`quote_vat_rates`), taux normal en premier. */
export function vatRates(config: AppConfig): number[] {
  return String(config.quote_vat_rates ?? '20,10,5.5')
    .split(',')
    .map((rate) => Number(rate.trim()))
    .filter((rate) => Number.isFinite(rate));
}

/** Main-d'œuvre facturée au temps passé × taux horaire (`quote_labour_hourly`, par défaut) ou au forfait. */
export const isHourly = (config: AppConfig) => config.quote_labour_hourly !== '0';

const STEP_LABELS: Record<string, string> = { '1': 'à la minute', '15': "par quart d'heure entamé", '30': 'par demi-heure entamée', '60': 'par heure entamée' };

/**
 * Modalités de décompte du temps (arrêté du 24 janvier 2017, art. 2) : texte saisi dans les réglages,
 * sinon déduit du pas d'arrondi et du minimum (« Temps décompté par quart d'heure entamé, 30 min minimum »).
 */
export function timeCountingText(config: AppConfig): string {
  if (config.quote_time_counting) return config.quote_time_counting;
  if (!isHourly(config)) return '';
  const minimum = Number(config.quote_time_minimum || 0);
  return `Temps décompté ${STEP_LABELS[config.quote_time_step ?? '15'] ?? STEP_LABELS['15']}${minimum > 0 ? `, ${minimum} min minimum` : ''}`;
}

/** Décompte d'un devis sans arrondi (case « Arrondir le temps » décochée). */
export const EXACT_TIME_COUNTING = 'Temps décompté à la minute, sans minimum';

/**
 * Durée saisie (« 1h20 », « 1:20 », « 80 min ») convertie en heures facturées : minimum puis arrondi au
 * pas réglé (`quote_time_step`, en minutes) ; `rounded` faux : temps exact à la minute, sans minimum (choix du devis). Un nombre seul est déjà en heures : renvoyé tel quel ; null si illisible.
 */
export function billedHours(input: string, config: AppConfig, rounded = true): number | null {
  const text = input.trim().toLowerCase().replace(',', '.');
  const match = text.match(/^(?:(\d+(?:\.\d+)?)\s*(?:h|:))?\s*(?:(\d+)\s*(?:min|mn|m)?)?$/);
  if (!match || !/[h:m]/.test(text)) return text !== '' && Number.isFinite(Number(text)) ? Number(text) : null;
  const minutes = Number(match[1] ?? 0) * 60 + Number(match[2] ?? 0);
  if (!(minutes > 0)) return null;
  const step = rounded ? Number(config.quote_time_step || 15) || 1 : 1;
  const counted = Math.ceil(Math.max(minutes, rounded ? Number(config.quote_time_minimum || 0) : 0) / step) * step;
  return Math.round((counted / 60) * 100) / 100;
}

/** Nouvelle ligne d'un type : unité usuelle, taux horaire réglé pour la main-d'œuvre, taux normal. */
export function newLine(kind: QuoteLineKind, config: AppConfig, vatMode: 'franchise' | 'vat'): QuoteLine {
  const hourly = isHourly(config);
  return {
    kind,
    label: '',
    quantity: 1,
    unit: fixedUnit(kind, config) ?? 'u',
    unit_price: kind === 'labour' && hourly ? Number(config.quote_labour_rate || 0) : 0,
    vat_rate: vatMode === 'vat' && kind !== 'debours' ? vatRates(config)[0] ?? 0 : 0,
  };
}

const round2 = (value: number) => Math.round(value * 100) / 100;

/** Montant d'une ligne (quantité × prix unitaire, arrondi au centime). */
export const lineAmount = (line: QuoteLine) => round2(Number(line.quantity) * Number(line.unit_price));

/**
 * Totaux. `ttc` : prestations seules ; les débours relèvent du mandat séparé (hors chiffre d'affaires,
 * sans TVA de l'artisan) et s'ajoutent seulement dans `estimated` (total estimé à régler).
 */
export function quoteTotals(lines: QuoteLine[], vatMode: 'franchise' | 'vat') {
  let ht = 0;
  let vat = 0;
  let debours = 0;
  for (const line of lines) {
    const amount = lineAmount(line);
    if (line.kind === 'debours') {
      debours += amount;
    } else {
      ht += amount;
      if (vatMode === 'vat') vat += round2((amount * Number(line.vat_rate)) / 100);
    }
  }
  const ttc = round2(ht + vat);
  return { ht: round2(ht), vat: round2(vat), ttc, debours: round2(debours), estimated: round2(ttc + debours) };
}

/**
 * TVA des fournitures revendues posées (BOI-TVA-BASE-10-20-40-20, § 140 et 150) : les pièces détachées
 * sont en principe vendues au taux qui leur est propre ; elles suivent le régime de la prestation si
 * leur valeur est inférieure à celle de la pose ou si elles ont été adaptées (ajustage, découpage,
 * soudure). Comparaison globale admise : pièces et fournitures n'excédant pas 50 % du coût total HT.
 * Indicatif : la comparaison se fait en principe pièce par pièce et l'adaptation n'est pas connue ici.
 * Null hors TVA ou sans fourniture revendue.
 */
export function supplyVatCheck(lines: QuoteLine[], vatMode: 'franchise' | 'vat') {
  const supply = lines.filter((line) => line.kind === 'supply');
  if (vatMode !== 'vat' || supply.length === 0) return null;
  const services = lines.filter((line) => line.kind !== 'supply' && line.kind !== 'debours');
  const supplyHt = supply.reduce((sum, line) => sum + lineAmount(line), 0);
  const totalHt = supplyHt + services.reduce((sum, line) => sum + lineAmount(line), 0);
  const share = totalHt > 0 ? Math.round((supplyHt / totalHt) * 100) : 100;
  const serviceRates = [...new Set(services.map((line) => Number(line.vat_rate)))];
  return {
    share,
    /** Pièces et fournitures ≤ 50 % du coût total : régime de la prestation. */
    followsService: share <= 50,
    /** Régime de la prestation, mais taux des pièces différent de celui de la prestation. */
    rateMismatch: share <= 50 && serviceRates.length === 1 && supply.some((line) => Number(line.vat_rate) !== serviceRates[0]),
  };
}

/** Montant en euros, zéro compris (« 0,00 € ») : un devis n'affiche jamais « Gratuit » pour un total. */
export const euro = (amount: number | string) => `${Number(amount).toFixed(2).replace('.', ',')} €`;
