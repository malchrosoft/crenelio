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
} from './types';

const BASE_URL = '/api';

/** Émis quand l'API refuse une route de l'espace Pro (session absente ou expirée). */
export const UNAUTHORIZED_EVENT = 'crenelio:unauthorized';

/** Routes de connexion : un 401 y signale une erreur de saisie, pas une session expirée. */
const LOGIN_PATHS = ['/admin/login', '/admin/login/code'];

async function request<T>(method: string, path: string, body: unknown = null): Promise<T> {
  // FormData (envoi de fichiers) : le navigateur fixe lui-même l'en-tête multipart
  const isForm = body instanceof FormData;
  const headers: Record<string, string> = isForm ? {} : { 'Content-Type': 'application/json' };

  // La session de l'espace Pro voyage dans un cookie HttpOnly (même origine)
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

/** État de l'envoi d'emails (lecture seule, réglé dans `api/.env`). */
export interface MailStatusInfo {
  transport: 'smtp' | 'mail' | 'none';
  smtp_host: string | null;
  mail_from: string | null;
  mail_from_name: string;
  recipient: string | null;
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
  adminSession: () => request<{ authenticated: boolean; two_factor: boolean }>('GET', '/admin/session'),
  adminLogout: () => request<{ success: boolean }>('POST', '/admin/logout'),
  getMailStatus: () => request<MailStatusInfo>('GET', '/admin/mail'),
  sendTestMail: () => request<{ message: string }>('POST', '/admin/mail/test'),

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
  updateAppointmentStatus: (id: number, status: string, reason: string | null = null) =>
    request<Appointment>('PUT', `/appointments/${id}/status`, { status, reason }),
  rescheduleAppointment: (id: number, start_datetime: string, status?: string) =>
    request<Appointment>('PUT', `/appointments/${id}/reschedule`, { start_datetime, status }),

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
