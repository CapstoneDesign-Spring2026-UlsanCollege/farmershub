import { getProducts } from './services/productService.js';

const FAVORITES_KEY = 'fh_favorite_products';
const FALLBACK_IMAGES = [
  'assets/images/home/product-tomatoes.webp',
  'assets/images/home/product-onions.webp',
  'assets/images/home/support-basket.webp',
];

function getFavoriteProductIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function setFavoriteProductIds(ids) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(new Set(ids.map(String)))));
}

function getProductId(product) {
  return product?.id || product?._id || product?.productId || '';
}

function getProductImage(product, index) {
  return product?.imageUrl || product?.image || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

function formatWon(value) {
  return `KRW ${Number(value || 0).toLocaleString()}`;
}

function setSummary(title, text) {
  document.getElementById('savedSummaryTitle').textContent = title;
  document.getElementById('savedSummaryText').textContent = text;
}

function clearGrid() {
  const grid = document.getElementById('savedProductsGrid');
  grid.textContent = '';
  return grid;
}

function renderState(title, text) {
  const grid = clearGrid();
  const card = document.createElement('article');
  card.className = 'workspace-panel workspace-state product-empty';

  const heading = document.createElement('h2');
  heading.textContent = title;

  const copy = document.createElement('p');
  copy.textContent = text;

  const actions = document.createElement('div');
  actions.className = 'workspace-card-actions';
  const browse = document.createElement('a');
  browse.className = 'workspace-primary';
  browse.href = 'product.html';
  browse.textContent = 'Browse Products';
  actions.appendChild(browse);

  card.append(heading, copy, actions);
  grid.appendChild(card);
}

function renderProducts(products) {
  const grid = clearGrid();
  const savedIds = getFavoriteProductIds();

  products.forEach((product, index) => {
    const productId = String(getProductId(product));
    const name = product?.name || 'Farm product';
    const viewUrl = productId
      ? `product.html?productId=${encodeURIComponent(productId)}&id=${encodeURIComponent(productId)}`
      : 'product.html';

    const card = document.createElement('article');
    card.className = 'workspace-panel workspace-card product-card';

    const imageWrap = document.createElement('div');
    imageWrap.className = 'workspace-card-image';
    const image = document.createElement('img');
    image.src = getProductImage(product, index);
    image.alt = name;
    image.loading = 'lazy';
    imageWrap.appendChild(image);

    const heading = document.createElement('h3');
    heading.textContent = name;

    const price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = formatWon(product?.price ?? product?.sellingPrice);

    const meta = document.createElement('div');
    meta.className = 'workspace-meta';
    const category = document.createElement('span');
    category.className = 'workspace-pill';
    category.textContent = product?.category || 'uncategorized';
    const source = document.createElement('span');
    source.className = 'workspace-pill';
    source.textContent = 'Saved on this device';
    meta.append(category, source);

    const actions = document.createElement('div');
    actions.className = 'workspace-card-actions';
    const view = document.createElement('a');
    view.className = 'workspace-secondary';
    view.href = viewUrl;
    view.textContent = 'View';
    const remove = document.createElement('button');
    remove.className = 'workspace-danger';
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      setFavoriteProductIds(savedIds.filter((id) => id !== productId));
      loadSavedProducts();
    });
    actions.append(view, remove);

    card.append(imageWrap, heading, price, meta, actions);
    grid.appendChild(card);
  });
}

async function loadSavedProducts() {
  const savedIds = getFavoriteProductIds();

  if (!savedIds.length) {
    setSummary('No saved products', 'Tap Save on product cards to keep products in this browser.');
    renderState('No saved products yet', 'Saved products are stored only in this browser until account syncing is added.');
    return;
  }

  setSummary('Loading saved products', 'Fetching current product details for this browser saved list.');

  try {
    const response = await getProducts({ limit: 100 });
    const products = Array.isArray(response.data) ? response.data : [];
    const savedSet = new Set(savedIds);
    const savedProducts = products.filter((product) => savedSet.has(String(getProductId(product))));
    const existingIds = savedProducts.map((product) => String(getProductId(product)));

    if (existingIds.length !== savedIds.length) {
      setFavoriteProductIds(existingIds);
    }

    if (!savedProducts.length) {
      setSummary('Saved products unavailable', 'The saved IDs in this browser no longer match current product listings.');
      renderState('No current saved products found', 'The saved products may have been removed or are unavailable right now.');
      return;
    }

    setSummary(
      `${savedProducts.length} saved product${savedProducts.length === 1 ? '' : 's'}`,
      'These saved products are stored on this device only.'
    );
    renderProducts(savedProducts);
  } catch (error) {
    setSummary('Saved products unavailable', 'The Products API returned an error.');
    renderState('Unable to load saved products', error.message || 'Try again later.');
  }
}

document.addEventListener('DOMContentLoaded', loadSavedProducts);
