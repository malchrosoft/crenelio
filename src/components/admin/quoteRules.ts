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
};

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
  const units: Record<QuoteLineKind, string> = { labour: hourly ? 'h' : 'forfait', service: 'forfait', travel: 'forfait', debours: 'u', supply: 'u' };
  const labels: Record<QuoteLineKind, string> = {
    labour: "Main-d'œuvre",
    service: '',
    travel: 'Frais de déplacement',
    debours: '',
    supply: '',
  };
  return {
    kind,
    label: labels[kind],
    quantity: 1,
    unit: units[kind],
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
