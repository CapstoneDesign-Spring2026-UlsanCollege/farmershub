import { getToken } from '../auth/sessionStorage.js';

const DEFAULT_API_BASE = 'https://farmershub-kkjd.onrender.com/api';

export function getApiBase() {
  return (
    import.meta.env.VITE_API_BASE_URL
    || window.localStorage.getItem('fh_api_base')
    || DEFAULT_API_BASE
  ).replace(/\/$/, '');
}

export function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function jsonHeaders(extra = {}) {
  const headers = { Accept: 'application/json', ...extra };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`;
  const isFormData = options.body instanceof FormData;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (!isFormData && options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok || data?.success === false) {
    const message = data?.message || data?.error || response.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}
