import { register, login, clearSessionStorage } from './services/authService.js';
import { setStatus } from './provider-shell.js';

function formValue(form, name) {
  return String(new FormData(form).get(name) || '').trim();
}

async function handleProviderAuth(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const mode = document.body.dataset.providerAuthMode || 'login';
  const status = document.getElementById('providerAuthStatus');
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  setStatus(status, mode === 'register' ? 'Creating provider account...' : 'Signing in...');

  try {
    if (mode === 'register') {
      const response = await register({
        fullName: formValue(form, 'fullName'),
        email: formValue(form, 'email'),
        password: formValue(form, 'password'),
        phone: formValue(form, 'phone'),
        address: formValue(form, 'address'),
        role: 'provider',
      });
      const user = response?.data?.user || response?.user;
      if (!user || user.role !== 'provider') {
        clearSessionStorage();
        throw new Error('Provider role was not returned by the server.');
      }
      window.location.href = 'provider-onboarding.html';
      return;
    }

    const response = await login({
      email: formValue(form, 'email'),
      password: formValue(form, 'password'),
    });
    const user = response?.data?.user || response?.user;
    if (!user || user.role !== 'provider') {
      clearSessionStorage();
      throw new Error('Use a provider account for the Provider Portal.');
    }

    const next = new URLSearchParams(window.location.search).get('next') || 'provider-dashboard.html';
    window.location.href = next;
  } catch (error) {
    setStatus(status, error.message || 'Authentication failed.', 'error');
  } finally {
    submit.disabled = false;
  }
}

document.getElementById('providerAuthForm')?.addEventListener('submit', handleProviderAuth);
