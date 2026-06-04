import { useState } from 'react';
import { login as loginRequest, register as registerRequest, getMe } from '../api/authApi.js';
import { clearSessionStorage, readSession, saveSession } from './sessionStorage.js';
import { AuthContext } from './AuthContext.js';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const [authError, setAuthError] = useState('');

  async function login(payload) {
    setAuthError('');
    const data = await loginRequest(payload);
    const next = saveSession(data);
    setSession({ ...next, isAuthenticated: Boolean(next.token) });
    return data;
  }

  async function register(payload) {
    setAuthError('');
    const data = await registerRequest(payload);
    if (data?.token || data?.data?.token) {
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
