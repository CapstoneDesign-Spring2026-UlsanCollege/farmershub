export const AUTH_STORAGE_KEYS = ['fh_token', 'farmershub_token', 'fh_user', 'fh_loggedIn', 'fh_role', 'currentUser'];

export function readJsonStorage(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function getToken() {
  return window.localStorage.getItem('fh_token') || window.localStorage.getItem('farmershub_token') || '';
}

export function getStoredUser() {
  return readJsonStorage('fh_user', null);
}

export function getStoredRole() {
  return window.localStorage.getItem('fh_role') || getStoredUser()?.role || '';
}

export function saveSession(data = {}) {
  const token = data.token || data.data?.token || '';
  const user = data.user || data.data?.user || data.data || null;

  if (token) {
    window.localStorage.setItem('fh_token', token);
    window.localStorage.setItem('farmershub_token', token);
  }

  if (user) {
    window.localStorage.setItem('fh_user', JSON.stringify(user));
    window.localStorage.setItem('fh_loggedIn', 'true');
    window.localStorage.setItem('fh_role', user.role || '');
    window.localStorage.setItem('currentUser', user.email || '');
  }

  return { token: token || getToken(), user, role: user?.role || getStoredRole() };
}

export function clearSessionStorage() {
  AUTH_STORAGE_KEYS.forEach((key) => {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  });
}

export function readSession() {
  const token = getToken();
  const user = getStoredUser();
  const role = getStoredRole();
  return { token, user, role, isAuthenticated: Boolean(token) };
}
