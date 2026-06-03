import { getProfile, uploadAvatar, uploadCover } from './services/profileService.js';
import { logout } from './services/authService.js';

const FALLBACK_TEXT = 'Not added yet';

function byId(id) {
  return document.getElementById(id);
}

function setText(id, value, fallback = FALLBACK_TEXT) {
  const element = byId(id);
  if (!element) return;
  const normalized = Array.isArray(value) ? value.filter(Boolean).join(', ') : value;
  element.textContent = normalized ? String(normalized) : fallback;
}

function setPanelState(title, text, showLoginAction = false) {
  const state = byId('settingsState');
  if (!state) return;

  state.hidden = false;
  state.replaceChildren();

  const heading = document.createElement('h2');
  heading.textContent = title;
  const copy = document.createElement('p');
  copy.textContent = text;
  state.append(heading, copy);

  if (showLoginAction) {
    const actions = document.createElement('div');
    actions.className = 'workspace-card-actions';
    const loginLink = document.createElement('a');
    loginLink.className = 'workspace-primary';
    loginLink.href = 'login/login.html';
    loginLink.textContent = 'Login';
    actions.append(loginLink);
    state.append(actions);
  }

  const summary = byId('settingsSummary');
  if (summary) summary.hidden = true;
}

function getInitials(profile) {
  const source = profile.fullName || profile.name || profile.farmName || 'FH';
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'FH';
}

function getProductsLabel(profile) {
  if (profile.products) return profile.products;
  if (Array.isArray(profile.cropTypes)) return profile.cropTypes;
  return '';
}

function setAvatarElement(element, imageUrl, initials) {
  if (!element) return;
  element.style.backgroundImage = '';
  element.textContent = initials;

  if (imageUrl) {
    element.style.backgroundImage = `url("${imageUrl}")`;
    element.textContent = '';
  }
}

function setPhotoPreview(id, imageUrl, initials) {
  const element = byId(id);
  if (!element) return;
  element.style.backgroundImage = '';
  element.textContent = initials;

  if (imageUrl) {
    element.style.backgroundImage = `url("${imageUrl}")`;
    element.textContent = '';
  }
}

function renderProfile(profile) {
  const state = byId('settingsState');
  const summary = byId('settingsSummary');
  if (state) state.hidden = true;
  if (summary) summary.hidden = false;

  const fullName = profile.fullName || profile.name || 'Farmer';
  const farmName = profile.farmName || 'Farm profile not completed';
  const role = profile.role || 'farmer';
  const location = profile.location || profile.address || profile.farmLocation || '';
  const products = getProductsLabel(profile);
  const email = profile.email || '';
  const bio = profile.bio || '';
  const initials = getInitials(profile);
  const avatarUrl = profile.avatarUrl || profile.avatar?.url || '';
  const coverUrl = profile.coverUrl || profile.coverImage?.url || '';

  const topIdentity = byId('topIdentity');
  if (topIdentity) topIdentity.hidden = false;

  setAvatarElement(byId('topAvatar'), avatarUrl, initials);
  setAvatarElement(byId('summaryAvatar'), avatarUrl, initials);
  setPhotoPreview('avatarPreview', avatarUrl, initials);
  setPhotoPreview('coverPreview', coverUrl, 'Cover');

  setText('topName', fullName, 'Farmer');
  setText('topEmail', email, 'Account identity');
  setText('summaryName', fullName, 'Farmer');
  setText('summaryFarm', farmName, 'Farm profile not completed');
  setText('summaryRole', role, 'farmer');
  setText('summaryLocation', location);
  setText('profileFullName', fullName);
  setText('profileFarmName', profile.farmName);
  setText('profileRole', role, 'farmer');
  setText('profileEmail', email, 'Not available');
  setText('profileLocation', location);
  setText('profileProducts', products);
  setText('profileBio', bio);
  setText('securityEmail', email, 'Not available');
  setText(
    'avatarStatus',
    avatarUrl ? 'Current uploaded profile picture is shown.' : 'Neutral placeholder shown until a real uploaded image is stored.'
  );
  setText(
    'coverStatus',
    coverUrl ? 'Current uploaded cover photo is shown.' : 'Neutral placeholder shown until a real uploaded image is stored.'
  );
}

function setUploadStatus(message) {
  setText('photoUploadStatus', message, '');
}

async function handlePhotoUpload(event, uploadFn, label) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    setUploadStatus(`Uploading ${label} through the existing profile media route...`);
    const response = await uploadFn(file);
    renderProfile(response.data || {});
    setUploadStatus(`${label} updated through the existing profile media route.`);
  } catch (error) {
    setUploadStatus(error.message || `${label} could not be updated.`);
  } finally {
    event.target.value = '';
  }
}

async function loadSettings() {
  if (!localStorage.getItem('fh_token')) {
    setPanelState('Login required', 'Settings are private to your authenticated account.', true);
    return;
  }

  try {
    const response = await getProfile();
    renderProfile(response.data || {});
  } catch (error) {
    setPanelState('Settings unavailable', error.message || 'Log in again to load your account settings.', true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const logoutButtons = [byId('logoutBtn'), byId('sectionLogoutBtn')].filter(Boolean);
  logoutButtons.forEach((button) => {
    button.addEventListener('click', () => logout('login/login.html'));
  });

  const avatarInput = byId('avatarInput');
  if (avatarInput) {
    avatarInput.addEventListener('change', (event) => handlePhotoUpload(event, uploadAvatar, 'Profile picture'));
  }

  const coverInput = byId('coverInput');
  if (coverInput) {
    coverInput.addEventListener('change', (event) => handlePhotoUpload(event, uploadCover, 'Cover photo'));
  }

  loadSettings();
});
