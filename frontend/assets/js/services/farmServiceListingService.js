import { apiFetch, jsonHeaders } from '../config/api.config.js';

function buildQuery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      qs.set(key, value);
    }
  });
  const value = qs.toString();
  return value ? `?${value}` : '';
}

async function getFarmServiceListings(params = {}) {
  return apiFetch(`/farm-service-listings${buildQuery(params)}`, {
    method: 'GET',
    headers: jsonHeaders(),
  });
}

async function getFarmServiceListingById(id) {
  return apiFetch(`/farm-service-listings/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: jsonHeaders(),
  });
}

async function createFarmServiceListing(payload) {
  return apiFetch('/farm-service-listings', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
}

async function updateFarmServiceListing(id, payload) {
  return apiFetch(`/farm-service-listings/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
}

async function setFarmServiceListingActive(id, isActive) {
  return apiFetch(`/farm-service-listings/${encodeURIComponent(id)}/${isActive ? 'activate' : 'deactivate'}`, {
    method: 'PUT',
    headers: jsonHeaders(),
  });
}

export {
  getFarmServiceListings,
  getFarmServiceListingById,
  createFarmServiceListing,
  updateFarmServiceListing,
  setFarmServiceListingActive,
};
