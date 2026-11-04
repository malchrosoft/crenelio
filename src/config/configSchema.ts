import { AppConfig } from '../types';

/** Type de saisie d'un paramètre de configuration. */
export type ConfigFieldType = 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'url' | 'select' | 'checkbox';

export interface ConfigField {
  key: string;
  label: string;
  type: ConfigFieldType;
  unit?: string;
  step?: string;
  hint?: string;
  /** Liste de choix (`select`) : valeur enregistrée et libellé affiché. */
  options?: { value: string; label: string }[];
  /** `select` : ajoute « Autre (saisie libre) », pour une valeur hors liste. */
  allowCustom?: boolean;
  /** Modifiable seulement selon la valeur d'un autre champ du même groupe (sinon grisé, avec `disabledHint`). */
  enableIf?: { key: string; equals?: string; in?: string[] };
  disabledHint?: string;
  /** `checkbox` : avertissement à accepter avant de cocher, choisi d'après la configuration enregistrée. */
  confirmEnable?: (config: AppConfig) => { title: string; paragraphs: string[]; confirmLabel: string };
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
/**
 * Formes juridiques dont les documents mentionnent le capital social (sociétés commerciales de la liste) :
 * seules à afficher et imprimer `legal_capital`. Une forme saisie librement ne l'imprime pas.
 */
export const CAPITAL_FORMS = ['EURL', 'SARL', 'SASU', 'SAS'];

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
    intro: 'Vos nom et téléphone, affichés sur la vitrine, dans les emails et sur la fiche de confirmation.',
    fields: [
      { key: 'pro_name', label: "Nom de l'artisan", type: 'text' },
      { key: 'pro_phone', label: 'Téléphone', type: 'tel' },
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
    title: 'Créneaux',
    fields: [
      { key: 'slot_step_minutes', label: 'Graduation des créneaux', type: 'number', unit: 'min' },
      { key: 'buffer_minutes', label: 'Temps de trajet entre deux interventions', type: 'number', unit: 'min' },
      { key: 'min_notice_hours', label: 'Délai minimal avant un rendez-vous', type: 'number', unit: 'h' },
      { key: 'max_advance_days', label: 'Réservation en ligne possible jusqu’à', type: 'number', unit: 'jours' },
    ],
  },
  {
    id: 'map',
    title: 'Carte de la vitrine',
    intro: "Texte de la zone couverte et zoom initial de la carte (avant cadrage sur les communes). Le point de départ se règle dans « Zone d'intervention ».",
    fields: [
      { key: 'service_area', label: 'Zone couverte (texte affiché)', type: 'text', hint: 'Ex. : « Clamart et 15 km alentour ».' },
      { key: 'default_zoom', label: 'Niveau de zoom', type: 'number', step: '1' },
    ],
  },
  {
    id: 'quotes',
    title: 'Devis, TVA & facturation',
    intro:
      "Valeurs reprises sur chaque nouveau devis. Elles suivent la réglementation : à vérifier avec votre comptable lors d'un changement de régime ou de taux.",
    fields: [
      {
        key: 'invoicing_mode',
        label: 'Comment facturez-vous ?',
        type: 'select',
        options: [
          { value: 'external', label: 'Avec mon logiciel de facturation' },
          { value: 'none', label: 'Je ne facture pas depuis Crénelio' },
        ],
        hint: '« Avec mon logiciel » : fiche « Préparer la facture » sur chaque rendez-vous et exports pour la facturation. Les devis restent proposés dans tous les cas.',
      },
      {
        key: 'quote_vat_mode',
        label: 'Régime de TVA',
        type: 'select',
        options: [
          { value: 'franchise', label: 'Franchise en base (micro-entreprise, sans TVA)' },
          { value: 'vat', label: 'Assujetti à la TVA' },
        ],
        hint: 'Repris sur chaque nouveau devis ; un devis existant garde son régime.',
      },
      {
        key: 'quote_vat_exemption',
        label: 'Mention de franchise',
        type: 'select',
        options: [
          // Mentions prévues par l'article 293 E du CGI (docs/legal/fr/textes/code-general-impots.md)
          { value: 'TVA non applicable, article 293 B du CGI', label: 'TVA non applicable, article 293 B du CGI' },
          { value: 'TVA non applicable, article 293 B bis du CGI', label: 'TVA non applicable, article 293 B bis du CGI' },
        ],
        allowCustom: true,
        hint: "Imprimée sur les devis sans TVA. Mentions de l'article 293 E du CGI : « 293 B » pour la franchise en base, « 293 B bis » pour la franchise à destination d'un autre État membre ; « Autre » seulement sur avis de votre comptable.",
      },
      { key: 'quote_vat_rates', label: 'Taux de TVA proposés', type: 'text', unit: '%', hint: 'Séparés par des virgules, taux normal en premier (ex. : 20,10,5.5).' },
      { key: 'quote_labour_rate', label: 'Taux horaire de main-d’œuvre', type: 'number', unit: '€ HT/h', hint: 'Prérempli sur les lignes de main-d’œuvre.' },
      { key: 'quote_validity_days', label: 'Durée de validité', type: 'number', unit: 'jours' },
      {
        key: 'quote_payment_terms',
        label: 'Modalités de paiement',
        type: 'textarea',
        hint: 'Reprises sur chaque nouveau devis (C. consom. R111-1, 2° et R221-2, 4°) : moment du paiement et moyens acceptés.',
      },
      {
        key: 'quote_time_counting',
        label: 'Décompte du temps estimé',
        type: 'text',
        hint: "Imprimé sous la main-d'œuvre (arrêté du 24 janvier 2017, art. 2). Ex. : « Temps décompté par quart d'heure entamé ».",
      },
      { key: 'quote_number_prefix', label: 'Préfixe de numérotation', type: 'text', hint: 'Ex. : D → D-2026-0001.' },
      {
        key: 'quote_allow_supply',
        label: 'Revente de fournitures (achat-revente)',
        type: 'checkbox',
        hint: "Activité commerciale distincte : préférez les pièces achetées au nom du client (débours). Voir Documentation › Achat-revente.",
        confirmEnable: (config) =>
          (config.legal_form ?? 'ei') === 'ei'
            ? {
                title: 'Revente de fournitures : entrepreneur individuel',
                paragraphs: [
                  "Revendre une pièce achetée à votre nom, c'est exercer une activité d'achat-revente (vente de marchandises), distincte de vos prestations de services.",
                  "En micro-entreprise : le montant revendu entre dans votre chiffre d'affaires, avec les seuils et le taux de cotisations propres à la vente ; vos deux activités sont alors suivies séparément (activité mixte), à déclarer au guichet unique si elle n'est pas déjà enregistrée.",
                  "Vous devenez vendeur de la pièce : garanties légales dues au client, facture d'achat à votre nom, stock éventuel.",
                  "Sans ces démarches, privilégiez le débours : pièce achetée au nom et pour le compte du client, sur son mandat, refacturée au montant exact et hors chiffre d'affaires.",
                  "Vérifiez votre situation avec votre expert-comptable ou votre chambre de métiers avant d'activer.",
                ],
                confirmLabel: "J'ai compris, j'active la revente",
              }
            : {
                title: 'Revente de fournitures : société',
                paragraphs: [
                  "La revente de pièces est une activité commerciale : elle doit entrer dans l'objet social de votre société.",
                  "Les pièces revendues sont facturées avec votre TVA, et vous en êtes le vendeur (garanties légales dues au client).",
                  "Vérifiez avec votre expert-comptable avant d'activer.",
                ],
                confirmLabel: "J'active la revente",
              },
      },
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
      {
        key: 'legal_vat_number',
        label: 'N° de TVA intracommunautaire',
        type: 'text',
        hint: 'Si vous êtes assujetti à la TVA (C. consom. R111-2, 5°) : affiché sur les devis. Vide en franchise en base.',
      },
      {
        key: 'legal_form',
        label: 'Forme juridique',
        type: 'select',
        options: [
          { value: 'ei', label: 'Entreprise individuelle (dont micro-entreprise)' },
          { value: 'EURL', label: 'EURL' },
          { value: 'SARL', label: 'SARL' },
          { value: 'SASU', label: 'SASU' },
          { value: 'SAS', label: 'SAS' },
        ],
        allowCustom: true,
        hint: 'Détermine les mentions légales des devis : « EI » pour un entrepreneur individuel, forme et capital pour une société.',
      },
      {
        key: 'legal_ei_mention',
        label: 'Appellation légale',
        type: 'select',
        options: [
          { value: 'EI', label: 'EI' },
          { value: 'Entrepreneur individuel', label: 'Entrepreneur individuel' },
        ],
        enableIf: { key: 'legal_form', equals: 'ei' },
        disabledHint: 'Réservée à une entreprise individuelle.',
        hint: 'Accolée à votre nom sur les devis, factures et publicités (C. com. R526-27).',
      },
      {
        key: 'legal_capital',
        label: 'Capital social',
        type: 'number',
        unit: '€',
        enableIf: { key: 'legal_form', in: CAPITAL_FORMS },
        disabledHint: 'Sans objet pour cette forme juridique : non imprimé.',
        hint: 'Indiqué avec la forme juridique sur les devis et factures (sociétés à capital).',
      },
      {
        key: 'legal_rm',
        label: 'Immatriculation (RNE ou RCS)',
        type: 'text',
        hint: "Ex. : « Registre national des entreprises (métiers de l'artisanat) » ou « RCS Versailles » (C. consom. R111-2, 3° ; C. com. R123-237).",
      },
      {
        key: 'legal_mediator',
        label: 'Médiateur de la consommation',
        type: 'textarea',
        hint: 'Nom, coordonnées et adresse du site internet du médiateur dont vous relevez (C. consom. L616-1 et R616-1).',
      },
      { key: 'legal_naf', label: 'Code NAF / APE', type: 'text' },
      {
        key: 'quote_builder_guarantees',
        label: 'Mes travaux peuvent relever des garanties des constructeurs (décennale, bon fonctionnement, parfait achèvement)',
        type: 'checkbox',
        hint: "Travaux constituant un ouvrage ou touchant un élément d'équipement de l'ouvrage (C. civ. 1792 et suivants) : case proposée sur chaque devis, garanties rappelées et attestation d'assurance décennale jointe (C. assur. L243-2). À qualifier avec votre assureur.",
      },
      { key: 'legal_assurance', label: 'Assurance professionnelle', type: 'text', hint: "Assureur, ses coordonnées et la couverture géographique du contrat (C. consom. R111-2, 9°)." },
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
const EXCLUDED_KEY = /^(travel_|premises_|zone_|start_|default_(latitude|longitude)$|admin_password|pro_email$|branding_|theme_|rgpd_last_purge|schema_version$|ui_state_|insurance_attestation_until$|vitrine_engagement_\d+(_icon)?$)/;

const DESCRIBED_KEYS = new Set(CONFIG_GROUPS.flatMap((group) => group.fields.map((f) => f.key)));

/** Groupe construit à partir des clés en base non décrites dans `CONFIG_GROUPS`. */
export function buildOtherGroup(config: AppConfig): ConfigGroup | null {
  const fields = Object.keys(config)
    .filter((key) => !DESCRIBED_KEYS.has(key) && !EXCLUDED_KEY.test(key))
    .sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }))
    .map((key): ConfigField => ({ key, label: key, type: 'text' }));

  return fields.length ? { id: 'other', title: 'Autres paramètres', fields } : null;
}
