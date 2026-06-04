import { apiFetch } from './apiClient.js';

export function getProviderProfile() {
  return apiFetch('/providers/profile');
}

export function updateProviderProfile(payload) {
  return apiFetch('/providers/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function getProviderPublicProfile(id) {
  return apiFetch(`/providers/${encodeURIComponent(id)}`);
}
