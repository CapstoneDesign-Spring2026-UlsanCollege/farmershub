import { apiFetch, jsonHeaders } from '../config/api.config.js';

const AUTH_STORAGE_KEYS = ['fh_token', 'fh_user', 'fh_loggedIn', 'fh_role', 'currentUser'];

async function register(payload) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    headers: jsonHeaders(false),
    body: JSON.stringify(payload),
  });
  const session = data?.data || data;
  _saveSession(session.user, session.token);
  return data;
}

async function login(payload) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    headers: jsonHeaders(false),
    body: JSON.stringify(payload),
  });
  const session = data?.data || data;
  _saveSession(session.user, session.token);
  return data;
}

async function getMe() {
  const data = await apiFetch('/auth/me', {
    method: 'GET',
    headers: jsonHeaders(),
  });
  return data.data;
}

function clearSessionStorage() {
  AUTH_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

function logout(redirectTo = '../login/login.html') {
  clearSessionStorage();
  window.location.href = redirectTo;
}

function isLoggedIn() {
  return !!localStorage.getItem('fh_token');
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('fh_user')) || null;
  } catch {
    return null;
  }
}

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
