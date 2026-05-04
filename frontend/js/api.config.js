/**
 * api.config.js
 * Single source of truth for API base URL and token helpers.
 * Imported by every service file.
 */

const API_BASE = 'http://localhost:5000/api';

/** Returns the stored JWT, or null */
function getToken() {
  return localStorage.getItem('fh_token');
}

/** Builds standard JSON headers, optionally including Bearer token */
function jsonHeaders(auth = true) {
  const h = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

/** Builds auth-only headers (for multipart/form-data — let browser set Content-Type) */
function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Generic fetch wrapper — throws on non-2xx */
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export { API_BASE, getToken, jsonHeaders, authHeader, apiFetch };
