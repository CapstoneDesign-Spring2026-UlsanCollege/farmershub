import { apiFetch, buildQuery } from './apiClient.js';

export function getServiceRequests(params = {}) {
  return apiFetch(`/service-requests${buildQuery(params)}`);
}

export function getServiceRequestById(id) {
  return apiFetch(`/service-requests/${encodeURIComponent(id)}`);
}

export function createServiceRequest(payload) {
  return apiFetch('/service-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function quoteServiceRequest(id, payload) {
  return apiFetch(`/service-requests/${encodeURIComponent(id)}/quote`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function declineServiceRequest(id) {
  return apiFetch(`/service-requests/${encodeURIComponent(id)}/decline`, {
    method: 'PUT',
  });
}

export function acceptServiceRequestQuote(id) {
  return apiFetch(`/service-requests/${encodeURIComponent(id)}/accept`, {
    method: 'PUT',
  });
}

export function cancelServiceRequest(id) {
  return apiFetch(`/service-requests/${encodeURIComponent(id)}/cancel`, {
    method: 'PUT',
  });
}

export function completeServiceRequest(id) {
  return apiFetch(`/service-requests/${encodeURIComponent(id)}/complete`, {
    method: 'PUT',
  });
}
