import { getProfile } from './services/profileService.js';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

function clearSessionAndLogout() {
  ['fh_token', 'fh_user', 'fh_loggedIn', 'fh_role', 'currentUser'].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  window.location.href = 'login/login.html';
}

function renderGate(title, text, actionHtml = '') {
  const state = document.getElementById('settingsState');
  state.hidden = false;
  state.innerHTML = `
    <h2>${escapeHtml(title)}</h2>
    <p>${escapeHtml(text)}</p>
    ${actionHtml}
  `;
  document.getElementById('settingsProfile').hidden = true;
}

function setText(id, value) {
  document.getElementById(id).textContent = value || 'Not provided';
}

function renderProfile(profile) {
  document.getElementById('settingsState').hidden = true;
  const panel = document.getElementById('settingsProfile');
  panel.hidden = false;

  const fullName = profile.fullName || profile.name || 'Farmer';
  const farmName = profile.farmName || profile.products || 'Farm identity not completed';
  const avatarUrl = profile.avatarUrl || '';
  const avatar = document.getElementById('settingsAvatar');

  if (avatarUrl) {
    avatar.style.backgroundImage = `url('${avatarUrl}')`;
  }

  setText('settingsName', fullName);
  setText('settingsFarm', farmName);
  setText('settingsEmail', profile.email || '');
  setText('settingsRole', profile.role || 'farmer');
  setText('settingsLocation', profile.location || profile.address || profile.farmLocation || '');
  setText('settingsProducts', profile.products || (Array.isArray(profile.cropTypes) ? profile.cropTypes.join(', ') : ''));
}

async function loadSettings() {
  if (!localStorage.getItem('fh_token')) {
    renderGate(
      'Login required',
      'Settings are private to your authenticated account.',
      '<div class="workspace-card-actions"><a class="workspace-primary" href="login/login.html">Login</a></div>'
    );
    return;
  }

  try {
    const response = await getProfile();
    renderProfile(response.data || {});
  } catch (error) {
    renderGate('Settings unavailable', error.message || 'Log in again to load your account settings.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('logoutBtn').addEventListener('click', clearSessionAndLogout);
  loadSettings();
});
