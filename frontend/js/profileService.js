/**
 * profileService.js
 * Get and update the logged-in user's profile, upload avatar.
 */
import { apiFetch, jsonHeaders, authHeader } from './api.config.js';

/** Fetch the current user's full profile from the database */
async function getProfile() {
  return apiFetch('/users/profile', { headers: jsonHeaders() });
}

/**
 * Update profile fields.
 * @param {object} updates - { fullName, phone, address, bio, paymentMethod, farmName, farmLocation, cropTypes }
 */
async function updateProfile(updates) {
  return apiFetch('/users/profile', {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(updates),
  });
}

/**
 * Update farmer-specific farm details.
 * @param {object} updates - { farmName, farmLocation, farmSizeAcres, cropTypes, bio }
 */
async function updateFarmerProfile(updates) {
  return apiFetch('/farmers/profile', {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(updates),
  });
}

/**
 * Upload a profile avatar image.
 * @param {File} file
 */
async function uploadAvatar(file) {
  const form = new FormData();
  form.append('avatar', file);
  return apiFetch('/users/avatar', {
    method: 'POST',
    headers: authHeader(),
    body: form,
  });
}

/**
 * Upload a profile cover image.
 * @param {File} file
 */
async function uploadCover(file) {
  const form = new FormData();
  form.append('cover', file);
  return apiFetch('/users/cover', {
    method: 'POST',
    headers: authHeader(),
    body: form,
  });
}

export { getProfile, updateProfile, updateFarmerProfile, uploadAvatar, uploadCover };
