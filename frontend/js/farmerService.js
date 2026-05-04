/**
 * farmerService.js
 * Fetch farmer listings and individual farmer profiles.
 */
import { apiFetch } from './api.config.js';

/**
 * Get paginated list of farmers.
 * @param {object} params - { search, location, page, limit }
 */
async function getFarmers(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/farmers${qs ? '?' + qs : ''}`);
}

/** Get a single farmer's profile (with their products + posts) */
async function getFarmerById(id) {
  return apiFetch(`/farmers/${id}`);
}

export { getFarmers, getFarmerById };
