import { apiFetch, jsonHeaders } from '../config/api.config.js';

async function getFarmers() {
  return apiFetch('/users/farmers', { method: 'GET' });
}

async function getCustomers() {
  return apiFetch('/users/customers', { method: 'GET' });
}

async function getMyFollowing() {
  return apiFetch('/users/me/following', { headers: jsonHeaders() });
}

async function followUser(userId) {
  return apiFetch(`/users/${encodeURIComponent(userId)}/follow`, {
    method: 'POST',
    headers: jsonHeaders(),
  });
}

async function unfollowUser(userId) {
  return apiFetch(`/users/${encodeURIComponent(userId)}/follow`, {
    method: 'DELETE',
    headers: jsonHeaders(),
  });
}

export { getFarmers, getCustomers, getMyFollowing, followUser, unfollowUser };
