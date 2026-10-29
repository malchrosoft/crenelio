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
      { key: 'pro_phone', label: 'Téléphone', type: 'tel' },
      { key: 'service_area', label: 'Zone couverte (texte affiché)', type: 'text' },
    ],
  },
  {
    id: 'vitrine',
    title: 'Page vitrine',
    intro: 'Textes de présentation de la page d’accueil. Les engagements se gèrent juste en dessous.',
    fields: [
      { key: 'vitrine_tagline', label: 'Accroche', type: 'text', hint: 'Sous le nom, en haut de page et dans le pied de page.' },
      { key: 'vitrine_about', label: 'Présentation', type: 'textarea', hint: 'Section « À propos ».' },
      { key: 'vitrine_photo_url', label: 'Photo (URL)', type: 'url', hint: 'Illustration de la section « À propos ». Vide : aucune photo.' },
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
    title: 'Carte de la vitrine',
    intro: "Zoom initial de la carte (avant cadrage sur les communes). Le point de départ se règle dans « Zone & déplacement ».",
    fields: [
      { key: 'default_zoom', label: 'Niveau de zoom', type: 'number', step: '1' },
    ],
  },
  {
    id: 'legal',
    title: 'Mentions légales',
    intro: 'Affichées dans la fenêtre « Mentions légales » du pied de page. Les rubriques vides sont masquées.',
    fields: [
      { key: 'legal_raison_sociale', label: 'Raison sociale', type: 'text' },
      {
        key: 'legal_adresse',
        label: 'Adresse du siège social',
        type: 'textarea',
        hint: "Vide : l'adresse de l'entreprise (menu « Déplacement ») est utilisée. À renseigner seulement si le siège est ailleurs (domiciliation…).",
      },
      { key: 'legal_siret', label: 'SIRET', type: 'text' },
      { key: 'legal_naf', label: 'Code NAF / APE', type: 'text' },
      { key: 'legal_assurance', label: 'Assurance professionnelle', type: 'text', hint: 'Assureur et numéro de contrat.' },
      {
        key: 'legal_hebergeur',
        label: 'Hébergeur du site',
        type: 'textarea',
        hint: 'Nom, puis adresse : une ligne par élément, ou séparés par des virgules (ex. « OVH SAS, 2 rue Kellermann, 59100 Roubaix »).',
      },
      {
        key: 'rgpd_retention_months',
        label: 'Conservation des données clients',
        type: 'number',
        unit: 'mois',
        hint: "Après la date de l'intervention, les données du client sont effacées automatiquement (36 mois si vide). Affiché dans la politique de confidentialité.",
      },
    ],
  },
];

/** Clés gérées ailleurs (« Zone & déplacement », engagements, fichiers de branding) ou jamais éditables. */
// Clés gérées par un écran dédié (déplacement, zone, logo, thème, email professionnel vérifié…)
const EXCLUDED_KEY = /^(travel_|premises_|zone_|start_|default_(latitude|longitude)$|admin_password|pro_email$|branding_|theme_|rgpd_last_purge|schema_version$|ui_state_|vitrine_engagement_\d+(_icon)?$)/;

const DESCRIBED_KEYS = new Set(CONFIG_GROUPS.flatMap((group) => group.fields.map((f) => f.key)));

/** Groupe construit à partir des clés en base non décrites dans `CONFIG_GROUPS`. */
export function buildOtherGroup(config: AppConfig): ConfigGroup | null {
  const fields = Object.keys(config)
    .filter((key) => !DESCRIBED_KEYS.has(key) && !EXCLUDED_KEY.test(key))
    .sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }))
    .map((key): ConfigField => ({ key, label: key, type: 'text' }));

  return fields.length ? { id: 'other', title: 'Autres paramètres', fields } : null;
}
