import { apiFetch, jsonHeaders, authHeader } from '../config/api.config.js';

// ── Provider: manage own delivery options ────────────────────────────────────
async function getMyDeliveryPartners() {
  return apiFetch('/delivery-partners/mine', { headers: authHeader() });
}

async function createDeliveryPartner(payload) {
  return apiFetch('/delivery-partners', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
}

async function updateDeliveryPartner(id, payload) {
  return apiFetch(`/delivery-partners/${id}`, {
    method: 'PATCH',
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
}

async function deleteDeliveryPartner(id) {
  return apiFetch(`/delivery-partners/${id}`, { method: 'DELETE', headers: authHeader() });
}

// ── Farmer: browse active options when shipping an order ──────────────────────
async function getAvailableDeliveryPartners() {
  return apiFetch('/delivery-partners/available', { headers: authHeader() });
}

export {
  getMyDeliveryPartners,
  createDeliveryPartner,
  updateDeliveryPartner,
  deleteDeliveryPartner,
  getAvailableDeliveryPartners,
};
