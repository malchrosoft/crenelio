/**
 * Centralized API client for Crénelio (TypeScript).
 */
import { ZoneCollection, ZoneFeature } from './utils/serviceArea';
import {
  Service,
  SlotsResponse,
  Schedule,
  Unavailability,
  SlotAvailability,
  Appointment,
  AppConfig,
  BookingPayload,
  TravelQuote,
  AppointmentNotification,
  NotificationType,
  BrandingKind,
  BrandingUrls,
  Quote,
  QuotePayload,
  QuoteDecisionPayload,
  QuoteNotification,
  InsuranceAttestationStatus,
} from './types';

const BASE_URL = '/api';

/** Émis quand l'API refuse une route de l'espace Artisan (session absente ou expirée). */
export const UNAUTHORIZED_EVENT = 'crenelio:unauthorized';

/** Routes de connexion : un 401 y signale une erreur de saisie, pas une session expirée. */
const LOGIN_PATHS = ['/admin/login', '/admin/login/code', '/admin/password', '/admin/password/reset'];

async function request<T>(method: string, path: string, body: unknown = null): Promise<T> {
  // FormData (envoi de fichiers) : le navigateur fixe lui-même l'en-tête multipart
  const isForm = body instanceof FormData;
  const headers: Record<string, string> = isForm ? {} : { 'Content-Type': 'application/json' };

  // La session de l'espace Artisan voyage dans un cookie HttpOnly (même origine)
  const options: RequestInit = { method, headers, credentials: 'same-origin' };
  if (body) {
    options.body = isForm ? body : JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json().catch(() => null);

  if (res.status === 401 && !LOGIN_PATHS.includes(path)) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  if (!res.ok) {
    throw new Error(data?.error || `Erreur HTTP ${res.status}`);
  }
  return data as T;
}

/** Abonnement d'agenda de l'artisan (Item 33) : `path` seulement s'il est activé. */
export interface CalendarFeedInfo {
  enabled: boolean;
  path: string | null;
  include_unavailabilities: boolean;
  created_at: string | null;
  last_access: string | null;
}

/** État de l'envoi d'emails (lecture seule, réglé dans `api/.env`). */
export interface MailStatusInfo {
  transport: 'smtp' | 'mail' | 'none';
  smtp_host: string | null;
  mail_from: string | null;
  mail_from_auto: boolean;
  site_domain: string | null;
  mail_from_name: string;
  mail_from_name_auto: boolean;
  recipient: string | null;
  /** Réponses des clients envoyées à (null : à l'expéditeur lui-même). */
  client_reply_to: string | null;
}

export const api = {
  // Configuration & Authentification
  getConfig: () => request<AppConfig>('GET', '/config'),
  getAdminConfig: () => request<AppConfig>('GET', '/admin/config'),
  /** Une valeur `null` supprime la clé (ex. engagement retiré). */
  updateAdminConfig: (payload: Record<string, string | null | undefined>) =>
    request<{ message: string; config: AppConfig }>('PUT', '/admin/config', payload),
  /** Mot de passe : session ouverte, ou code à 6 chiffres envoyé à l'artisan (nouvel appareil). */
  adminLogin: (password: string) =>
    request<{ status: 'authenticated' | 'otp_required'; email_hint?: string; two_factor: boolean }>(
      'POST',
      '/admin/login',
      { password }
    ),
  adminVerifyCode: (code: string) =>
    request<{ status: 'authenticated'; two_factor: boolean }>('POST', '/admin/login/code', { code }),
  adminSession: () =>
    request<{ authenticated: boolean; two_factor: boolean; default_password: boolean; must_change_password: boolean }>(
      'GET',
      '/admin/session'
    ),
  /** Changement depuis l'espace Artisan : ferme les autres sessions. */
  changePassword: (current: string, password: string) =>
    request<{ message: string }>('POST', '/admin/password', { current, password }),
  /** Mot de passe oublié : code envoyé à l'email professionnel (réponse identique dans tous les cas). */
  forgotPassword: () => request<{ message: string }>('POST', '/admin/password/forgot'),
  resetPassword: (code: string, password: string) =>
    request<{ status: 'authenticated'; two_factor: boolean }>('POST', '/admin/password/reset', { code, password }),
  /** Nouvel email professionnel : retenu après saisie du code reçu sur cette adresse. */
  requestProEmail: (email: string) =>
    request<{ status: 'saved' | 'code_sent'; pro_email: string | null }>('POST', '/admin/pro-email', { email }),
  confirmProEmail: (code: string) =>
    request<{ status: 'saved'; pro_email: string }>('POST', '/admin/pro-email/confirm', { code }),
  adminLogout: () => request<{ success: boolean }>('POST', '/admin/logout'),
  /** Préférences d'affichage de l'espace Artisan (disposition d'une grille), `null` si aucune. */
  getUiState: <T>(id: string) => request<{ state: T | null }>('GET', `/admin/ui-state/${id}`),
  saveUiState: <T>(id: string, state: T) => request<{ state: T }>('PUT', `/admin/ui-state/${id}`, { state }),
  resetUiState: (id: string) => request<{ state: null }>('DELETE', `/admin/ui-state/${id}`),
  getCalendarFeed: () => request<CalendarFeedInfo>('GET', '/admin/calendar-feed'),
  /** Active l'abonnement, ou régénère son adresse (l'ancienne cesse de fonctionner). */
  enableCalendarFeed: (includeUnavailabilities: boolean) =>
    request<CalendarFeedInfo>('POST', '/admin/calendar-feed', { include_unavailabilities: includeUnavailabilities }),
  updateCalendarFeed: (includeUnavailabilities: boolean) =>
    request<CalendarFeedInfo>('PUT', '/admin/calendar-feed', { include_unavailabilities: includeUnavailabilities }),
  disableCalendarFeed: () => request<CalendarFeedInfo>('DELETE', '/admin/calendar-feed'),
  getMailStatus: () => request<MailStatusInfo>('GET', '/admin/mail'),
  /** Destinataire libre (testeur, développeur) ; à défaut, l'email professionnel. */
  sendTestMail: (to?: string) => request<{ message: string }>('POST', '/admin/mail/test', { to: to || undefined }),

  // Prestations
  listServices: (all = false) => request<Service[]>('GET', `/services${all ? '?all=1' : ''}`),
  getService: (id: number) => request<Service>('GET', `/services/${id}`),
  createService: (payload: Partial<Service>) => request<Service>('POST', '/services', payload),
  updateService: (id: number, payload: Partial<Service>) => request<Service>('PUT', `/services/${id}`, payload),
  deleteService: (id: number) => request<{ message: string }>('DELETE', `/services/${id}`),

  // Horaires & Indisponibilités
  getSchedules: () => request<Schedule[]>('GET', '/schedules'),
  updateSchedule: (day: number, payload: Partial<Schedule>) => request<Schedule>('PUT', `/schedules/${day}`, payload),
  listUnavailabilities: () => request<Unavailability[]>('GET', '/unavailabilities'),
  createUnavailability: (payload: { title: string; start_datetime: string; end_datetime: string }) =>
    request<Unavailability>('POST', '/unavailabilities', payload),
  deleteUnavailability: (id: number) => request<{ message: string }>('DELETE', `/unavailabilities/${id}`),

  // Devis (Item 22)
  listQuotes: () => request<Quote[]>('GET', '/quotes'),
  getQuote: (id: number) => request<Quote>('GET', `/quotes/${id}`),
  /** Brouillon ; avec `appointment_id` seul, prérempli depuis le rendez-vous. */
  createQuote: (payload: Partial<QuotePayload>) => request<Quote>('POST', '/quotes', payload),
  updateQuote: (id: number, payload: QuotePayload) => request<Quote>('PUT', `/quotes/${id}`, payload),
  deleteQuote: (id: number) => request<{ deleted: boolean }>('DELETE', `/quotes/${id}`),
  /** Numéro, lien et email au client (`notifications` : résultat de l'envoi). */
  sendQuote: (id: number) =>
    request<Quote & { notifications: { type: string; status: string }[] }>('POST', `/quotes/${id}/send`),
  /** Vente : remise du bien au client, départ du délai de rétractation (L221-18, 2°). */
  quoteGoodsReceived: (id: number, date: string) => request<Quote>('PUT', `/quotes/${id}/goods-received`, { date }),
  quoteNotifications: (id: number) => request<QuoteNotification[]>('GET', `/quotes/${id}/notifications`),
  // Attestation d'assurance décennale (C. assur. L243-2)
  insuranceAttestation: () => request<InsuranceAttestationStatus>('GET', '/admin/insurance-attestation'),
  uploadInsuranceAttestation: (validUntil: string, file: Blob | null) => {
    const form = new FormData();
    form.append('valid_until', validUntil);
    if (file) form.append('file', file);
    return request<InsuranceAttestationStatus>('POST', '/admin/insurance-attestation', form);
  },
  deleteInsuranceAttestation: () => request<InsuranceAttestationStatus>('DELETE', '/admin/insurance-attestation'),
  // Page publique du devis (lien à jeton)
  getQuoteByToken: (token: string) => request<Quote>('GET', `/quotes/token/${token}`),
  decideQuote: (token: string, payload: QuoteDecisionPayload) =>
    request<{ status: Quote['status'] }>('POST', `/quotes/token/${token}/decision`, payload),
  withdrawQuote: (token: string, name: string, email: string, address = '') =>
    request<{ status: 'withdrawn'; withdrawn_at: string }>('POST', `/quotes/token/${token}/withdraw`, { name, email, address }),

  // Moteur de créneaux
  getSlots: (serviceId: number, date: string) =>
    request<SlotsResponse>('GET', `/slots?service_id=${serviceId}&date=${date}`),
  getZone: () => request<ZoneCollection>('GET', '/zone'),
  updateZone: (features: ZoneFeature[]) => request<{ count: number }>('PUT', '/admin/zone', { features }),
  getSlotAvailability: (serviceId: number) =>
    request<SlotAvailability>('GET', `/slots/availability?service_id=${serviceId}`),

  // Frais de déplacement
  quoteTravelFee: (serviceId: number, coordinates: [number, number] | null) =>
    request<TravelQuote>('POST', '/travel-fee/quote', {
      service_id: serviceId,
      latitude: coordinates ? coordinates[0] : undefined,
      longitude: coordinates ? coordinates[1] : undefined,
    }),

  // Rendez-vous
  /** Rendez-vous saisi par l'artisan (hors zone et heure libre acceptés). */
  createAdminAppointment: (payload: BookingPayload) =>
    request<{ message: string; appointment: Appointment }>('POST', '/admin/appointments', payload),
  createAppointment: (payload: BookingPayload) =>
    request<{ message: string; appointment: Appointment }>('POST', '/appointments', payload),
  /** Demande hors zone : rendez-vous « en attente » soumis à l'artisan, emails au client et à l'artisan. */
  requestException: (payload: BookingPayload) =>
    request<{ message: string }>('POST', '/appointments/exceptional-request', payload),
  getDecision: (token: string) => request<Appointment>('GET', `/appointments/decision/${token}`),
  decide: (token: string, action: 'accept' | 'refuse') =>
    request<{ status: Appointment['status'] }>('POST', `/appointments/decision/${token}`, { action }),
  getAppointmentByToken: (token: string) =>
    request<Appointment>('GET', `/appointments/token/${token}`),
  cancelAppointmentByToken: (token: string, reason = '') =>
    request<{ message: string; appointment: Appointment }>('POST', `/appointments/token/${token}/cancel`, { reason }),
  listAppointments: (params: { start_date?: string; end_date?: string; status?: string } = {}) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<Appointment[]>('GET', `/appointments${q ? `?${q}` : ''}`);
  },
  getAppointment: (id: number) => request<Appointment>('GET', `/appointments/${id}`),
  /** `notify: false` : changement silencieux pour le client (annulation, décision d'une demande). */
  updateAppointmentStatus: (id: number, status: string, reason: string | null = null, notify = true) =>
    request<Appointment>('PUT', `/appointments/${id}/status`, { status, reason, notify }),
  /** Demande d'effacement (RGPD) : données du client effacées, rendez-vous conservé. */
  /** Position d'un rendez-vous localisé après coup (tableau de bord). */
  locateAppointment: (id: number, latitude: number, longitude: number) =>
    request<Appointment>('PUT', `/appointments/${id}/coordinates`, { latitude, longitude }),
  anonymizeAppointment: (id: number) =>
    request<{ message: string; appointment: Appointment }>('POST', `/appointments/${id}/anonymize`),
  /**
   * Reprogrammation. `check` (calendrier) : refus 409 `slot_unavailable` si le créneau n'est pas
   * proposable ; `force` : enregistrement malgré tout, sur confirmation de l'artisan.
   */
  rescheduleAppointment: (
    id: number,
    start_datetime: string,
    status?: string,
    options: { check?: boolean; force?: boolean; notify?: boolean } = {}
  ) => request<Appointment>('PUT', `/appointments/${id}/reschedule`, { start_datetime, status, ...options }),

  // Journal des notifications email
  listNotifications: (appointmentId: number) =>
    request<AppointmentNotification[]>('GET', `/appointments/${appointmentId}/notifications`),
  resendNotification: (appointmentId: number, type: NotificationType) =>
    request<{ result: { type: NotificationType; status: string }; notifications: AppointmentNotification[] }>(
      'POST',
      `/appointments/${appointmentId}/notifications/resend`,
      { type }
    ),

  // Logo & favicon : un fichier par extension (png, svg, ico), plus `email` (PNG allégé du logo)
  uploadBranding: (kind: BrandingKind, files: Partial<Record<'png' | 'svg' | 'ico' | 'email', Blob>>) => {
    const form = new FormData();
    Object.entries(files).forEach(
      ([field, blob]) => blob && form.append(field, blob, field === 'email' ? `${kind}-email.png` : `${kind}.${field}`)
    );
    return request<BrandingUrls>('POST', `/admin/branding/${kind}`, form);
  },
  deleteBranding: (kind: BrandingKind) => request<BrandingUrls>('DELETE', `/admin/branding/${kind}`),
};
