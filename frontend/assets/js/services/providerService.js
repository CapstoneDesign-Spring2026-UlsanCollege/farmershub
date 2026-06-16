import { apiFetch, jsonHeaders, authHeader, API_BASE } from '../config/api.config.js';

// Resolve a stored "/uploads/..." path to an absolute URL on the API origin.
function resolveProviderImage(p) {
  if (!p) return '';
  if (/^https?:\/\//i.test(p) || p.startsWith('data:') || p.startsWith('blob:')) return p;
  const origin = String(API_BASE || '').replace(/\/api\/?$/, '');
  return `${origin}${p.startsWith('/') ? p : `/${p}`}`;
}

async function getProviderProfile() {
  return apiFetch('/providers/profile', {
    method: 'GET',
    headers: jsonHeaders(),
  });
}

async function updateProviderProfile(updates) {
  return apiFetch('/providers/profile', {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(updates),
  });
}

async function getProviderPublicProfile(providerId) {
  return apiFetch(`/providers/${encodeURIComponent(providerId)}`, {
    method: 'GET',
    headers: jsonHeaders(),
  });
}

// ── Profile imagery ───────────────────────────────────────────────────────────
async function uploadProviderAvatar(file) {
  const body = new FormData();
  body.append('avatar', file);
  return apiFetch('/providers/profile/avatar', { method: 'POST', headers: authHeader(), body });
}

async function uploadProviderCover(file) {
  const body = new FormData();
  body.append('cover', file);
  return apiFetch('/providers/profile/cover', { method: 'POST', headers: authHeader(), body });
}

// ── Equipment gallery ─────────────────────────────────────────────────────────
async function addEquipmentImages(files, caption = '') {
  const body = new FormData();
  Array.from(files).forEach((file) => body.append('images', file));
  if (caption) body.append('caption', caption);
  return apiFetch('/providers/profile/equipment', { method: 'POST', headers: authHeader(), body });
}

async function deleteEquipmentImage(imageId) {
  return apiFetch(`/providers/profile/equipment/${encodeURIComponent(imageId)}`, {
    method: 'DELETE',
    headers: authHeader(),
  });
}

// ── Timeline posts ────────────────────────────────────────────────────────────
async function getMyProviderPosts() {
  return apiFetch('/providers/profile/posts', { method: 'GET', headers: authHeader() });
}

async function createProviderPost({ content = '', files = [] } = {}) {
  const body = new FormData();
  if (content) body.append('content', content);
  Array.from(files).forEach((file) => body.append('images', file));
  return apiFetch('/providers/profile/posts', { method: 'POST', headers: authHeader(), body });
}

async function deleteProviderPost(postId) {
  return apiFetch(`/providers/profile/posts/${encodeURIComponent(postId)}`, {
    method: 'DELETE',
    headers: authHeader(),
  });
}

export {
  resolveProviderImage,
  getProviderProfile,
  updateProviderProfile,
  getProviderPublicProfile,
  uploadProviderAvatar,
  uploadProviderCover,
  addEquipmentImages,
  deleteEquipmentImage,
  getMyProviderPosts,
  createProviderPost,
  deleteProviderPost,
};
