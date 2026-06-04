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

async function getServiceRequests(params = {}) {
  return apiFetch(`/service-requests${buildQuery(params)}`, {
    method: 'GET',
    headers: jsonHeaders(),
  });
}

async function getServiceRequestById(id) {
  return apiFetch(`/service-requests/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: jsonHeaders(),
  });
}

async function createServiceRequest(payload) {
  return apiFetch('/service-requests', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
}

async function quoteServiceRequest(id, payload) {
  return apiFetch(`/service-requests/${encodeURIComponent(id)}/quote`, {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
}

async function declineServiceRequest(id, payload = {}) {
  return apiFetch(`/service-requests/${encodeURIComponent(id)}/decline`, {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
}

async function acceptServiceRequestQuote(id) {
  return apiFetch(`/service-requests/${encodeURIComponent(id)}/accept`, {
    method: 'PUT',
    headers: jsonHeaders(),
  });
}

async function cancelServiceRequest(id) {
  return apiFetch(`/service-requests/${encodeURIComponent(id)}/cancel`, {
    method: 'PUT',
    headers: jsonHeaders(),
  });
}

async function completeServiceRequest(id) {
  return apiFetch(`/service-requests/${encodeURIComponent(id)}/complete`, {
    method: 'PUT',
    headers: jsonHeaders(),
  });
}

export {
  getServiceRequests,
  getServiceRequestById,
  createServiceRequest,
  quoteServiceRequest,
  declineServiceRequest,
  acceptServiceRequestQuote,
  cancelServiceRequest,
  completeServiceRequest,
};
