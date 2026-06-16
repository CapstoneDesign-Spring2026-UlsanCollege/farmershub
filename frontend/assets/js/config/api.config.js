/**
 * API configuration with environment-aware defaults.
 * Override in production by setting window.FARMERSHUB_API_BASE before loading scripts.
 */

const PRODUCTION_API_BASE = 'https://farmershub-kkjd.onrender.com/api';
const LOCAL_API_BASE = 'http://localhost:5000/api';
const REQUEST_TIMEOUT_MS = 15000;

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

  // When the app is served from a local backend (the dev setup serves the
  // frontend from the same Express server), talk to that same-origin API.
  // This keeps every page on one backend — previously only login/admin pages
  // set this, so other pages silently hit the production API and showed stale
  // data (e.g. a recharged wallet balance reading 0 from the wrong database).
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return normalizeBase(`${window.location.origin}/api`);
  }

  // Default to the deployed API unless explicitly overridden.
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

async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const externalSignal = options.signal;
  let timedOut = false;
  const abortFromExternalSignal = () => controller.abort();

  if (externalSignal?.aborted) {
    controller.abort();
  } else {
    externalSignal?.addEventListener('abort', abortFromExternalSignal, { once: true });
  }

  const timer = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (timedOut) throw new Error('Request timed out. Please try again.');
    throw error;
  } finally {
    window.clearTimeout(timer);
    externalSignal?.removeEventListener('abort', abortFromExternalSignal);
  }
}

async function apiFetch(path, options = {}) {
  const res = await fetchWithTimeout(`${API_BASE}${path}`, options);
  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export { API_BASE, getToken, jsonHeaders, authHeader, fetchWithTimeout, apiFetch };
