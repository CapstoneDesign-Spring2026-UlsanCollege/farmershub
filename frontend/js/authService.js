/**
 * authService.js
 * Login, register, logout, and session helpers.
 */
import { apiFetch, jsonHeaders } from './api.config.js';

const AUTH_STORAGE_KEYS = ['fh_token', 'fh_user', 'fh_loggedIn', 'fh_role', 'currentUser'];

/**
 * Register a new account.
 * @param {object} payload - { fullName, email, password, role, phone, address, age, gender, paymentMethod }
 */
async function register(payload) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    headers: jsonHeaders(false),
    body: JSON.stringify(payload),
  });
  _saveSession(data.user, data.token);
  return data;
}

/**
 * Login with email + password.
 * @param {object} payload - { email, password }
 */
async function login(payload) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    headers: jsonHeaders(false),
    body: JSON.stringify(payload),
  });
  _saveSession(data.user, data.token);
  return data;
}

/**
 * Fetch the currently logged-in user from the server.
 */
async function getMe() {
  const data = await apiFetch('/auth/me', {
    method: 'GET',
    headers: jsonHeaders(),
  });
  return data.data;
}

/** Remove all auth/session keys from both localStorage and sessionStorage */
function clearSessionStorage() {
  AUTH_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

/** Clear all stored session data and redirect to login */
function logout(redirectTo = '../login/login.html') {
  clearSessionStorage();
  window.location.href = redirectTo;
}

/** Returns true if the user is currently logged in */
function isLoggedIn() {
  return !!localStorage.getItem('fh_token');
}

/** Returns the stored user object (parsed JSON) */
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('fh_user')) || null;
  } catch {
    return null;
  }
}

// ── Private helpers ───────────────────────────────────────────────────────────
function _saveSession(user, token) {
  clearSessionStorage();
  if (token) {
    localStorage.setItem('fh_token', token);
  }
  if (user) {
    localStorage.setItem('fh_user', JSON.stringify(user));
    localStorage.setItem('fh_loggedIn', 'true');
    localStorage.setItem('fh_role', user.role);
    localStorage.setItem('currentUser', user.email);
  }
}

export { register, login, getMe, logout, isLoggedIn, getCurrentUser, clearSessionStorage, AUTH_STORAGE_KEYS };
