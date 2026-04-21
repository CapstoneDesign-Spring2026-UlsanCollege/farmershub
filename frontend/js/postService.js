/**
 * postService.js
 * Feed posts — create, read, like.
 */
import { apiFetch, jsonHeaders, authHeader } from './api.config.js';

/**
 * Fetch the public feed.
 * @param {object} params - { farmerId, page, limit }
 */
async function getFeed(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/posts${qs ? '?' + qs : ''}`);
}

/**
 * Create a new post (farmer only).
 * @param {FormData} formData - content, optional images[], optional linkedProduct
 */
async function createPost(formData) {
  return apiFetch('/posts', {
    method: 'POST',
    headers: authHeader(),
    body: formData,
  });
}

/** Toggle like on a post */
async function likePost(postId) {
  return apiFetch(`/posts/${postId}/like`, {
    method: 'POST',
    headers: jsonHeaders(),
  });
}

/** Delete a post (author or admin) */
async function deletePost(postId) {
  return apiFetch(`/posts/${postId}`, {
    method: 'DELETE',
    headers: jsonHeaders(),
  });
}

export { getFeed, createPost, likePost, deletePost };
