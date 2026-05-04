import { apiFetch, jsonHeaders, authHeader } from '../config/api.config.js';

async function createProduct(formData) {
  return apiFetch('/products', {
    method: 'POST',
    headers: authHeader(),
    body: formData,
  });
}

async function getProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/products${qs ? '?' + qs : ''}`, {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getProductById(id) {
  return apiFetch(`/products/${id}`, {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function updateProduct(id, updates) {
  if (updates instanceof FormData) {
    return apiFetch(`/products/${id}`, {
      method: 'PUT',
      headers: authHeader(),
      body: updates,
    });
  }

  return apiFetch(`/products/${id}`, {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(updates),
  });
}

async function deleteProduct(id) {
  return apiFetch(`/products/${id}`, {
    method: 'DELETE',
    headers: jsonHeaders(),
  });
}

export { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
