/**
 * API configuration with environment-aware defaults.
 * Override in production by setting window.FARMERSHUB_API_BASE before loading scripts.
 */

const LOCAL_API_BASE = 'http://localhost:5000/api';

function normalizeBase(url) {
  return String(url || '').replace(/\/+$/, '');
}

function detectApiBase() {
  if (typeof window === 'undefined') return LOCAL_API_BASE;

  const runtimeOverride = normalizeBase(window.FARMERSHUB_API_BASE);
  if (runtimeOverride) return runtimeOverride;

  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return LOCAL_API_BASE;
  }

  // Temporary live/demo default: use local API from hosted frontend.
  // For real production, set window.FARMERSHUB_API_BASE to your deployed backend URL.
  return LOCAL_API_BASE;
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
