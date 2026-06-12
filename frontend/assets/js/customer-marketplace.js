import { getProducts } from './services/productService.js';
import {
  addProductToCart,
  createImageBlock,
  customerMessageUrl,
  customerProductUrl,
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
  isFavorite,
  setStatus,
  toggleFavorite,
} from './customer-shell.js';

const grid = document.getElementById('marketProductGrid');
const searchForm = document.getElementById('marketSearchForm');
const searchInput = document.getElementById('marketSearchInput');
const categoryFilters = document.getElementById('marketCategoryFilters');
const summary = document.getElementById('marketSummary');

const pageParams = new URLSearchParams(window.location.search);
let activeCategory = pageParams.get('category') || '';
let allProducts = [];

if (searchInput && pageParams.get('search')) {
  searchInput.value = pageParams.get('search');
}

function normalizeCategory(value) {
  return String(value || '').trim();
}

function updateRoute() {
  const params = new URLSearchParams(window.location.search);
  if (activeCategory) {
    params.set('category', activeCategory);
  } else {
    params.delete('category');
  }
  const query = String(searchInput?.value || '').trim();
  if (query) {
    params.set('search', query);
  } else {
    params.delete('search');
  }
  const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
  window.history.replaceState({}, '', next);
}

function productMatchesSearch(product, query) {
  if (!query) return true;
  const text = [
    getProductName(product),
    getProductCategory(product),
    product.description,
    getSellerName(product),
  ].join(' ').toLowerCase();
  return text.includes(query);
}

function getFilteredProducts() {
  const query = String(searchInput?.value || '').trim().toLowerCase();
  return allProducts.filter((product) => {
    const category = normalizeCategory(product.category);
    const categoryMatch = !activeCategory || category.toLowerCase() === activeCategory.toLowerCase();
    return categoryMatch && productMatchesSearch(product, query);
  });
}

function setSummary(products, mode = '') {
  const query = String(searchInput?.value || '').trim();
  const pieces = [`${products.length} product${products.length === 1 ? '' : 's'} shown`];
  if (activeCategory) pieces.push(`category: ${activeCategory}`);
  if (query) pieces.push(`search: ${query}`);
  if (mode === 'featured') pieces.push('browsing available picks');
  setStatus(summary, pieces.join(' | '));
}

function renderCategoryFilters() {
  const categories = Array.from(new Set(
    allProducts.map((product) => normalizeCategory(product.category)).filter(Boolean)
  )).sort((a, b) => a.localeCompare(b));

  categoryFilters.innerHTML = '';
  const options = [{ label: 'All products', value: '' }, ...categories.map((category) => ({
    label: getProductCategory({ category }),
    value: category,
  }))];

  options.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'customer-chip';
    button.textContent = option.label;
    button.setAttribute('aria-pressed', option.value === activeCategory ? 'true' : 'false');
    button.addEventListener('click', () => {
      activeCategory = option.value;
      updateRoute();
      renderProducts();
      renderCategoryFilters();
    });
    categoryFilters.appendChild(button);
  });
}

function renderState(title, body, type = '') {
  grid.innerHTML = '';
  const state = document.createElement('div');
  state.className = 'customer-state customer-empty';
  const heading = document.createElement('strong');
  heading.textContent = title;
  const copy = document.createElement('p');
  copy.textContent = body;
  state.append(heading, copy);
  if (type === 'error') {
    state.classList.add('is-error');
  }
  grid.appendChild(state);
}

function updateSaveButton(button, product) {
  const saved = isFavorite(product);
  button.textContent = saved ? 'Saved' : 'Save';
  button.setAttribute('aria-pressed', saved ? 'true' : 'false');
}

function createActionLink(label, href, className = 'customer-secondary-button') {
  const link = document.createElement('a');
  link.className = className;
  link.href = href;
  link.textContent = label;
  return link;
}

function createProductCard(product) {
  const article = document.createElement('article');
  article.className = 'customer-product-card';

  const productId = getProductId(product);
  const sellerId = getSellerId(product);
  const sellerName = getSellerName(product);
  const image = createImageBlock(getProductImage(product), getProductName(product));
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

  const note = document.createElement('div');
  note.className = 'market-card-note';
  if (product.stock !== undefined && product.stock !== null && product.stock !== '') {
    const stock = document.createElement('span');
    stock.className = 'market-product-stock';
    stock.textContent = `Stock returned: ${product.stock} ${getProductUnit(product)}`;
    note.appendChild(stock);
  } else {
    note.textContent = 'Stock not provided by this listing.';
  }

  const actions = document.createElement('div');
  actions.className = 'customer-product-actions';

  if (productId) {
    actions.appendChild(createActionLink('View', customerProductUrl(product), 'customer-button'));
  } else {
    const disabled = document.createElement('button');
    disabled.type = 'button';
    disabled.className = 'customer-button market-product-card-disabled';
    disabled.disabled = true;
    disabled.textContent = 'View';
    actions.appendChild(disabled);
  }

  const cartButton = document.createElement('button');
  cartButton.type = 'button';
  cartButton.className = 'customer-secondary-button';
  cartButton.textContent = 'Add to cart';
  cartButton.disabled = !productId;
  cartButton.addEventListener('click', () => {
    const result = addProductToCart(product);
    setStatus(summary, result.message, result.ok ? 'success' : 'error');
  });
  actions.appendChild(cartButton);

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'customer-secondary-button';
  saveButton.disabled = !productId;
  updateSaveButton(saveButton, product);
  saveButton.addEventListener('click', () => {
    const result = toggleFavorite(product);
    updateSaveButton(saveButton, product);
    setStatus(summary, result.message, 'success');
  });
  actions.appendChild(saveButton);

  if (sellerId) {
    actions.appendChild(createActionLink('Message', customerMessageUrl({
      recipientId: sellerId,
      recipientName: sellerName,
      recipientRole: 'farmer',
      productId,
      productName: getProductName(product),
    })));
  } else if (productId) {
    actions.appendChild(createActionLink('View to message', customerProductUrl(product)));
  } else {
    const disabledMessage = document.createElement('button');
    disabledMessage.type = 'button';
    disabledMessage.className = 'customer-secondary-button market-product-card-disabled';
    disabledMessage.disabled = true;
    disabledMessage.textContent = 'Message';
    actions.appendChild(disabledMessage);
  }

  body.append(category, title, seller, price, note, actions);
  article.append(image, body);
  return article;
}

function renderProducts() {
  const products = getFilteredProducts();
  grid.innerHTML = '';
  setSummary(products, pageParams.get('sort') === 'featured' ? 'featured' : '');

  if (!products.length) {
    renderState(
      'No products found',
      allProducts.length
        ? 'No returned products match this search or category filter.'
        : 'Products from farmers will appear here once the Products API returns listings.'
    );
    return;
  }

  products.forEach((product) => {
    grid.appendChild(createProductCard(product));
  });
}

async function loadMarketplace() {
  hydrateCustomerShell();
  renderState('Loading products', 'Fetching current product listings from FarmersHub.');

  try {
    const response = await getProducts({ limit: 100 });
    allProducts = Array.isArray(response.data) ? response.data : [];
    renderCategoryFilters();
    renderProducts();
  } catch (error) {
    allProducts = [];
    renderCategoryFilters();
    setStatus(summary, 'Unable to load products.', 'error');
    renderState('Unable to load products', error.message || 'Please try again later.', 'error');
  }
}

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  updateRoute();
  renderProducts();
});

searchInput?.addEventListener('input', () => {
  updateRoute();
  renderProducts();
});

loadMarketplace();
