import { getProducts } from './services/productService.js';
import {
  addProductToCart,
  createImageBlock,
  customerMessageUrl,
  customerProductUrl,
  favoriteIds,
  formatCurrency,
  getProductCategory,
  getProductId,
  getProductImage,
  getProductName,
  getProductPrice,
  getProductUnit,
  getSellerId,
  getSellerName,
  hydrateCustomerShell,
  saveFavoriteIds,
  setStatus,
} from './customer-shell.js';

const grid = document.getElementById('favoritesGrid');
const statusEl = document.getElementById('favoritesStatus');
const clearBtn = document.getElementById('clearFavoritesBtn');
const searchForm = document.getElementById('favoritesSearchForm');
const searchInput = document.getElementById('favoritesSearchInput');

let savedProducts = [];
let staleCount = 0;

function renderState(title, body) {
  grid.innerHTML = '';
  const state = document.createElement('div');
  state.className = 'customer-state customer-empty';
  const heading = document.createElement('strong');
  heading.textContent = title;
  const copy = document.createElement('p');
  copy.textContent = body;
  const action = document.createElement('a');
  action.className = 'customer-button';
  action.href = 'customer-marketplace.html';
  action.textContent = 'Browse marketplace';
  state.append(heading, copy, action);
  grid.appendChild(state);
}

function matchesSearch(product) {
  const query = String(searchInput?.value || '').trim().toLowerCase();
  if (!query) return true;
  return [
    getProductName(product),
    getProductCategory(product),
    getSellerName(product),
    product.description,
  ].join(' ').toLowerCase().includes(query);
}

function createProductCard(product) {
  const productId = getProductId(product);
  const sellerId = getSellerId(product);
  const sellerName = getSellerName(product);
  const article = document.createElement('article');
  article.className = 'customer-product-card';

  const body = document.createElement('div');
  body.className = 'customer-product-body';

  const category = document.createElement('span');
  category.className = 'customer-pill';
  category.textContent = getProductCategory(product);

  const title = document.createElement('h3');
  title.textContent = getProductName(product);

  const seller = document.createElement('p');
  seller.textContent = `by ${sellerName}`;

  const price = document.createElement('strong');
  price.className = 'customer-product-price';
  price.textContent = `${formatCurrency(getProductPrice(product))} / ${getProductUnit(product)}`;

  const actions = document.createElement('div');
  actions.className = 'customer-product-actions';

  const view = document.createElement('a');
  view.className = 'customer-button';
  view.href = customerProductUrl(product);
  view.textContent = 'View';

  const cart = document.createElement('button');
  cart.type = 'button';
  cart.className = 'customer-secondary-button';
  cart.textContent = 'Add to cart';
  cart.addEventListener('click', () => {
    const result = addProductToCart(product);
    setStatus(statusEl, result.message, result.ok ? 'success' : 'error');
  });

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'customer-danger-button';
  remove.textContent = 'Remove';
  remove.addEventListener('click', () => {
    saveFavoriteIds(favoriteIds().filter((id) => id !== String(productId)));
    savedProducts = savedProducts.filter((item) => String(getProductId(item)) !== String(productId));
    renderFavorites('Removed from favorites on this device.');
  });

  actions.append(view, cart, remove);
  if (sellerId) {
    const message = document.createElement('a');
    message.className = 'customer-secondary-button';
    message.href = customerMessageUrl({
      recipientId: sellerId,
      recipientName: sellerName,
      recipientRole: 'farmer',
      productId,
      productName: getProductName(product),
    });
    message.textContent = 'Message';
    actions.appendChild(message);
  }

  body.append(category, title, seller, price, actions);
  article.append(createImageBlock(getProductImage(product), getProductName(product)), body);
  return article;
}

function renderFavorites(message = '') {
  hydrateCustomerShell();
  clearBtn.disabled = favoriteIds().length === 0;
  const visible = savedProducts.filter(matchesSearch);
  grid.innerHTML = '';

  if (!favoriteIds().length) {
    setStatus(statusEl, message || 'No saved products on this device.');
    renderState('No favorites saved yet', 'Tap Save on Customer Marketplace product cards to store product ids in this browser.');
    return;
  }

  if (!savedProducts.length) {
    setStatus(statusEl, 'Saved ids exist locally, but none were returned by the Products API.');
    renderState('Saved products are unavailable', 'Your browser has saved product ids, but current product listings did not return matching products.');
    return;
  }

  setStatus(statusEl, message || `${visible.length} saved product${visible.length === 1 ? '' : 's'} shown.`);

  if (staleCount) {
    const note = document.createElement('div');
    note.className = 'favorite-stale-note';
    note.textContent = `${staleCount} saved product id${staleCount === 1 ? '' : 's'} did not match current API results.`;
    grid.appendChild(note);
  }

  if (!visible.length) {
    const empty = document.createElement('div');
    empty.className = 'customer-state customer-empty';
    const title = document.createElement('strong');
    title.textContent = 'No saved products match this search';
    const copy = document.createElement('p');
    copy.textContent = 'Clear the search to see all returned saved products.';
    empty.append(title, copy);
    grid.appendChild(empty);
    return;
  }

  visible.forEach((product) => grid.appendChild(createProductCard(product)));
}

async function loadFavorites() {
  hydrateCustomerShell();
  renderState('Loading favorites', 'Checking saved product ids in this browser and fetching current products.');

  try {
    const ids = favoriteIds();
    if (!ids.length) {
      savedProducts = [];
      staleCount = 0;
      renderFavorites();
      return;
    }

    const response = await getProducts({ limit: 100 });
    const products = Array.isArray(response.data) ? response.data : [];
    savedProducts = products.filter((product) => ids.includes(String(getProductId(product))));
    staleCount = ids.length - savedProducts.length;
    renderFavorites();
  } catch (error) {
    savedProducts = [];
    staleCount = 0;
    setStatus(statusEl, error.message || 'Unable to load favorite products.', 'error');
    renderState('Unable to load favorites', 'The Products API could not be reached right now.');
  }
}

clearBtn?.addEventListener('click', () => {
  saveFavoriteIds([]);
  savedProducts = [];
  staleCount = 0;
  renderFavorites('All favorites cleared from this device.');
});

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  renderFavorites();
});

searchInput?.addEventListener('input', () => renderFavorites());

loadFavorites();
