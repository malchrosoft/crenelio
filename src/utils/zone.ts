import { AppConfig } from '../types';

/** Vrai si l'artisan ne se déplace pas : les rendez-vous ont lieu dans ses locaux. */
export const isPremisesOnly = (config: AppConfig) => config.travel_mode === 'premises';

/** Adresse des locaux sur une ligne, vide si non renseignée. */
export function premisesLabel(config: AppConfig): string {
  const cityLine = [config.premises_postal_code, config.premises_city].filter(Boolean).join(' ');
  return [config.premises_address, cityLine].filter(Boolean).join(', ');
}

/** Adresse de l'entreprise en lignes (rue, puis code postal et ville), pour un affichage postal. */
export function premisesLines(config: AppConfig): string[] {
  const cityLine = [config.premises_postal_code, config.premises_city].filter(Boolean).join(' ');
  return [config.premises_address, cityLine].filter((line): line is string => Boolean(line?.trim()));
}

/**
 * Découpe une adresse saisie librement en lignes postales : une ligne par ligne saisie ; si tout
 * tient sur une ligne, découpage aux virgules (« OVH SAS, 2 rue Kellermann, 59100 Roubaix »).
 */
export function postalLines(text: string | null | undefined): string[] {
  const lines = (text ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
  return lines.length === 1 ? lines[0].split(',').map((l) => l.trim()).filter(Boolean) : lines;
}

/** Siège social en lignes : adresse dédiée, sinon celle de l'entreprise. */
export function legalAddressLines(config: AppConfig): string[] {
  const legal = postalLines(config.legal_adresse);
  return legal.length ? legal : premisesLines(config);
}

/** Position de l'adresse de l'entreprise, null si elle n'a pas été choisie dans les suggestions. */
export function premisesPosition(config: AppConfig): [number, number] | null {
  const lat = parseFloat(config.premises_latitude ?? '');
  const lon = parseFloat(config.premises_longitude ?? '');
  return isNaN(lat) || isNaN(lon) ? null : [lat, lon];
}

/** Géocodage d'une adresse libre (Base Adresse Nationale), null si introuvable. */
export async function geocode(address: string): Promise<[number, number] | null> {
  const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`);
  if (!res.ok) return null;
  const data: { features?: { geometry: { coordinates: [number, number] } }[] } = await res.json();
  const coordinates = data.features?.[0]?.geometry.coordinates;
  return coordinates ? [coordinates[1], coordinates[0]] : null;
}
