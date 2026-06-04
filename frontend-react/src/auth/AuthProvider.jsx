import { useState } from 'react';
import { login as loginRequest, register as registerRequest, getMe } from '../api/authApi.js';
import { clearSessionStorage, readSession, saveSession } from './sessionStorage.js';
import { AuthContext } from './AuthContext.js';

function getResponseUser(data) {
  return data?.user || data?.data?.user || data?.data || null;
}

function createRoleMismatchError(actualRole, expectedRole) {
  const error = new Error(`This account is registered as ${actualRole || 'unknown'}. Pick the correct role.`);
  error.code = 'ROLE_MISMATCH';
  error.actualRole = actualRole || '';
  error.expectedRole = expectedRole;
  return error;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const [authError, setAuthError] = useState('');

  async function login(payload, options = {}) {
    setAuthError('');
    const data = await loginRequest(payload);
    const user = getResponseUser(data);
    if (options.expectedRole && user?.role !== options.expectedRole) {
      throw createRoleMismatchError(user?.role, options.expectedRole);
    }
    const next = saveSession(data);
    setSession({ ...next, isAuthenticated: Boolean(next.token) });
    return data;
  }

  async function register(payload, options = {}) {
    setAuthError('');
    const data = await registerRequest(payload);
    const user = getResponseUser(data);
    if (options.expectedRole && user?.role !== options.expectedRole) {
      throw createRoleMismatchError(user?.role, options.expectedRole);
    }
    if (options.persistSession && (data?.token || data?.data?.token)) {
      const next = saveSession(data);
      setSession({ ...next, isAuthenticated: Boolean(next.token) });
    }
    return data;
  }

  async function refreshUser() {
    if (!session.token) return null;
    try {
      const data = await getMe();
      const user = data.user || data.data?.user || data.data;
      if (user) {
        const next = saveSession({ token: session.token, user });
        setSession({ ...next, isAuthenticated: true });
      }
      return user;
    } catch (error) {
      setAuthError(error.message || 'Unable to refresh session.');
      return null;
    }
  }

  function logout() {
    clearSessionStorage();
    setSession({ token: '', user: null, role: '', isAuthenticated: false });
  }

  const value = {
    ...session,
    authError,
    login,
    register,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
