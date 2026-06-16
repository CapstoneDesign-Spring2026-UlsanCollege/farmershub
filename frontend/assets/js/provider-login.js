import { apiFetch, jsonHeaders } from './config/api.config.js';
import { getProviderProfile } from './services/providerService.js';
import { clearSessionStorage, saveSession } from './services/authService.js';

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

const ROLE_MESSAGES = {
  customer: 'This account is registered as a customer. Please use the Customer sign-in experience.',
  farmer: 'This account is registered as a farmer. Please use the Farmer sign-in experience.',
  admin: 'This account is registered as an admin. Provider Portal access requires a provider account.',
};

let isSubmitting = false;

function setStatus(message, tone = '') {
  const status = document.getElementById('providerLoginStatus');
  if (!status) return;
  status.textContent = message || '';
  status.dataset.tone = tone;
}

function getSafeNextPage() {
  const next = new URLSearchParams(window.location.search).get('next') || '';
  const page = next.split(/[?#]/)[0];
  return PROVIDER_PAGES.has(page) ? page : 'provider-dashboard.html';
}

function extractSession(response) {
  const session = response?.data || response || {};
  return {
    token: session.token || '',
    user: session.user || null,
  };
}

function wrongRoleMessage(role) {
  return ROLE_MESSAGES[role] || 'Provider Portal access requires a provider account.';
}

async function resolveDestination() {
  const nextPage = getSafeNextPage();
  try {
    const profileResponse = await getProviderProfile();
    const profile = profileResponse?.data || profileResponse?.profile || profileResponse;
    if (profile && profile.isOnboarded === false) {
      return 'provider-onboarding.html';
    }
  } catch {
    return nextPage;
  }
  return nextPage;
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  if (isSubmitting) return;

  const form = event.currentTarget;
  const submit = form.querySelector('button[type="submit"]');
  const emailInput = document.getElementById('providerLoginEmail');
  const email = String(new FormData(form).get('email') || '').trim();
  const password = String(new FormData(form).get('password') || '');

  if (!email || !password) {
    setStatus('Email address and password are required.', 'error');
    return;
  }

  if (emailInput && !emailInput.validity.valid) {
    setStatus('Enter a valid email address.', 'error');
    return;
  }

  isSubmitting = true;
  clearSessionStorage();
  if (submit) {
    submit.disabled = true;
    submit.dataset.defaultLabel = submit.dataset.defaultLabel || submit.textContent.trim();
    submit.textContent = 'Signing in...';
  }
  setStatus('Signing in...');

  try {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      headers: jsonHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    const { token, user } = extractSession(response);
    const role = user?.role;

    if (!token || !user) {
      clearSessionStorage();
      throw new Error('Login response did not include a valid provider session.');
    }

    if (role !== 'provider') {
      clearSessionStorage();
      setStatus(wrongRoleMessage(role), 'error');
      return;
    }

    saveSession(user, token);
    setStatus('Provider account confirmed. Opening your workspace...', 'success');
    const destination = await resolveDestination();

    if (window.FarmersHubIntro) {
      window.FarmersHubIntro.play({
        logoSrc: 'logo.png',
        text: 'FarmersHub',
        nextUrl: destination,
      });
    } else {
      window.location.href = destination;
    }
    return;
  } catch (error) {
    clearSessionStorage();
    setStatus(error.message || 'Unable to sign in. Please try again.', 'error');
  } finally {
    isSubmitting = false;
    if (submit) {
      submit.disabled = false;
      submit.textContent = submit.dataset.defaultLabel || 'Sign In';
    }
  }
}

function setupPasswordToggle() {
  const input = document.getElementById('providerLoginPassword');
  const toggle = document.getElementById('providerPasswordToggle');
  const label = toggle?.querySelector('span');
  if (!input || !toggle || !label) return;

  toggle.addEventListener('click', () => {
    const shouldShow = input.type === 'password';
    input.type = shouldShow ? 'text' : 'password';
    label.textContent = shouldShow ? 'Hide' : 'Show';
    toggle.setAttribute('aria-label', shouldShow ? 'Hide password' : 'Show password');
  });
}

document.getElementById('providerLoginForm')?.addEventListener('submit', handleLoginSubmit);
setupPasswordToggle();
