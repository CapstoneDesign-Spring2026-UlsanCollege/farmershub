import { apiFetch } from './apiClient.js';

export function getPosts() {
  return apiFetch('/posts');
}

export function createPost(formData) {
  return apiFetch('/posts', {
    method: 'POST',
    body: formData,
  });
}
