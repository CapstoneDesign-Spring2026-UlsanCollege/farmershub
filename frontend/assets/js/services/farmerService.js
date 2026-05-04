import { apiFetch } from '../config/api.config.js';

async function getFarmers(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/farmers${qs ? '?' + qs : ''}`);
}

async function getFarmerById(id) {
  return apiFetch(`/farmers/${id}`);
}

export { getFarmers, getFarmerById };
