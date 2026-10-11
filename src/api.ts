/**
 * Centralized API client for Crénelio (TypeScript).
 */
import {
  Service,
  SlotsResponse,
  Schedule,
  Unavailability,
  Appointment,
  AppConfig,
  BookingPayload,
} from './types';

const BASE_URL = '/api';

async function request<T>(
  method: string,
  path: string,
  body: unknown = null,
  token: string | null = null
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
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
  updateAdminConfig: (payload: Partial<AppConfig>, token?: string) =>
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

  // Rendez-vous
  createAppointment: (payload: BookingPayload) =>
    request<{ message: string; appointment: Appointment }>('POST', '/appointments', payload),
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
};

