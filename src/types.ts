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
  | 'exception_client_refused';

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
