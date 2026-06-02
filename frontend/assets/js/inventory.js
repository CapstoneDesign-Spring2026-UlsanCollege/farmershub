import { getProducts } from './services/productService.js';

const LOW_STOCK_THRESHOLD = 10;
const FALLBACK_IMAGES = ['assets/images/home/product-tomatoes.webp', 'assets/images/home/product-onions.webp', 'assets/images/home/support-basket.webp'];

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('fh_user') || 'null'); } catch { return null; }
}

function getUserId(user) {
  return user?.id || user?._id || user?.userId || '';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function stockValue(product) {
  const raw = product?.stock ?? product?.quantity ?? product?.availableQuantity;
  const value = raw === undefined || raw === null || raw === '' ? null : Number(raw);
  return Number.isNaN(value) ? null : value;
}

function renderState(title, text) {
  document.getElementById('inventoryGrid').innerHTML = `<article class="workspace-panel workspace-state inventory-note"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p></article>`;
}

function setSummary(title, text) {
  document.getElementById('inventorySummaryTitle').textContent = title;
  document.getElementById('inventorySummaryText').textContent = text;
}

function renderInventory(products) {
  const grid = document.getElementById('inventoryGrid');
  grid.innerHTML = `<article class="workspace-panel workspace-state inventory-note"><h2>Listing stock source</h2><p>Current stock is based on your product listings. Full inventory history and automatic order-based stock changes will appear after inventory tracking is connected.</p></article>`;

  products.forEach((product, index) => {
    const stock = stockValue(product);
    const productId = product.id || product._id || product.productId || '';
    const unit = product.unit || '';
    const card = document.createElement('article');
    card.className = 'workspace-panel workspace-card';
    card.innerHTML = `
      <div class="workspace-card-image"><img src="${escapeHtml(product.imageUrl || product.image || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length])}" alt="${escapeHtml(product.name || 'Farm product')}" loading="lazy"></div>
      <h3>${escapeHtml(product.name || 'Farm product')}</h3>
      <p class="inventory-stock">${stock === null ? 'Stock not listed' : `${stock.toLocaleString()}${unit ? ` ${escapeHtml(unit)}` : ''}`}</p>
      <div class="workspace-meta">${stock !== null && stock <= LOW_STOCK_THRESHOLD ? `<span class="workspace-pill warning">Low stock: ${LOW_STOCK_THRESHOLD} or less</span>` : '<span class="workspace-pill">Current listing stock</span>'}</div>
      <div class="workspace-card-actions"><a class="workspace-secondary" href="${productId ? `login/sell_crops.html?productId=${encodeURIComponent(productId)}` : 'login/sell_crops.html'}">Manage Product</a></div>
    `;
    grid.appendChild(card);
  });
}

async function loadInventory() {
  const user = getStoredUser();
  const farmerId = getUserId(user);
  if (!localStorage.getItem('fh_token') || !farmerId) {
    setSummary('Login required', 'Inventory uses your authenticated farmer product listings.');
    renderState('Secure farmer session needed', 'Log in again to read listing stock values.');
    return;
  }
  try {
    const response = await getProducts({ farmerId, limit: 100 });
    const products = Array.isArray(response.data) ? response.data : [];
    setSummary(`${products.length} listing${products.length === 1 ? '' : 's'} checked`, `Low stock badge threshold: ${LOW_STOCK_THRESHOLD} or less.`);
    if (!products.length) {
      renderState('No product stock found', 'Add product listings before inventory stock can be summarized.');
      return;
    }
    renderInventory(products);
  } catch (error) {
    setSummary('Inventory unavailable', 'The Products API returned an error.');
    renderState('Listing stock could not be loaded', error.message || 'Try again after checking your login session.');
  }
}

document.addEventListener('DOMContentLoaded', loadInventory);
