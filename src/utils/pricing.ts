/**
 * Information du public sur les prix (Item 22, écart 7) : arrêté du 24 janvier 2017, art. 2 et 3
 * (taux horaire TTC, décompte du temps, forfaits, déplacement, devis gratuit ou payant, accessibles sur
 * l'espace en ligne du professionnel) et arrêté du 3 décembre 1987, art. 1 (somme TTC effectivement
 * payée), 3 (ce que le prix ne comprend pas) et 14 (prix précis avant une commande à distance).
 * Textes : docs/legal/fr/textes/arretes.md.
 */
import { AppConfig, Service } from '../types';
import { vatRates } from '../components/admin/quoteRules';

const amount = (value: number) => `${value.toFixed(2).replace('.', ',')} €`;

/** Prix TTC affiché au public (« 59,00 € TTC »). */
export function formatTtc(value: number): string {
  return `${amount(Number.isFinite(value) ? Math.max(value, 0) : 0)} TTC`;
}

/** Montant d'une réservation : « Gratuit » si nul, sinon TTC. */
export function publicAmount(value: number): string {
  return value > 0 ? formatTtc(value) : 'Gratuit';
}

/** Prix d'une prestation : TTC précis, ou « Sur devis » si aucun prix n'est fixé. */
export function servicePrice(price: number | string): string {
  const value = Number(price);
  return value > 0 ? formatTtc(value) : 'Sur devis';
}

const isVat = (config: AppConfig) => config.quote_vat_mode === 'vat';

/** Mention de TVA accompagnant les prix : franchise (CGI 293 E) ou taux normal appliqué. */
export function vatNote(config: AppConfig): string {
  if (!isVat(config)) {
    return config.quote_vat_exemption || 'TVA non applicable, article 293 B du CGI';
  }
  const rate = vatRates(config)[0];
  return rate ? `Prix TVA comprise (${String(rate).replace('.', ',')} %).` : 'Prix TVA comprise.';
}

/** Taux horaire de main-d'œuvre TTC (réglé HT pour les devis), null s'il n'est pas renseigné. */
export function labourRateTtc(config: AppConfig): number | null {
  const ht = Number(config.quote_labour_rate || 0);
  if (!(ht > 0) || config.quote_labour_hourly === '0') return null;
  const rate = isVat(config) ? vatRates(config)[0] ?? 0 : 0;
  return Math.round(ht * (1 + rate / 100) * 100) / 100;
}

/** Coût d'établissement d'un devis : « Devis gratuit » ou « Devis payant : 30,00 € TTC ». */
export function quoteCostLabel(config: AppConfig): string {
  const price = Number(config.quote_default_price || 0);
  return price > 0 ? `Devis payant : ${formatTtc(price)}` : 'Devis gratuit';
}

/** Paliers kilométriques des frais de déplacement (« Jusqu'à 15 km : gratuit »…). */
export function travelTiers(config: AppConfig): string[] {
  let from = 0;
  const rows: string[] = [];
  for (const n of [1, 2, 3]) {
    const max = Number(config[`travel_tier_${n}_max_km`] || 0);
    if (!(max > from)) continue;
    const fee = Number(config[`travel_tier_${n}_fee`] || 0);
    rows.push(`${from === 0 ? "Jusqu'à" : `De ${from} à`} ${max} km : ${fee > 0 ? formatTtc(fee) : 'gratuit'}`);
    from = max;
  }
  return rows;
}

/** Frais de déplacement d'une prestation, pour la vitrine. */
export function serviceTravel(service: Service): string | null {
  if (service.travel_fee_mode === 'fixed') return `Déplacement ${formatTtc(Number(service.travel_fee_amount))}`;
  if (service.travel_fee_mode === 'distance_tiers') return 'Déplacement selon distance';
  return null;
}
