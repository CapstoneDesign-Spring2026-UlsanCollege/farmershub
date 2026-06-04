import { apiFetch } from './apiClient.js';

export function getFarmers() {
  return apiFetch('/farmers');
}

export function getFarmerById(id) {
  return apiFetch(`/farmers/${encodeURIComponent(id)}`);
}
