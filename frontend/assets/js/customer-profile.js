import { getProfile } from './services/profileService.js';
import {
  getDisplayName,
  getInitials,
  getStoredUser,
  getToken,
  hydrateCustomerShell,
  logoutCustomer,
  setStatus,
} from './customer-shell.js';

const profileName = document.getElementById('profileName');
const profileSummary = document.getElementById('profileSummary');
const profileDetails = document.getElementById('profileDetails');
const profileStatus = document.getElementById('profileStatus');
const avatarLarge = document.getElementById('profileAvatarLarge');
const logoutBtn = document.getElementById('profileLogoutBtn');
const searchForm = document.getElementById('profileSearchForm');
const searchInput = document.getElementById('profileSearchInput');

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
  profileDetails.appendChild(item);
}

function normalizeProfile(profile = {}) {
  const stored = getStoredUser() || {};
  return {
    fullName: profile.fullName || stored.fullName || stored.name || '',
    email: profile.email || stored.email || '',
    phone: profile.phone || stored.phone || '',
    role: profile.role || stored.role || 'customer',
    location: profile.location || profile.address || stored.location || stored.address || '',
    bio: profile.bio || '',
    avatarUrl: profile.avatarUrl || stored.avatarUrl || stored.profileImage || '',
  };
}

function renderProfile(profile, sourceLabel) {
  const normalized = normalizeProfile(profile);
  const displayName = getDisplayName(normalized);
  profileName.textContent = displayName;
  profileSummary.textContent = normalized.role === 'customer'
    ? 'Customer shopping profile for marketplace, messages and saved products.'
    : 'Customer page showing account-safe profile details only.';

  avatarLarge.textContent = getInitials(displayName);
  if (normalized.avatarUrl) {
    avatarLarge.textContent = '';
    avatarLarge.style.backgroundImage = `url("${normalized.avatarUrl}")`;
    avatarLarge.setAttribute('role', 'img');
    avatarLarge.setAttribute('aria-label', `${displayName} profile picture`);
  }

  profileDetails.innerHTML = '';
  addDetail('Full name', normalized.fullName);
  addDetail('Email', normalized.email || 'Not available');
  addDetail('Role', normalized.role || 'customer');
  addDetail('Phone', normalized.phone);
  addDetail('Location', normalized.location);
  addDetail('Bio', normalized.bio);

  setStatus(profileStatus, sourceLabel);
}

async function loadProfile() {
  hydrateCustomerShell();
  const stored = getStoredUser();

  if (!getToken()) {
    renderProfile(stored || {}, stored ? 'Showing locally stored session details.' : 'Log in to load your customer profile.');
    return;
  }

  try {
    const response = await getProfile();
    renderProfile(response.data || {}, 'Profile loaded from the authenticated account.');
  } catch (error) {
    renderProfile(stored || {}, error.message || 'Unable to load profile; showing stored session details.');
    setStatus(profileStatus, error.message || 'Unable to load profile; showing stored session details.', 'error');
  }
}

logoutBtn?.addEventListener('click', () => logoutCustomer('login/login.html'));

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = String(searchInput?.value || '').trim();
  const params = new URLSearchParams();
  if (query) params.set('search', query);
  window.location.href = `customer-marketplace.html${params.toString() ? `?${params.toString()}` : ''}`;
});

loadProfile();
