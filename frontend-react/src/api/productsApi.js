import { apiFetch, buildQuery } from './apiClient.js';

export function getProducts(params = {}) {
  return apiFetch(`/products${buildQuery(params)}`);
}

export function getProductById(id) {
  return apiFetch(`/products/${encodeURIComponent(id)}`);
}

export function createProduct(formData) {
  return apiFetch('/products', {
    method: 'POST',
    body: formData,
  });
}

export function deleteProduct(id) {
  return apiFetch(`/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
