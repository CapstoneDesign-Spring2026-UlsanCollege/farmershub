import { getProfile } from './services/profileService.js';
import { apiFetch, jsonHeaders } from './config/api.config.js';
import {
  clearCustomerSession,
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
const addressList = document.getElementById('addressList');
const addressForm = document.getElementById('addressForm');
const addressStatus = document.getElementById('addressStatus');
const addressSaveBtn = document.getElementById('addressSaveBtn');
const addressCancelBtn = document.getElementById('addressCancelBtn');
const passwordForm = document.getElementById('passwordForm');
const passwordStatus = document.getElementById('passwordStatus');
const passwordSaveBtn = document.getElementById('passwordSaveBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const deleteConfirmation = document.getElementById('deleteConfirmation');
const deleteAccountStatus = document.getElementById('deleteAccountStatus');

let addresses = [];

const addressFields = {
  id: document.getElementById('addressId'),
  label: document.getElementById('addressLabel'),
  fullName: document.getElementById('addressFullName'),
  phone: document.getElementById('addressPhone'),
  addressLine1: document.getElementById('addressLine1'),
  addressLine2: document.getElementById('addressLine2'),
  city: document.getElementById('addressCity'),
  region: document.getElementById('addressRegion'),
  postalCode: document.getElementById('addressPostalCode'),
  country: document.getElementById('addressCountry'),
  isDefault: document.getElementById('addressIsDefault'),
};

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

function addressId(address) {
  return String(address?._id || address?.id || '');
}

function resetAddressForm() {
  addressForm.reset();
  addressFields.id.value = '';
  addressFields.country.value = 'Nepal';
  addressSaveBtn.textContent = 'Add address';
  addressCancelBtn.hidden = true;
}

function addressPayload() {
  return {
    label: addressFields.label.value.trim(),
    fullName: addressFields.fullName.value.trim(),
    phone: addressFields.phone.value.trim(),
    addressLine1: addressFields.addressLine1.value.trim(),
    addressLine2: addressFields.addressLine2.value.trim(),
    city: addressFields.city.value.trim(),
    region: addressFields.region.value.trim(),
    postalCode: addressFields.postalCode.value.trim(),
    country: addressFields.country.value.trim(),
    isDefault: addressFields.isDefault.checked,
  };
}

function renderAddresses() {
  addressList.innerHTML = '';
  if (!addresses.length) {
    const empty = document.createElement('div');
    empty.className = 'customer-state customer-empty';
    const title = document.createElement('strong');
    title.textContent = 'No saved delivery addresses';
    const copy = document.createElement('p');
    copy.textContent = 'Add your first address using the form below.';
    empty.append(title, copy);
    addressList.appendChild(empty);
    return;
  }

  addresses.forEach((address) => {
    const card = document.createElement('article');
    card.className = 'address-card';
    card.dataset.id = addressId(address);
    const heading = document.createElement('div');
    heading.className = 'address-card-heading';
    const title = document.createElement('strong');
    title.textContent = address.label || address.fullName || 'Delivery address';
    heading.appendChild(title);
    if (address.isDefault) {
      const badge = document.createElement('span');
      badge.className = 'customer-pill';
      badge.textContent = 'Default';
      heading.appendChild(badge);
    }

    const lines = document.createElement('p');
    lines.textContent = [
      address.fullName,
      address.phone,
      address.addressLine1,
      address.addressLine2,
      [address.city, address.region, address.postalCode].filter(Boolean).join(', '),
      address.country,
    ].filter(Boolean).join(' | ');

    const actions = document.createElement('div');
    actions.className = 'settings-actions';
    [
      ['edit', 'Edit'],
      ...(!address.isDefault ? [['default', 'Make default']] : []),
      ['delete', 'Delete'],
    ].forEach(([action, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.action = action;
      button.className = action === 'delete' ? 'customer-danger-button' : 'customer-secondary-button';
      button.textContent = label;
      actions.appendChild(button);
    });

    card.append(heading, lines, actions);
    addressList.appendChild(card);
  });
}

async function loadAddresses() {
  if (!getToken()) {
    setStatus(addressStatus, 'Log in to manage addresses.', 'error');
    addressForm.hidden = true;
    renderAddresses();
    return;
  }
  setStatus(addressStatus, 'Loading addresses...');
  try {
    const response = await apiFetch('/users/me/addresses', { headers: jsonHeaders() });
    addresses = response.data || [];
    renderAddresses();
    setStatus(addressStatus, addresses.length ? 'Addresses loaded.' : 'No addresses saved yet.');
  } catch (error) {
    setStatus(addressStatus, error.message || 'Unable to load addresses.', 'error');
  }
}

addressForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = addressFields.id.value;
  addressSaveBtn.disabled = true;
  setStatus(addressStatus, id ? 'Updating address...' : 'Adding address...');
  try {
    const response = await apiFetch(id ? `/users/me/addresses/${encodeURIComponent(id)}` : '/users/me/addresses', {
      method: id ? 'PUT' : 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(addressPayload()),
    });
    addresses = response.data || [];
    resetAddressForm();
    renderAddresses();
    setStatus(addressStatus, response.message || 'Address saved.', 'success');
  } catch (error) {
    setStatus(addressStatus, error.message || 'Unable to save address.', 'error');
  } finally {
    addressSaveBtn.disabled = false;
  }
});

addressCancelBtn?.addEventListener('click', resetAddressForm);

addressList?.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  const card = event.target.closest('.address-card');
  if (!button || !card) return;
  const id = card.dataset.id;
  const address = addresses.find((item) => addressId(item) === id);
  if (!address) return;

  if (button.dataset.action === 'edit') {
    Object.entries(addressFields).forEach(([field, input]) => {
      if (field === 'id') input.value = id;
      else if (field === 'isDefault') input.checked = Boolean(address.isDefault);
      else input.value = address[field] || '';
    });
    addressSaveBtn.textContent = 'Update address';
    addressCancelBtn.hidden = false;
    addressForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  if (button.dataset.action === 'delete' && !window.confirm('Delete this saved address?')) return;
  button.disabled = true;
  try {
    const path = button.dataset.action === 'default'
      ? `/users/me/addresses/${encodeURIComponent(id)}/default`
      : `/users/me/addresses/${encodeURIComponent(id)}`;
    const response = await apiFetch(path, {
      method: button.dataset.action === 'default' ? 'PATCH' : 'DELETE',
      headers: jsonHeaders(),
    });
    addresses = response.data || [];
    renderAddresses();
    setStatus(addressStatus, response.message, 'success');
  } catch (error) {
    setStatus(addressStatus, error.message || 'Unable to update address.', 'error');
    button.disabled = false;
  }
});

passwordForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  if (newPassword !== confirmPassword) {
    setStatus(passwordStatus, 'New password confirmation does not match.', 'error');
    return;
  }

  passwordSaveBtn.disabled = true;
  setStatus(passwordStatus, 'Changing password...');
  try {
    const response = await apiFetch('/users/me/password', {
      method: 'PATCH',
      headers: jsonHeaders(),
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
    passwordForm.reset();
    setStatus(passwordStatus, response.message, 'success');
  } catch (error) {
    setStatus(passwordStatus, error.message || 'Unable to change password.', 'error');
  } finally {
    passwordSaveBtn.disabled = false;
  }
});

deleteAccountBtn?.addEventListener('click', async () => {
  if (deleteConfirmation.value !== 'DELETE') {
    setStatus(deleteAccountStatus, 'Type DELETE exactly to confirm.', 'error');
    return;
  }
  if (!window.confirm('Deactivate your FarmersHub account now?')) return;

  deleteAccountBtn.disabled = true;
  setStatus(deleteAccountStatus, 'Deactivating account...');
  try {
    await apiFetch('/users/me', {
      method: 'DELETE',
      headers: jsonHeaders(),
      body: JSON.stringify({ confirmation: 'DELETE' }),
    });
    clearCustomerSession();
    window.location.href = 'login/login.html';
  } catch (error) {
    setStatus(deleteAccountStatus, error.message || 'Unable to delete account.', 'error');
    deleteAccountBtn.disabled = false;
  }
});

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
loadAddresses();
