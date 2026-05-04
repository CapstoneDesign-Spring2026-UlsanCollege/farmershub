import { apiFetch } from '../config/api.config.js';

async function getFarmers() {
  return apiFetch('/users/farmers', { method: 'GET' });
}

async function getCustomers() {
  return apiFetch('/users/customers', { method: 'GET' });
}

export { getFarmers, getCustomers };
