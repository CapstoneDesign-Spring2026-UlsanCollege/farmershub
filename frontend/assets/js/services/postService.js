import { apiFetch, jsonHeaders, authHeader } from '../config/api.config.js';

async function getFeed(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/posts${qs ? '?' + qs : ''}`);
}

async function createPost(formData) {
  return apiFetch('/posts', {
    method: 'POST',
    headers: authHeader(),
    body: formData,
  });
}

async function likePost(postId) {
  return apiFetch(`/posts/${postId}/like`, {
    method: 'POST',
    headers: jsonHeaders(),
  });
}

async function deletePost(postId) {
  return apiFetch(`/posts/${postId}`, {
    method: 'DELETE',
    headers: jsonHeaders(),
  });
}

export { getFeed, createPost, likePost, deletePost };
