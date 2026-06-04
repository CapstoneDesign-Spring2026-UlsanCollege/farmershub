import { apiFetch, buildQuery } from './apiClient.js';

export function getNotifications(params = { limit: 50 }) {
  return apiFetch(`/notifications${buildQuery(params)}`);
}

export function markNotificationRead(id) {
  return apiFetch(`/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PUT',
  });
}

export function markAllNotificationsRead() {
  return apiFetch('/notifications/read-all', {
    method: 'PUT',
  });
}
