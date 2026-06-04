import { apiFetch } from './apiClient.js';

export function getMessages() {
  return apiFetch('/messages');
}

export function sendMessage(payload) {
  return apiFetch('/messages', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function markMessageRead(id) {
  return apiFetch(`/messages/${encodeURIComponent(id)}/read`, {
    method: 'PUT',
  });
}
