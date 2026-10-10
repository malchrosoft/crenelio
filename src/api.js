/**
 * Centralized API client for Crénelio.
 * Interacts with the native PHP REST backend.
 */
const BASE_URL = '/api';

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `Erreur HTTP ${res.status}`);
  }
  return data;
}

export const api = {
  // Configuration & Authentification
  getConfig: () => request('GET', '/config'),
  getAdminConfig: () => request('GET', '/admin/config'),
  updateAdminConfig: (payload) => request('PUT', '/admin/config', payload),
  adminLogin: (password) => request('POST', '/admin/login', { password }),

  // Prestations
  listServices: (all = false) => request('GET', `/services${all ? '?all=1' : ''}`),
  getService: (id) => request('GET', `/services/${id}`),
  createService: (payload) => request('POST', '/services', payload),
  updateService: (id, payload) => request('PUT', `/services/${id}`, payload),
  deleteService: (id) => request('DELETE', `/services/${id}`),

  // Horaires & Indisponibilités
  getSchedules: () => request('GET', '/schedules'),
  updateSchedule: (day, payload) => request('PUT', `/schedules/${day}`, payload),
  listUnavailabilities: () => request('GET', '/unavailabilities'),
  createUnavailability: (payload) => request('POST', '/unavailabilities', payload),
  deleteUnavailability: (id) => request('DELETE', `/unavailabilities/${id}`),

  // Moteur de créneaux
  getSlots: (serviceId, date) => request('GET', `/slots?service_id=${serviceId}&date=${date}`),

  // Rendez-vous
  createAppointment: (payload) => request('POST', '/appointments', payload),
  getAppointmentByToken: (token) => request('GET', `/appointments/token/${token}`),
  cancelAppointmentByToken: (token, reason = '') =>
    request('POST', `/appointments/token/${token}/cancel`, { reason }),
  listAppointments: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/appointments${q ? `?${q}` : ''}`);
  },
  getAppointment: (id) => request('GET', `/appointments/${id}`),
  updateAppointmentStatus: (id, status, reason = null) =>
    request('PUT', `/appointments/${id}/status`, { status, reason }),
};
