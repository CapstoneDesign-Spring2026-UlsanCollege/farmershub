import { getFarmers } from './js/farmerService.js';
import './assets/js/notification-float.js';

const grid = document.getElementById('farmersDirectory');
const countEl = document.getElementById('farmerCount');
const searchEl = document.getElementById('farmerSearch');
const loginBtn = document.getElementById('navLoginBtn');
const logoutBtn = document.getElementById('navLogoutBtn');

let allFarmers = [];

function escHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setupSessionNav() {
  const token = localStorage.getItem('fh_token');
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem('fh_user'));
  } catch {
    user = null;
  }

  if (!token) return;

  if (loginBtn) loginBtn.style.display = 'none';
  if (logoutBtn) {
    logoutBtn.style.display = 'inline-block';
    if (user?.fullName) {
      logoutBtn.textContent = 'Logout (' + user.fullName.split(' ')[0] + ')';
    }
    logoutBtn.addEventListener('click', () => {
      ['fh_token', 'farmershub_token', 'fh_user', 'fh_loggedIn', 'fh_role', 'currentUser'].forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      window.location.reload();
    });
  }
}

function getSearchText(farmer) {
  return [
    farmer.fullName,
    farmer.location,
    farmer.address,
    farmer.bio,
    farmer.farmType,
    farmer.productsLabel,
    Array.isArray(farmer.cropTypes) ? farmer.cropTypes.join(' ') : '',
  ].join(' ').toLowerCase();
}

function renderFarmers(farmers) {
  if (!grid || !countEl) return;

  countEl.textContent = farmers.length === 1 ? '1 farmer' : `${farmers.length} farmers`;

  if (!farmers.length) {
    grid.innerHTML = '<div class="empty-panel">No farmers match this view.</div>';
    return;
  }

  grid.innerHTML = '';
  farmers.forEach((farmer) => {
    const profileHref = `profile.html?id=${encodeURIComponent(farmer.id)}`;
    const location = farmer.location || farmer.address || 'Location not set';
    const specialty = farmer.bio || farmer.farmType || farmer.productsLabel || 'Fresh produce from local farms';
    const card = document.createElement('article');
    card.className = 'directory-card';
    card.innerHTML = `
      <div class="directory-avatar">${escHtml((farmer.fullName || 'F').charAt(0).toUpperCase())}</div>
      <div class="directory-card-body">
        <h4>${escHtml(farmer.fullName || 'Unnamed farmer')}</h4>
        <p class="directory-location">${escHtml(location)}</p>
        <p class="directory-specialty">${escHtml(specialty)}</p>
        <a class="mini-link" href="${profileHref}">View profile</a>
      </div>
    `;
    card.addEventListener('click', (event) => {
      if (event.target.closest('a')) return;
      window.location.href = profileHref;
    });
    grid.appendChild(card);
  });
}

function applySearch() {
  const term = (searchEl?.value || '').trim().toLowerCase();
  const filtered = term
    ? allFarmers.filter((farmer) => getSearchText(farmer).includes(term))
    : allFarmers;
  renderFarmers(filtered);
}

async function loadFarmers() {
  if (!grid || !countEl) return;
  grid.innerHTML = '<div class="empty-panel">Loading farmers...</div>';
  countEl.textContent = 'Loading...';

  try {
    const response = await getFarmers({ limit: 100 });
    allFarmers = response.data || [];
    applySearch();
  } catch (error) {
    countEl.textContent = 'Unavailable';
    grid.innerHTML = `<div class="empty-panel">${escHtml(error.message || 'Please make sure the backend is running.')}</div>`;
  }
}

setupSessionNav();
searchEl?.addEventListener('input', applySearch);
loadFarmers();
