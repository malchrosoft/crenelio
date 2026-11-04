/**
 * TypeScript types for Crénelio.
 */

/** Mode de facturation du déplacement porté par la prestation. */
export type TravelFeeMode = 'none' | 'fixed' | 'distance_tiers';

export interface Service {
  id: number;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: string | number;
  travel_fee_mode: TravelFeeMode;
  travel_fee_amount: string | number;
  is_active: number | boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

/** Palier kilométrique global appliqué en mode `distance_tiers`. */
export interface TravelTier {
  max_km: number;
  fee: number;
}

/** Décomposition tarifaire renvoyée par `POST /travel-fee/quote`. */
export interface TravelQuote {
  mode: TravelFeeMode;
  service_price: number;
  travel_fee: number;
  total: number;
  distance_km: number | null;
  is_out_of_zone: boolean;
  max_km: number | null;
  /** true si l'adresse doit être géocodée (frais à la distance ou zone de communes) et ne l'est pas. */
  needs_coordinates: boolean;
  /** Motif du hors zone : au-delà du rayon, ou commune non desservie. */
  out_of_zone_reason: 'radius' | 'commune' | null;
  /** Hors zone mais à moins du rayon + 10 % : demande exceptionnelle proposée. */
  can_request_exception: boolean;
  tiers: TravelTier[];
}

export interface Slot {
  start: string;          // ex: '09:00'
  end: string;            // ex: '09:45'
  start_datetime: string; // ex: '2026-10-15 09:00:00'
  end_datetime: string;   // ex: '2026-10-15 09:45:00'
}

export interface SlotsResponse {
  date: string;
  service: Service;
  buffer_minutes: number;
  slots: Slot[];
}

/** Jours offrant au moins un créneau dans la fenêtre de réservation. */
export interface SlotAvailability {
  max_advance_days: number;
  dates: string[];
}

export interface Schedule {
  id: number;
  day_of_week: number;
  is_active: number | boolean;
  morning_start: string | null;
  morning_end: string | null;
  afternoon_start: string | null;
  afternoon_end: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Unavailability {
  id: number;
  title: string;
  start_datetime: string;
  end_datetime: string;
  created_at?: string;
}

export interface Appointment {
  id: number;
  service_id: number;
  service_name?: string;
  duration_minutes?: number;
  service_price?: string | number;
  client_name: string;
  client_email: string;
  client_phone: string;
  address: string;
  postal_code: string;
  city: string;
  /** Position du lieu d'intervention (DECIMAL : chaîne), null si non localisé. */
  latitude?: string | number | null;
  longitude?: string | number | null;
  travel_fee: string | number;
  distance_km: string | number | null;
  is_out_of_zone: number | boolean;
  notes: string | null;
  start_datetime: string;
  end_datetime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  cancel_token: string;
  cancellation_reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

/** Type d'email émis automatiquement autour d'un rendez-vous. */
export type NotificationType =
  | 'client_confirmation'
  | 'pro_confirmation'
  | 'exception_client_ack'
  | 'exception_pro_request'
  | 'exception_client_refused'
  | 'cancellation_client'
  | 'cancellation_pro'
  | 'reschedule_client'
  | 'reschedule_pro';

/** Entrée du journal d'envoi rattachée à un rendez-vous. */
export interface AppointmentNotification {
  id: number;
  appointment_id: number;
  type: NotificationType;
  recipient: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at?: string;
}

export interface AppConfig {
  company_name?: string;
  pro_name?: string;
  pro_email?: string;
  pro_phone?: string;
  service_area?: string;
  slot_step_minutes?: string;
  buffer_minutes?: string;
  min_notice_hours?: string;
  max_advance_days?: string;
  default_latitude?: string;
  default_longitude?: string;
  default_zoom?: string;
  // Frais de déplacement (paliers kilométriques globaux)
  travel_tier_1_max_km?: string;
  travel_tier_1_fee?: string;
  travel_tier_2_max_km?: string;
  travel_tier_2_fee?: string;
  travel_tier_3_max_km?: string;
  travel_tier_3_fee?: string;
  travel_max_km?: string;
  // Vitrine
  vitrine_tagline?: string;
  vitrine_about?: string;
  vitrine_photo_url?: string;
  [key: `vitrine_engagement_${number}`]: string | undefined;
  // Mentions légales
  /** `onsite` (défaut) : l'artisan se déplace ; `premises` : clients reçus dans les locaux. */
  travel_mode?: 'onsite' | 'premises';
  premises_address?: string;
  premises_postal_code?: string;
  premises_city?: string;
  premises_latitude?: string;
  premises_longitude?: string;
  /** Origine du calcul des frais de déplacement : point de départ (défaut) ou adresse de l'entreprise. */
  travel_fee_origin?: 'start' | 'company';
  /** '1' : le point de départ (centre du rayon) est l'adresse de l'entreprise. */
  start_same_as_premises?: string;
  /** Libellé du point de départ s'il diffère de l'entreprise (coordonnées dans default_latitude / default_longitude). */
  start_address?: string;
  /** '1' : communes limitrophes de la commune de départ ajoutées au calcul de zone. */
  zone_include_neighbours?: string;
  legal_raison_sociale?: string;
  legal_siret?: string;
  legal_naf?: string;
  legal_assurance?: string;
  legal_adresse?: string;
  legal_hebergeur?: string;
  // Logo & favicon : URLs versionnées calculées par l'API (null si aucun fichier)
  branding_logo_url?: string | null;
  branding_favicon_url?: string | null;
  [key: string]: string | null | undefined;
}

export type BrandingKind = 'logo' | 'favicon';

export type BrandingUrls = Pick<AppConfig, 'branding_logo_url' | 'branding_favicon_url'>;

export interface AddressResult {
  address: string;
  postal_code: string;
  city: string;
  coordinates: [number, number]; // [lat, lon]
  label: string;
}

export interface BookingPayload {
  service_id: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  address: string;
  postal_code: string;
  city: string;
  notes?: string;
  start_datetime: string;
  /** Coordonnées issues de la Base Adresse Nationale, requises en mode `distance_tiers`. */
  latitude?: number;
  longitude?: number;
  /** Espace Artisan : envoyer les confirmations par email. */
  notify?: boolean;
}

// --- Devis (Item 22) ---

/** Types de ligne : main-d'œuvre, forfait, déplacement, pièce au nom du client (débours), fourniture revendue. */
export type QuoteLineKind = 'labour' | 'service' | 'travel' | 'debours' | 'supply';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'refused' | 'expired' | 'withdrawn';

/** Montants en chaînes (DECIMAL MySQL) à la lecture, en nombres à l'envoi. */
export interface QuoteLine {
  kind: QuoteLineKind;
  label: string;
  quantity: number | string;
  unit: string;
  unit_price: number | string;
  vat_rate: number | string;
}

export interface Quote {
  id: number;
  number: string | null;
  appointment_id: number | null;
  appointment_start?: string | null;
  client_name: string;
  client_email: string;
  client_phone: string;
  /** Client professionnel (facultatif) : raison sociale et SIREN ou SIRET. */
  client_company: string | null;
  client_siren: string | null;
  address: string;
  postal_code: string;
  city: string;
  title: string;
  notes: string | null;
  status: QuoteStatus;
  vat_mode: 'franchise' | 'vat';
  validity_days: number;
  quote_price: string | null;
  /** Date ou délai d'exécution, modalités de paiement, décompte du temps (C. consom. L221-5 3°, R221-2 4° ; arrêté 2017). */
  execution_terms: string | null;
  payment_terms: string | null;
  time_counting: string | null;
  /** Travaux relevant des garanties des constructeurs : garanties imprimées, attestation décennale jointe. */
  builder_works: number;
  urgent: number;
  total_ht: string;
  total_vat: string;
  total_debours: string;
  total_ttc: string;
  sent_at: string | null;
  valid_until: string | null;
  decided_at: string | null;
  keep_parts: number | null;
  /** Budget maximum du mandat de débours (document séparé) ; null sans débours. */
  debours_budget: string | null;
  /** Mandat de débours : null sans réponse, 0 refusé (le client fournit les pièces), 1 donné. */
  debours_mandate: number | null;
  mandate_decided_at: string | null;
  early_execution: number;
  withdrawal_until: string | null;
  withdrawn_at: string | null;
  withdrawal_name: string | null;
  withdrawal_email: string | null;
  withdrawal_address?: string | null;
  refusal_reason: string | null;
  /** Jeton du lien client (Espace Artisan seulement, après l'envoi). */
  token?: string | null;
  /** Page publique : rétractation en ligne encore possible. */
  can_withdraw?: boolean;
  created_at: string;
  lines?: QuoteLine[];
}

/** Champs modifiables d'un brouillon. */
export type QuotePayload = Pick<
  Quote,
  'client_name' | 'client_email' | 'client_phone' | 'client_company' | 'client_siren' | 'address' | 'postal_code' | 'city' | 'title' | 'notes' | 'validity_days' | 'execution_terms' | 'payment_terms' | 'time_counting'
> & {
  builder_works: boolean;
  appointment_id?: number | null;
  quote_price: number | null;
  urgent: boolean;
  /** Vide : montant estimé des pièces. */
  debours_budget: number | null;
  lines: QuoteLine[];
};

/** Réponse du client au devis (page publique). */
export interface QuoteDecisionPayload {
  action: 'accept' | 'refuse';
  keep_parts?: boolean;
  debours_mandate?: boolean;
  withdrawal_ack?: boolean;
  early_execution?: boolean;
  reason?: string;
}

/** Journal des emails d'un devis. */
export interface QuoteNotification {
  id: number;
  type: 'quote_client' | 'decision_client' | 'decision_pro' | 'withdrawal_client' | 'withdrawal_pro';
  recipient: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

/** Attestation d'assurance décennale du professionnel (C. assur. L243-2). */
export interface InsuranceAttestationStatus {
  exists: boolean;
  size: number | null;
  uploaded_at: string | null;
  valid_until: string | null;
  valid: boolean;
}

