/**
 * Centralized API client for communicating with the PHP backend.
 * Uses fetch() with JSON payloads. Adjust BASE_URL if the API
 * lives under a different path on your hosting.
 */
const BASE_URL = '/api';

async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data;
}

export const api = {
  // GET /api/users
  listUsers: () => request('GET', '/users'),
  // GET /api/users/:id
  getUser: (id) => request('GET', `/users/${id}`),
  // POST /api/users
  createUser: (payload) => request('POST', '/users', payload),
  // PUT /api/users/:id
  updateUser: (id, payload) => request('PUT', `/users/${id}`, payload),
  // DELETE /api/users/:id
  deleteUser: (id) => request('DELETE', `/users/${id}`),
};
