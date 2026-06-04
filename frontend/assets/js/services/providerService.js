import { apiFetch, jsonHeaders } from '../config/api.config.js';

async function getProviderProfile() {
  return apiFetch('/providers/profile', {
    method: 'GET',
    headers: jsonHeaders(),
  });
}

async function updateProviderProfile(updates) {
  return apiFetch('/providers/profile', {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(updates),
  });
}

async function getProviderPublicProfile(providerId) {
  return apiFetch(`/providers/${encodeURIComponent(providerId)}`, {
    method: 'GET',
    headers: jsonHeaders(),
  });
}

export { getProviderProfile, updateProviderProfile, getProviderPublicProfile };
