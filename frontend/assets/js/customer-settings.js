import { getProfile } from './services/profileService.js';
import {
  getCustomerPreferences,
  getStoredUser,
  getToken,
  hydrateCustomerShell,
  logoutCustomer,
  saveCustomerPreferences,
  setStatus,
} from './customer-shell.js';

const details = document.getElementById('settingsAccountDetails');
const logoutBtn = document.getElementById('settingsLogoutBtn');
const reducedMotionToggle = document.getElementById('reducedMotionToggle');
const largerTextToggle = document.getElementById('largerTextToggle');
const preferenceStatus = document.getElementById('settingsPreferenceStatus');
const searchForm = document.getElementById('settingsSearchForm');
const searchInput = document.getElementById('settingsSearchInput');

function valueOrPending(value) {
  return value === undefined || value === null || value === '' ? 'Not added yet' : String(value);
}

function addDetail(label, value) {
  const item = document.createElement('div');
  const term = document.createElement('dt');
  const detail = document.createElement('dd');
  term.textContent = label;
  detail.textContent = valueOrPending(value);
  item.append(term, detail);
  details.appendChild(item);
}

function renderAccount(profile = {}, source = '') {
  const stored = getStoredUser() || {};
  details.innerHTML = '';
  addDetail('Name', profile.fullName || stored.fullName || stored.name);
  addDetail('Email', profile.email || stored.email || 'Not available');
  addDetail('Role', profile.role || stored.role || 'customer');
  addDetail('Location', profile.location || profile.address || stored.location || stored.address);
  if (source) {
    addDetail('Source', source);
  }
}

async function loadAccount() {
  hydrateCustomerShell();
  const stored = getStoredUser();
  renderAccount(stored || {}, getToken() ? 'Stored session' : 'Local session only');

  if (!getToken()) return;

  try {
    const response = await getProfile();
    renderAccount(response.data || {}, 'Authenticated profile');
  } catch {
    renderAccount(stored || {}, 'Stored session fallback');
  }
}

function hydratePreferenceControls() {
  const preferences = getCustomerPreferences();
  reducedMotionToggle.checked = Boolean(preferences.reducedMotion);
  largerTextToggle.checked = Boolean(preferences.largerText);
}

function savePreferences() {
  saveCustomerPreferences({
    reducedMotion: reducedMotionToggle.checked,
    largerText: largerTextToggle.checked,
  });
  setStatus(preferenceStatus, 'Display preferences saved on this device.', 'success');
}

logoutBtn?.addEventListener('click', () => logoutCustomer('login/login.html'));
reducedMotionToggle?.addEventListener('change', savePreferences);
largerTextToggle?.addEventListener('change', savePreferences);

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = String(searchInput?.value || '').trim();
  const params = new URLSearchParams();
  if (query) params.set('search', query);
  window.location.href = `customer-marketplace.html${params.toString() ? `?${params.toString()}` : ''}`;
});

hydratePreferenceControls();
loadAccount();
