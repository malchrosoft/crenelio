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

async function request<T>(
  method: string,
  path: string,
  body: unknown = null,
  token: string | null = null
): Promise<T> {
  // FormData (envoi de fichiers) : le navigateur fixe lui-même l'en-tête multipart
  const isForm = body instanceof FormData;
  const headers: Record<string, string> = isForm ? {} : { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = { method, headers };
  if (body) {
    options.body = isForm ? body : JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `Erreur HTTP ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Configuration & Authentification
  getConfig: () => request<AppConfig>('GET', '/config'),
  getAdminConfig: (token?: string) => request<AppConfig>('GET', '/admin/config', null, token || null),
  /** Une valeur `null` supprime la clé (ex. engagement retiré). */
  updateAdminConfig: (payload: Record<string, string | null | undefined>, token?: string) =>
    request<{ message: string; config: AppConfig }>('PUT', '/admin/config', payload, token || null),
  adminLogin: (password: string) =>
    request<{ success: boolean; token: string; message: string }>('POST', '/admin/login', { password }),

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

  // Logo & favicon : un fichier par extension (png, svg, ico)
  uploadBranding: (kind: BrandingKind, files: Partial<Record<'png' | 'svg' | 'ico', Blob>>) => {
    const form = new FormData();
    Object.entries(files).forEach(([ext, blob]) => blob && form.append(ext, blob, `${kind}.${ext}`));
    return request<BrandingUrls>('POST', `/admin/branding/${kind}`, form);
  },
  deleteBranding: (kind: BrandingKind) => request<BrandingUrls>('DELETE', `/admin/branding/${kind}`),
};
