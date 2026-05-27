const PRODUCTION_API_BASE = 'https://farmershub-kkjd.onrender.com/api'
const LOCAL_API_BASE = 'http://localhost:5000/api'

function normalizeBase(url) {
  return String(url || '').replace(/\/+$/, '')
}

function detectApiBase() {
  if (typeof window === 'undefined') return PRODUCTION_API_BASE

  const runtimeOverride = normalizeBase(window.FARMERSHUB_API_BASE)
  if (runtimeOverride) return runtimeOverride

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return PRODUCTION_API_BASE
  }

  return PRODUCTION_API_BASE
}

export const API_BASE = detectApiBase()

export function getToken() {
  return localStorage.getItem('fh_token')
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('fh_user')) || null
  } catch {
    return null
  }
}

export function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options)
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`)
  }

  return data
}

export async function getFarmers(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return apiFetch(`/farmers${qs ? `?${qs}` : ''}`)
}

export async function getProducts(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return apiFetch(`/products${qs ? `?${qs}` : ''}`)
}
