import { apiFetch } from './apiClient.js';

export function getProfile() {
  return apiFetch('/users/profile');
}

export function updateProfile(payload) {
  return apiFetch('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
