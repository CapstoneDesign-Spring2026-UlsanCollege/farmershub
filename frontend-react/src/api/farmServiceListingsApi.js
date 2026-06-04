import { apiFetch, buildQuery } from './apiClient.js';

export function getFarmServiceListings(params = {}) {
  return apiFetch(`/farm-service-listings${buildQuery(params)}`);
}

export function getFarmServiceListingById(id) {
  return apiFetch(`/farm-service-listings/${encodeURIComponent(id)}`);
}

export function createFarmServiceListing(payload) {
  return apiFetch('/farm-service-listings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateFarmServiceListing(id, payload) {
  return apiFetch(`/farm-service-listings/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function setFarmServiceListingActive(id, isActive) {
  return apiFetch(`/farm-service-listings/${encodeURIComponent(id)}/${isActive ? 'activate' : 'deactivate'}`, {
    method: 'PUT',
  });
}
