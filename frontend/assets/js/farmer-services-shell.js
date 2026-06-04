import { getToken, apiFetch, jsonHeaders } from './config/api.config.js';
import { getCurrentUser, logout } from './services/authService.js';

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value ?? '';
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name) || '';
}

function formatDate(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatMoney(value) {
  const amount = Number(value || 0);
  if (!amount) return 'Quote required';
  return `₩${amount.toLocaleString()}`;
}

function humanize(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function setStatus(elementOrId, message, tone = '') {
  const element = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
  if (!element) return;
  element.textContent = message || '';
  element.dataset.tone = tone;
}

function clearElement(element) {
  if (!element) return;
  while (element.firstChild) element.removeChild(element.firstChild);
}

function createStateCard(title, copy, tone = '') {
  const card = document.createElement('article');
  card.className = 'farmer-service-state';
  if (tone) card.dataset.tone = tone;
  const heading = document.createElement('h2');
  heading.textContent = title;
  const paragraph = document.createElement('p');
  paragraph.textContent = copy;
  card.append(heading, paragraph);
  return card;
}

function renderAccessDenied(message = 'This services marketplace is only available to farmer accounts.') {
  const main = document.querySelector('main') || document.body;
  clearElement(main);
  main.appendChild(createStateCard('Access unavailable', message, 'error'));
}

async function fetchCurrentUser() {
  const data = await apiFetch('/auth/me', {
    method: 'GET',
    headers: jsonHeaders(),
  });
  return data.data || data.user || data;
}

async function requireFarmer() {
  const token = getToken();
  if (!token) {
    window.location.href = 'login/login.html';
    throw new Error('Farmer login required');
  }

  let user = getCurrentUser();
  if (!user) {
    user = await fetchCurrentUser();
  }

  if (!user || user.role !== 'farmer') {
    renderAccessDenied('Use a farmer account to open farm service marketplace pages.');
    throw new Error('Farmer role required');
  }

  setText('farmerServiceUserName', user.fullName || 'Farmer');
  document.querySelectorAll('[data-farmer-service-logout]').forEach((button) => {
    button.addEventListener('click', () => logout('login/login.html'));
  });
  markActiveFarmerServiceNav();
  return user;
}

function markActiveFarmerServiceNav() {
  const page = window.location.pathname.split('/').pop() || 'farmer-services-marketplace.html';
  document.querySelectorAll('[data-farmer-service-nav] a').forEach((link) => {
    const active = link.getAttribute('href') === page;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function appendField(parent, label, value) {
  const row = document.createElement('div');
  row.className = 'farmer-service-field-row';
  const key = document.createElement('span');
  key.textContent = label;
  const val = document.createElement('strong');
  val.textContent = value || 'Not set';
  row.append(key, val);
  parent.appendChild(row);
}

export {
  requireFarmer,
  setText,
  getQueryParam,
  formatDate,
  formatMoney,
  humanize,
  setStatus,
  clearElement,
  createStateCard,
  appendField,
};
