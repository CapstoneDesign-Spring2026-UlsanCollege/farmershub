/**
 * API configuration with environment-aware defaults.
 * Override in production by setting window.FARMERSHUB_API_BASE before loading scripts.
 */

const PRODUCTION_API_BASE = 'https://farmershub-kkjd.onrender.com/api';
const LOCAL_API_BASE = 'http://localhost:5000/api';

function normalizeBase(url) {
  return String(url || '').replace(/\/+$/, '');
}

function detectApiBase() {
  if (typeof window === 'undefined') return PRODUCTION_API_BASE;

  const runtimeOverride = normalizeBase(window.FARMERSHUB_API_BASE);
  if (runtimeOverride) return runtimeOverride;

  // Support local development when opening static files directly (file://).
  if (window.location.protocol === 'file:') {
    return PRODUCTION_API_BASE;
  }

  // Match the login page: default to the deployed API unless explicitly overridden.
  return PRODUCTION_API_BASE;
}

const API_BASE = detectApiBase();

function getToken() {
  return localStorage.getItem('fh_token');
}

function jsonHeaders(auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export { API_BASE, getToken, jsonHeaders, authHeader, apiFetch };
