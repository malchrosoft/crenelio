import { AppConfig } from '../types';

/** Type de saisie d'un paramètre de configuration. */
export type ConfigFieldType = 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'url';

export interface ConfigField {
  key: string;
  label: string;
  type: ConfigFieldType;
  unit?: string;
  step?: string;
  hint?: string;
}

export interface ConfigGroup {
  id: string;
  title: string;
  intro?: string;
  fields: ConfigField[];
}

/**
 * Groupes de paramètres décrits explicitement (libellé, type, unité).
 * Toute clé présente en base mais absente d'ici reste éditable via le groupe « Autres paramètres ».
 */
export const CONFIG_GROUPS: ConfigGroup[] = [
  {
    id: 'identity',
    title: "Identité de l'entreprise",
    intro: 'Nom, logo et favicon affichés sur la vitrine, le tunnel de réservation et les onglets du navigateur.',
    fields: [{ key: 'company_name', label: "Nom de l'entreprise", type: 'text' }],
  },
  {
    id: 'contact',
    title: 'Coordonnées',
    intro: 'Informations affichées sur la vitrine, dans les emails et sur la fiche de confirmation.',
    fields: [
      { key: 'pro_name', label: "Nom de l'artisan", type: 'text' },
      { key: 'pro_email', label: 'Email de contact', type: 'email', hint: 'Reçoit les fiches intervention.' },
      { key: 'pro_phone', label: 'Téléphone', type: 'tel' },
      { key: 'service_area', label: 'Zone couverte (texte affiché)', type: 'text' },
    ],
  },
  {
    id: 'booking',
    title: 'Réservation & créneaux',
    fields: [
      { key: 'slot_step_minutes', label: 'Graduation des créneaux', type: 'number', unit: 'min' },
      { key: 'buffer_minutes', label: 'Temps de trajet entre deux interventions', type: 'number', unit: 'min' },
      { key: 'min_notice_hours', label: 'Délai minimal de réservation', type: 'number', unit: 'h' },
      { key: 'max_advance_days', label: 'Réservation possible jusqu’à', type: 'number', unit: 'jours' },
    ],
  },
  {
    id: 'map',
    title: 'Carte & point de départ',
    intro: 'Centre de la carte de la vitrine et origine du calcul des distances de déplacement.',
    fields: [
      { key: 'default_latitude', label: 'Latitude', type: 'number', step: 'any' },
      { key: 'default_longitude', label: 'Longitude', type: 'number', step: 'any' },
      { key: 'default_zoom', label: 'Niveau de zoom', type: 'number', step: '1' },
    ],
  },
];

/** Clés gérées ailleurs (« Zone & déplacement », fichiers de branding) ou jamais éditables. */
const EXCLUDED_KEY = /^(travel_|admin_password|branding_)/;

const DESCRIBED_KEYS = new Set(CONFIG_GROUPS.flatMap((group) => group.fields.map((f) => f.key)));

/** Groupe construit à partir des clés en base non décrites dans `CONFIG_GROUPS`. */
export function buildOtherGroup(config: AppConfig): ConfigGroup | null {
  const fields = Object.keys(config)
    .filter((key) => !DESCRIBED_KEYS.has(key) && !EXCLUDED_KEY.test(key))
    .sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }))
    .map((key): ConfigField => ({ key, label: key, type: 'text' }));

  return fields.length ? { id: 'other', title: 'Autres paramètres', fields } : null;
}
