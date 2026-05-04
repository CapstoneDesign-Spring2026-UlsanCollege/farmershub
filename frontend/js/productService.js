/**
 * productService.js
 * Create, read, update, delete products.
 */
import { apiFetch, jsonHeaders, authHeader } from './api.config.js';

/**
 * Create a product listing (farmer only).
 * @param {FormData} formData - must contain 'images' files + all text fields
 */
async function createProduct(formData) {
  return apiFetch('/products', {
    method: 'POST',
    headers: authHeader(),
    body: formData,
  });
}

/**
 * Fetch all available products with optional filters.
 * Canonical product fields returned by API:
 * { id, name, brand, description, category, costPrice, sellingPrice,
 *   discount, price, stock, unit, harvestDate, expiryDate, imageUrl,
 *   paymentMethods, seller, createdAt, updatedAt }
 * @param {object} params - { category, search, farmerId, minPrice, maxPrice, limit }
 */
async function getProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/products${qs ? '?' + qs : ''}`, {
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Get a single product by ID */
async function getProductById(id) {
  return apiFetch(`/products/${id}`, {
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Update a product (farmer owner only).
 * @param {string} id
 * @param {object|FormData} updates
 */
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

/** Delete a product (farmer owner or admin) */
async function deleteProduct(id) {
  return apiFetch(`/products/${id}`, {
    method: 'DELETE',
    headers: jsonHeaders(),
  });
}

export { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
