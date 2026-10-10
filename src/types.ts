/**
 * TypeScript types for Crénelio.
 */

export interface Service {
  id: number;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: string | number;
  is_active: number | boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
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
  notes: string | null;
  start_datetime: string;
  end_datetime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  cancel_token: string;
  cancellation_reason?: string | null;
  created_at?: string;
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
  // Vitrine
  vitrine_tagline?: string;
  vitrine_about?: string;
  vitrine_photo_url?: string;
  vitrine_engagement_1?: string;
  vitrine_engagement_2?: string;
  vitrine_engagement_3?: string;
  vitrine_engagement_4?: string;
  // Mentions légales
  legal_raison_sociale?: string;
  legal_siret?: string;
  legal_naf?: string;
  legal_assurance?: string;
  legal_adresse?: string;
  legal_hebergeur?: string;
  [key: string]: string | undefined;
}

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
}
