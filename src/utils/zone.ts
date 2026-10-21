import { AppConfig } from '../types';

/** Vrai si l'artisan ne se déplace pas : les rendez-vous ont lieu dans ses locaux. */
export const isPremisesOnly = (config: AppConfig) => config.travel_mode === 'premises';

/** Adresse des locaux sur une ligne, vide si non renseignée. */
export function premisesLabel(config: AppConfig): string {
  const cityLine = [config.premises_postal_code, config.premises_city].filter(Boolean).join(' ');
  return [config.premises_address, cityLine].filter(Boolean).join(', ');
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
