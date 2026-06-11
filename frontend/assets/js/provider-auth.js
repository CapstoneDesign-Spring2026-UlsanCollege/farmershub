import { register, login, clearSessionStorage } from './services/authService.js';
import { setStatus } from './provider-shell.js';

const PROVIDER_PAGES = new Set([
  'provider-dashboard.html',
  'provider-onboarding.html',
  'provider-listings.html',
  'provider-listing-form.html',
  'provider-requests.html',
  'provider-request-detail.html',
  'provider-messages.html',
  'provider-notifications.html',
  'provider-profile.html',
  'provider-settings.html',
  'provider-help.html',
]);

function formValue(form, name) {
  return String(new FormData(form).get(name) || '').trim();
}

function getSafeNextPage() {
  const next = new URLSearchParams(window.location.search).get('next') || '';
  const page = next.split(/[?#]/)[0];
  return PROVIDER_PAGES.has(page) ? page : 'provider-dashboard.html';
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

    window.location.href = getSafeNextPage();
  } catch (error) {
    setStatus(status, error.message || 'Authentication failed.', 'error');
  } finally {
    submit.disabled = false;
  }
}

document.getElementById('providerAuthForm')?.addEventListener('submit', handleProviderAuth);
