import { apiFetch, jsonHeaders, authHeader } from '../config/api.config.js';

async function getProfile() {
  return apiFetch('/users/profile', { headers: jsonHeaders() });
}

async function updateProfile(updates) {
  return apiFetch('/users/profile', {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(updates),
  });
}

async function updateFarmerProfile(updates) {
  return apiFetch('/farmers/profile', {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(updates),
  });
}

async function uploadAvatar(file) {
  const form = new FormData();
  form.append('avatar', file);
  return apiFetch('/users/avatar', {
    method: 'POST',
    headers: authHeader(),
    body: form,
  });
}

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
