import { apiFetch, jsonHeaders, authHeader } from '../config/api.config.js';

async function getProfile() {
  return apiFetch('/users/profile', { headers: jsonHeaders() });
}

async function getProfileById(userId) {
  try {
    const response = await apiFetch(`/farmers/${userId}`, { headers: jsonHeaders(false) });
    const farmer = response.data || {};
    return {
      ...response,
      data: {
        ...farmer,
        userId: farmer.userId || farmer.id,
        role: farmer.role || 'farmer',
        products: farmer.productsLabel || farmer.products || '',
        stats: {
          products: Array.isArray(farmer.products) ? farmer.products.length : 0,
          posts: Array.isArray(farmer.posts) ? farmer.posts.length : 0,
        },
      },
    };
  } catch {
    return apiFetch(`/users/${userId}/profile`, { headers: jsonHeaders() });
  }
}

async function updateProfile(updates) {
  return apiFetch('/users/profile', {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(updates),
  });
}

async function updateFarmerProfile(updates) {
  return apiFetch('/farmers/profile', {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(updates),
  });
}

async function uploadAvatar(file) {
  const form = new FormData();
  form.append('avatar', file);
  return apiFetch('/users/avatar', {
    method: 'POST',
    headers: authHeader(),
    body: form,
  });
}

async function uploadCover(file) {
  const form = new FormData();
  form.append('cover', file);
  return apiFetch('/users/cover', {
    method: 'POST',
    headers: authHeader(),
    body: form,
  });
}

async function sendFriendRequest(recipientId) {
  return apiFetch('/friend-requests', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ recipientId }),
  });
}

export {
  getProfile,
  getProfileById,
  updateProfile,
  updateFarmerProfile,
  uploadAvatar,
  uploadCover,
  sendFriendRequest,
};
