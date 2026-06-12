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

const CUSTOMER_ICONS = {
  home: '<path d="m3 11 9-8 9 8"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-6h4v6"/>',
  marketplace: '<path d="M4 10h16l-1.4 10H5.4L4 10Z"/><path d="m8 10 4-6 4 6"/>',
  social: '<path d="M7 20c6 0 10-4 10-12V4C11 4 7 8 7 14v6Z"/><path d="M7 20c1-5 4-8 9-11"/>',
  orders: '<path d="M4 7h16v13H4Z"/><path d="M8 7a4 4 0 0 1 8 0"/><path d="M9 11h6"/>',
  messages: '<path d="M4 5h16v12H8l-4 3V5Z"/>',
  favorites: '<path d="M12 20s-8-4.7-8-10.2A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 8 3.3C20 15.3 12 20 12 20Z"/>',
  profile: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  settings: '<path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A7 7 0 0 0 15 6.2L14.7 4h-5.4L9 6.2a7 7 0 0 0-1.5.9l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 1.5.9l.3 2.2h5.4l.3-2.2a7 7 0 0 0 1.5-.9l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.5 2.5 0 0 1 4.8 1c0 2-2.6 2-2.6 4"/><path d="M12 17.5v.1"/>',
  cart: '<circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M2 3h3l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6"/>',
  notifications: '<path d="M6.5 10a5.5 5.5 0 0 1 11 0v4l2 2H4.5l2-2v-4Z"/><path d="M10 19a2.4 2.4 0 0 0 4 0"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
};

function createCustomerIcon(name) {
  const paths = CUSTOMER_ICONS[name];
  if (!paths) return null;
  const wrapper = document.createElement('span');
  wrapper.className = 'customer-ui-icon';
  wrapper.setAttribute('aria-hidden', 'true');
  wrapper.innerHTML = `<svg viewBox="0 0 24 24" focusable="false">${paths}</svg>`;
  return wrapper;
}

function getCustomerIconName(element) {
  const label = String(element.getAttribute('aria-label') || element.textContent || '').toLowerCase();
  const href = String(element.getAttribute('href') || '').toLowerCase();
  if (label.includes('notification') || label.includes('bell')) return 'notifications';
  if (label.includes('favorite') || label.includes('fav')) return 'favorites';
  if (label.includes('message') || label.includes('chat') || label.includes('msg')) return 'messages';
  if (label.includes('cart')) return 'cart';
  if (href.includes('marketplace')) return 'marketplace';
  if (href.includes('social-feed')) return 'social';
  if (href.includes('orders')) return 'orders';
  if (href.includes('favorites')) return 'favorites';
  if (href.includes('messages')) return 'messages';
  if (href.includes('profile')) return 'profile';
  if (href.includes('settings')) return 'settings';
  if (href.includes('help')) return 'help';
  if (href.includes('customer.html')) return 'home';
  return '';
}

function hydrateCustomerIcons(root = document) {
  root.querySelectorAll('.customer-nav a, .customer-mobile-nav a, .buyer-menu a, .buyer-bottom-nav a').forEach((link) => {
    if (link.querySelector('.customer-ui-icon')) return;
    const icon = createCustomerIcon(getCustomerIconName(link));
    if (!icon) return;
    const mark = link.querySelector('.customer-nav-mark');
    if (mark) {
      mark.textContent = '';
      mark.appendChild(icon);
    } else {
      Array.from(link.childNodes).forEach((node) => {
        if (node.nodeType === 3) node.remove();
      });
      link.insertBefore(icon, link.firstChild);
    }
  });

  root.querySelectorAll('.customer-icon-button, .buyer-actions a:not(.buyer-avatar)').forEach((link) => {
    if (link.querySelector('.customer-ui-icon')) return;
    const icon = createCustomerIcon(getCustomerIconName(link));
    if (!icon) return;
    Array.from(link.childNodes).forEach((node) => {
      if (node.nodeType === 3) node.remove();
    });
    link.insertBefore(icon, link.firstChild);
  });

  root.querySelectorAll('.customer-search > span, .buyer-search > span').forEach((label) => {
    if (label.querySelector('.customer-ui-icon')) return;
    const icon = createCustomerIcon('search');
    label.textContent = '';
    label.appendChild(icon);
  });
}

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
  return product.id || product._id || product.productId || product.product_id || '';
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
  return product.seller?.id || product.seller?._id || product.seller?.userId
    || product.farmer?.id || product.farmer?._id
    || product.createdBy?.id || product.createdBy?._id
    || product.sellerId || product.farmerId || product.ownerId || product.userId || '';
}

function getSellerName(product = {}) {
  return product.seller?.name || product.seller?.fullName
    || product.farmer?.name || product.farmer?.fullName
    || product.createdBy?.name || product.createdBy?.fullName
    || product.farmerName || product.sellerName || 'Local farmer';
}

function getSellerLocation(product = {}) {
  return product.seller?.location || product.location || '';
}

function resolveImageUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url;
  const base = (typeof window !== 'undefined'
    ? (window.FARMERSHUB_API_BASE || 'https://farmershub-kkjd.onrender.com')
    : 'https://farmershub-kkjd.onrender.com').replace(/\/api$/, '');
  return `${base}${url.startsWith('/') ? url : '/' + url}`;
}

function getProductImage(product = {}) {
  const direct = product.imageUrl || product.image || product.photoUrl
    || product.imagePath || product.thumbnailUrl || product.coverImage || product.mediaUrl;
  if (direct) return resolveImageUrl(direct);
  if (Array.isArray(product.images) && product.images.length) {
    const first = product.images[0];
    const url = typeof first === 'string' ? first
      : (first.url || first.path || first.secureUrl || first.imagePath || '');
    if (url) return resolveImageUrl(url);
  }
  if (Array.isArray(product.media) && product.media.length) {
    const first = product.media[0];
    const url = typeof first === 'string' ? first : (first.url || first.path || '');
    if (url) return resolveImageUrl(url);
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
  hydrateCustomerIcons(root);

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
    image.setAttribute('aria-hidden', 'true');
    image.innerHTML = '<span style="font-size:28px;opacity:.3;user-select:none;">🌾</span>';
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
  hydrateCustomerIcons,
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
