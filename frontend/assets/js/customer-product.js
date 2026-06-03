import { getProductById } from './services/productService.js';
import {
  addProductToCart,
  customerFarmerUrl,
  customerMessageUrl,
  formatCurrency,
  formatDate,
  getInitials,
  getProductCategory,
  getProductId,
  getProductImage,
  getProductName,
  getProductPrice,
  getProductUnit,
  getSellerId,
  getSellerLocation,
  getSellerName,
  hydrateCustomerShell,
  isFavorite,
  setStatus,
  toggleFavorite,
} from './customer-shell.js';

const shell = document.getElementById('productDetailShell');
const topTitle = document.getElementById('productTopTitle');
const searchForm = document.getElementById('productSearchForm');
const searchInput = document.getElementById('productSearchInput');
const params = new URLSearchParams(window.location.search);
const requestedId = params.get('id') || params.get('productId');

let activeProduct = null;

function renderState(title, body, type = '') {
  shell.innerHTML = '';
  const state = document.createElement('section');
  state.className = 'customer-state customer-empty';
  const heading = document.createElement('strong');
  heading.textContent = title;
  const copy = document.createElement('p');
  copy.textContent = body;
  state.append(heading, copy);
  if (type === 'error') state.classList.add('is-error');
  shell.appendChild(state);
}

function createImage(product) {
  const image = document.createElement('div');
  image.className = 'product-detail-image';
  const imageUrl = getProductImage(product);
  if (imageUrl) {
    image.style.backgroundImage = `url("${imageUrl}")`;
    image.setAttribute('role', 'img');
    image.setAttribute('aria-label', getProductName(product));
  } else {
    image.textContent = 'Image pending';
  }
  return image;
}

function addMeta(dl, label, value) {
  if (value === undefined || value === null || value === '') return;
  const item = document.createElement('div');
  const term = document.createElement('dt');
  const details = document.createElement('dd');
  term.textContent = label;
  details.textContent = value;
  item.append(term, details);
  dl.appendChild(item);
}

function updateFavoriteButton(button) {
  if (!button || !activeProduct) return;
  const saved = isFavorite(activeProduct);
  button.textContent = saved ? 'Saved on this device' : 'Save on this device';
  button.setAttribute('aria-pressed', saved ? 'true' : 'false');
}

function renderProduct(product) {
  activeProduct = product;
  const productId = getProductId(product);
  const sellerId = getSellerId(product);
  const sellerName = getSellerName(product);
  const productName = getProductName(product);
  topTitle.textContent = productName;
  shell.innerHTML = '';

  const detail = document.createElement('article');
  detail.className = 'customer-card product-detail-card';

  const copy = document.createElement('div');
  copy.className = 'product-detail-copy';

  const category = document.createElement('span');
  category.className = 'customer-pill';
  category.textContent = getProductCategory(product);

  const title = document.createElement('h2');
  title.textContent = productName;

  const price = document.createElement('strong');
  price.className = 'product-detail-price';
  price.textContent = `${formatCurrency(getProductPrice(product))} / ${getProductUnit(product)}`;

  const description = document.createElement('p');
  description.textContent = product.description || 'No product description was provided with this listing.';

  const meta = document.createElement('dl');
  meta.className = 'customer-meta-list';
  addMeta(meta, 'Category', getProductCategory(product));
  addMeta(meta, 'Seller', sellerName);
  addMeta(meta, 'Location', getSellerLocation(product));
  if (product.stock !== undefined && product.stock !== null && product.stock !== '') {
    addMeta(meta, 'Stock returned', `${product.stock} ${getProductUnit(product)}`);
  }
  addMeta(meta, 'Harvest date', formatDate(product.harvestDate));
  addMeta(meta, 'Best before', formatDate(product.expiryDate));
  if (Array.isArray(product.paymentMethods) && product.paymentMethods.length) {
    addMeta(meta, 'Payment methods returned', product.paymentMethods.join(', '));
  }

  const status = document.createElement('p');
  status.className = 'customer-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  const actions = document.createElement('div');
  actions.className = 'product-detail-actions';

  const cartButton = document.createElement('button');
  cartButton.type = 'button';
  cartButton.className = 'customer-button';
  cartButton.textContent = 'Add to cart';
  cartButton.disabled = !productId;
  cartButton.addEventListener('click', () => {
    const result = addProductToCart(product);
    setStatus(status, result.message, result.ok ? 'success' : 'error');
  });

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'customer-secondary-button';
  saveButton.disabled = !productId;
  updateFavoriteButton(saveButton);
  saveButton.addEventListener('click', () => {
    const result = toggleFavorite(product);
    updateFavoriteButton(saveButton);
    setStatus(status, result.message, 'success');
  });

  let messageHref = '';
  let messageControl;
  if (sellerId) {
    messageHref = customerMessageUrl({
      recipientId: sellerId,
      recipientName: sellerName,
      recipientRole: 'farmer',
      productId,
      productName,
    });
    messageControl = document.createElement('a');
    messageControl.className = 'customer-secondary-button';
    messageControl.href = messageHref;
    messageControl.textContent = 'Message farmer';
  } else {
    messageControl = document.createElement('button');
    messageControl.type = 'button';
    messageControl.className = 'customer-secondary-button';
    messageControl.disabled = true;
    messageControl.textContent = 'Message farmer';
  }

  actions.append(cartButton, saveButton, messageControl);
  copy.append(category, title, price, description, meta, actions, status);
  detail.append(createImage(product), copy);
  shell.appendChild(detail);

  const seller = document.createElement('section');
  seller.className = 'customer-card product-seller-card';
  seller.setAttribute('aria-label', 'Seller information');

  const avatar = document.createElement('div');
  avatar.className = 'product-seller-avatar';
  avatar.textContent = getInitials(sellerName);

  const sellerCopy = document.createElement('div');
  const sellerHeading = document.createElement('h2');
  sellerHeading.textContent = sellerName;
  const sellerLocation = document.createElement('p');
  sellerLocation.textContent = getSellerLocation(product) || 'Seller location not provided.';
  sellerCopy.append(sellerHeading, sellerLocation);

  const sellerActions = document.createElement('div');
  sellerActions.className = 'product-seller-actions';
  const farmerLink = document.createElement('a');
  farmerLink.className = 'customer-secondary-button';
  farmerLink.href = sellerId ? customerFarmerUrl(sellerId) : 'customer-marketplace.html';
  farmerLink.textContent = 'View farmer';
  if (sellerId) {
    const farmerMessage = document.createElement('a');
    farmerMessage.className = 'customer-button';
    farmerMessage.href = messageHref;
    farmerMessage.textContent = 'Ask about this';
    sellerActions.append(farmerLink, farmerMessage);
  } else {
    const disabledMessage = document.createElement('button');
    disabledMessage.type = 'button';
    disabledMessage.className = 'customer-button';
    disabledMessage.disabled = true;
    disabledMessage.textContent = 'Ask about this';
    sellerActions.append(farmerLink, disabledMessage);
  }
  seller.append(avatar, sellerCopy, sellerActions);
  shell.appendChild(seller);
}

async function loadProduct() {
  hydrateCustomerShell();

  if (!requestedId) {
    renderState('Product not selected', 'Open a product from Customer Marketplace to view its customer-safe details.', 'error');
    return;
  }

  try {
    const response = await getProductById(requestedId);
    if (!response.data) {
      renderState('Product unavailable', 'The Products API did not return a product for this id.', 'error');
      return;
    }
    renderProduct(response.data);
  } catch (error) {
    renderState('Unable to load product', error.message || 'Please return to the marketplace and try again.', 'error');
  }
}

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = String(searchInput?.value || '').trim();
  const params = new URLSearchParams();
  if (query) params.set('search', query);
  window.location.href = `customer-marketplace.html${params.toString() ? `?${params.toString()}` : ''}`;
});

loadProduct();
