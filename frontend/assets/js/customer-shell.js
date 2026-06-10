const CART_KEY = 'fh_cart';
const FAVORITES_KEY = 'fh_favorite_products';
const CUSTOMER_PREFS_KEY = 'fh_customer_preferences';
const AUTH_KEYS = ['fh_token', 'fh_user', 'fh_loggedIn', 'fh_role', 'currentUser'];

const CATEGORY_LABELS = {
  vegetables: 'Vegetables',
  vegetable: 'Vegetables',
  fruits: 'Fruits',
  fruit: 'Fruits',
  dairy: 'Dairy',
  milk: 'Dairy',
  eggs: 'Eggs',
  egg: 'Eggs',
  meat: 'Meat',
  grains: 'Grains',
  grain: 'Grains',
  seeds: 'Seeds',
  seed: 'Seeds',
};

function readJsonStorage(key, fallback, storage = localStorage) {
  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key, value, storage = localStorage) {
  storage.setItem(key, JSON.stringify(value));
}

function getStoredUser() {
  return readJsonStorage('fh_user', null, localStorage)
    || readJsonStorage('fh_user', null, sessionStorage)
    || readJsonStorage('farmershub_user', null, localStorage);
}

function getStoredRole() {
  return localStorage.getItem('fh_role') || sessionStorage.getItem('fh_role') || getStoredUser()?.role || '';
}

function getToken() {
  return localStorage.getItem('fh_token') || sessionStorage.getItem('fh_token') || '';
}

function getUserId(user = getStoredUser()) {
  return user?.id || user?._id || user?.userId || '';
}

function getDisplayName(user = getStoredUser()) {
  return user?.fullName || user?.name || user?.email || 'FarmersHub customer';
}

function getInitials(name) {
  return String(name || 'FH')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'FH';
}

function getProductId(product = {}) {
  return product.id || product._id || product.productId || '';
}

function getProductName(product = {}) {
  return product.name || product.title || 'Fresh product';
}

function getProductCategory(product = {}) {
  const raw = String(product.category || '').trim();
  return CATEGORY_LABELS[raw.toLowerCase()] || raw || 'Fresh';
}

function getProductPrice(product = {}) {
  const value = Number(product.price ?? product.sellingPrice ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function getProductUnit(product = {}) {
  return product.unit || 'unit';
}

function getSellerId(product = {}) {
  return product.seller?.id || product.seller?._id || product.sellerId || product.farmerId || product.userId || '';
}

function getSellerName(product = {}) {
  return product.seller?.name || product.seller?.fullName || product.farmerName || product.sellerName || 'Local farmer';
}

function getSellerLocation(product = {}) {
  return product.seller?.location || product.location || '';
}

function getProductImage(product = {}) {
  if (product.imageUrl) return product.imageUrl;
  if (product.image) return product.image;
  if (product.photoUrl) return product.photoUrl;
  if (Array.isArray(product.images) && product.images.length) {
    const first = product.images[0];
    return typeof first === 'string' ? first : (first.url || first.path || first.secureUrl || '');
  }
  return '';
}

function getFarmerId(farmer = {}) {
  return farmer.id || farmer._id || farmer.userId || '';
}

function getFarmerName(farmer = {}) {
  return farmer.fullName || farmer.farmName || farmer.name || 'Local farmer';
}

function getFarmerImage(farmer = {}) {
  return farmer.avatarUrl || farmer.profileImage || farmer.imageUrl || '';
}

function formatCurrency(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(number) ? number : 0);
}

function formatDate(value) {
  if (!value) return 'Not provided';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not provided';
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

function normalizeCartItem(item = {}) {
  const id = String(item.id || item.productId || '');
  const quantity = Math.max(Number(item.quantity || 1), 1);
  return {
    id,
    name: item.name || 'Fresh product',
    price: Number(item.price || 0),
    unit: item.unit || 'unit',
    sellerId: item.sellerId || '',
    sellerName: item.sellerName || 'Local farmer',
    imageUrl: item.imageUrl || '',
    quantity,
    addedAt: item.addedAt || new Date().toISOString(),
  };
}

function getCartItems() {
  return readJsonStorage(CART_KEY, [])
    .filter((item) => item && (item.id || item.productId))
    .map(normalizeCartItem);
}

function saveCartItems(items) {
  writeJsonStorage(CART_KEY, items.map(normalizeCartItem));
  updateCustomerBadges();
}

function addProductToCart(product = {}, quantity = 1) {
  const id = String(getProductId(product));
  if (!id) {
    return { ok: false, message: 'This product cannot be added because no product id was returned.' };
  }

  const cart = getCartItems();
  const existing = cart.find((item) => String(item.id) === id);
  if (existing) {
    existing.quantity += Math.max(Number(quantity || 1), 1);
  } else {
    cart.push({
      id,
      name: getProductName(product),
      price: getProductPrice(product),
      unit: getProductUnit(product),
      sellerId: getSellerId(product),
      sellerName: getSellerName(product),
      imageUrl: getProductImage(product),
      quantity: Math.max(Number(quantity || 1), 1),
      addedAt: new Date().toISOString(),
    });
  }

  saveCartItems(cart);
  return { ok: true, message: `${getProductName(product)} was added to your cart on this device.` };
}

function favoriteIds() {
  return readJsonStorage(FAVORITES_KEY, [])
    .filter(Boolean)
    .map(String);
}

function saveFavoriteIds(ids) {
  const next = Array.from(new Set(ids.filter(Boolean).map(String)));
  writeJsonStorage(FAVORITES_KEY, next);
  updateCustomerBadges();
}

function isFavorite(productOrId) {
  const id = typeof productOrId === 'string' ? productOrId : getProductId(productOrId);
  return Boolean(id && favoriteIds().includes(String(id)));
}

function toggleFavorite(productOrId) {
  const id = typeof productOrId === 'string' ? productOrId : getProductId(productOrId);
  if (!id) {
    return { saved: false, message: 'This item cannot be saved because no product id was returned.' };
  }

  const current = favoriteIds();
  const exists = current.includes(String(id));
  const next = exists ? current.filter((item) => item !== String(id)) : [...current, String(id)];
  saveFavoriteIds(next);
  return {
    saved: !exists,
    message: exists ? 'Removed from favorites on this device.' : 'Saved to favorites on this device.',
  };
}

function getCustomerPreferences() {
  return readJsonStorage(CUSTOMER_PREFS_KEY, {
    reducedMotion: false,
    largerText: false,
  });
}

function saveCustomerPreferences(preferences) {
  const next = { ...getCustomerPreferences(), ...preferences };
  writeJsonStorage(CUSTOMER_PREFS_KEY, next);
  applyCustomerPreferences(next);
  return next;
}

function applyCustomerPreferences(preferences = getCustomerPreferences()) {
  document.body.classList.toggle('customer-reduced-motion', Boolean(preferences.reducedMotion));
  document.body.classList.toggle('customer-large-text', Boolean(preferences.largerText));
}

function updateCustomerBadges(root = document) {
  const cartCount = getCartItems().reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  const favoriteCount = favoriteIds().length;

  root.querySelectorAll('[data-cart-count]').forEach((node) => {
    node.textContent = String(cartCount);
  });

  root.querySelectorAll('[data-favorite-count]').forEach((node) => {
    node.textContent = String(favoriteCount);
  });
}

function hydrateCustomerShell(root = document) {
  applyCustomerPreferences();
  updateCustomerBadges(root);

  const user = getStoredUser();
  const displayName = getDisplayName(user);

  root.querySelectorAll('[data-customer-name]').forEach((node) => {
    node.textContent = displayName;
  });

  root.querySelectorAll('[data-customer-first-name]').forEach((node) => {
    node.textContent = displayName.split(/\s+/)[0] || 'there';
  });

  root.querySelectorAll('[data-customer-avatar]').forEach((node) => {
    const image = user?.avatarUrl || user?.profileImage || '';
    node.textContent = image ? '' : getInitials(displayName);
    if (image) {
      node.style.backgroundImage = `url("${image}")`;
      node.setAttribute('aria-label', `${displayName} profile`);
    }
  });
}

function customerProductUrl(productOrId) {
  const id = typeof productOrId === 'string' ? productOrId : getProductId(productOrId);
  return id ? `customer-product.html?id=${encodeURIComponent(id)}` : 'customer-marketplace.html';
}

function customerFarmerUrl(farmerOrId) {
  const id = typeof farmerOrId === 'string' ? farmerOrId : getFarmerId(farmerOrId);
  return id ? `customer-farmer-profile.html?farmer=${encodeURIComponent(id)}` : 'customer-marketplace.html';
}

function customerMessageUrl(options = {}) {
  const params = new URLSearchParams();
  if (options.recipientId) params.set('recipientId', options.recipientId);
  if (options.recipientName) params.set('recipientName', options.recipientName);
  if (options.recipientRole) params.set('recipientRole', options.recipientRole);
  if (options.productId) params.set('productId', options.productId);
  if (options.productName) params.set('productName', options.productName);
  return `customer-messages.html${params.toString() ? `?${params.toString()}` : ''}`;
}

function setStatus(element, message, type = '') {
  if (!element) return;
  element.textContent = message || '';
  element.classList.toggle('is-success', type === 'success');
  element.classList.toggle('is-error', type === 'error');
}

function clearCustomerSession() {
  AUTH_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

function logoutCustomer(redirectTo = 'login/login.html') {
  clearCustomerSession();
  window.location.href = redirectTo;
}

function createImageBlock(url, label = 'Product image') {
  const image = document.createElement('div');
  image.className = 'customer-product-image';
  if (url) {
    image.style.backgroundImage = `url("${url}")`;
    image.setAttribute('role', 'img');
    image.setAttribute('aria-label', label);
  } else {
    image.textContent = 'Image pending';
  }
  return image;
}

export {
  CART_KEY,
  FAVORITES_KEY,
  CUSTOMER_PREFS_KEY,
  addProductToCart,
  applyCustomerPreferences,
  clearCustomerSession,
  createImageBlock,
  customerFarmerUrl,
  customerMessageUrl,
  customerProductUrl,
  favoriteIds,
  formatCurrency,
  formatDate,
  getCartItems,
  getDisplayName,
  getFarmerId,
  getFarmerImage,
  getFarmerName,
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
  getStoredRole,
  getStoredUser,
  getToken,
  getUserId,
  getCustomerPreferences,
  hydrateCustomerShell,
  isFavorite,
  logoutCustomer,
  readJsonStorage,
  saveCartItems,
  saveCustomerPreferences,
  saveFavoriteIds,
  setStatus,
  toggleFavorite,
  updateCustomerBadges,
  writeJsonStorage,
};

hydrateCustomerShell();
