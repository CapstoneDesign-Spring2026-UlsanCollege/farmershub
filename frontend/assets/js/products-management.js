import { getProducts, deleteProduct } from './services/productService.js';

const FALLBACK_IMAGES = [
  'assets/images/home/product-tomatoes.webp',
  'assets/images/home/product-onions.webp',
  'assets/images/home/support-basket.webp',
];

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('fh_user') || 'null');
  } catch {
    return null;
  }
}

function getUserId(user) {
  return user?.id || user?._id || user?.userId || '';
}

function getProductId(product) {
  return product?.id || product?._id || product?.productId || '';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

function formatWon(value) {
  return `KRW ${Number(value || 0).toLocaleString()}`;
}

function getProductImage(product, index) {
  return product?.imageUrl || product?.image || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

function getStockLabel(product) {
  const rawStock = product?.stock ?? product?.quantity ?? product?.availableQuantity;
  const unit = product?.unit || '';
  const stock = rawStock === undefined || rawStock === null || rawStock === '' ? null : Number(rawStock);

  if (stock === null || Number.isNaN(stock)) return 'Stock not listed';
  return `${stock.toLocaleString()}${unit ? ` ${escapeHtml(unit)}` : ''} in listing stock`;
}

function setSummary(title, text) {
  document.getElementById('productSummaryTitle').textContent = title;
  document.getElementById('productSummaryText').textContent = text;
}

function renderState(title, text, actionHtml = '') {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = `
    <article class="workspace-panel workspace-state product-empty">
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(text)}</p>
      ${actionHtml}
    </article>
  `;
}

async function handleDelete(productId, productName) {
  if (!productId) return;
  const confirmed = window.confirm(`Delete ${productName}? The backend will only allow this for your own listing.`);
  if (!confirmed) return;

  await deleteProduct(productId);
  await loadProducts();
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';

  products.forEach((product, index) => {
    const productId = getProductId(product);
    const name = product?.name || 'Farm product';
    const viewUrl = productId
      ? `product.html?productId=${encodeURIComponent(productId)}&id=${encodeURIComponent(productId)}`
      : 'product.html';
    const manageUrl = productId
      ? `login/sell_crops.html?productId=${encodeURIComponent(productId)}`
      : 'login/sell_crops.html';

    const card = document.createElement('article');
    card.className = 'workspace-panel workspace-card product-card';
    card.innerHTML = `
      <div class="workspace-card-image">
        <img src="${escapeHtml(getProductImage(product, index))}" alt="${escapeHtml(name)}" loading="lazy">
      </div>
      <h3>${escapeHtml(name)}</h3>
      <p class="product-price">${formatWon(product?.price ?? product?.sellingPrice)}</p>
      <p class="product-stock">${getStockLabel(product)}</p>
      <div class="workspace-meta">
        <span class="workspace-pill">${escapeHtml(product?.unit || 'unit')}</span>
        <span class="workspace-pill">${escapeHtml(product?.category || 'uncategorized')}</span>
      </div>
      <div class="workspace-card-actions">
        <a class="workspace-secondary" href="${viewUrl}">View</a>
        <a class="workspace-secondary" href="${manageUrl}">Manage</a>
        ${productId ? '<button class="workspace-danger" type="button" data-delete>Delete</button>' : ''}
      </div>
    `;

    const deleteButton = card.querySelector('[data-delete]');
    if (deleteButton) {
      deleteButton.addEventListener('click', async () => {
        try {
          await handleDelete(productId, name);
        } catch (error) {
          window.alert(error.message || 'Failed to delete product.');
        }
      });
    }

    grid.appendChild(card);
  });
}

async function loadProducts() {
  const token = localStorage.getItem('fh_token');
  const user = getStoredUser();
  const farmerId = getUserId(user);

  if (!token || !farmerId) {
    setSummary('Login required', 'Products Management is available for authenticated farmer accounts.');
    renderState(
      'Secure farmer session needed',
      'Log in again to load your own product listings.',
      '<div class="workspace-card-actions"><a class="workspace-primary" href="login/login.html">Login</a></div>'
    );
    return;
  }

  setSummary('Loading products', 'Fetching your listings from the Products API.');
  renderState('Loading products', 'Your current farm listings will appear here.');

  try {
    const response = await getProducts({ farmerId, limit: 100 });
    const products = Array.isArray(response.data) ? response.data : [];
    setSummary(
      `${products.length} product${products.length === 1 ? '' : 's'} listed`,
      'Only products attached to your farmer account are shown here.'
    );

    if (!products.length) {
      renderState(
        'No products listed yet',
        'Add your first crop listing to make it available in the marketplace.',
        '<div class="workspace-card-actions"><a class="workspace-primary" href="login/sell_crops.html">Add Product</a></div>'
      );
      return;
    }

    renderProducts(products);
  } catch (error) {
    setSummary('Products unavailable', 'The Products API returned an error.');
    renderState('Products could not be loaded', error.message || 'Try again after checking your login session.');
  }
}

document.addEventListener('DOMContentLoaded', loadProducts);
