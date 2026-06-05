import { getId, getProductName, getSeller, getSellerId, formatMoney } from './format.js';

const CART_KEY = 'fh_cart';
const FAVORITES_KEY = 'fh_favorite_products';

function readJson(key, fallback) {
  try {
    if (typeof window === 'undefined') return fallback;
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function notifyCartChanged(items) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('fh-cart-updated', { detail: { items } }));
}

export function getCartItems() {
  return readJson(CART_KEY, []);
}

export function saveCartItems(items) {
  writeJson(CART_KEY, items);
  notifyCartChanged(items);
}

export function addProductToCart(product) {
  const id = getId(product);
  if (!id) return { ok: false, message: 'This product does not include a stable id.' };

  const cart = getCartItems();
  const existing = cart.find((item) => String(item.id) === id);
  if (existing) {
    existing.quantity = Number(existing.quantity || 1) + 1;
  } else {
    const seller = getSeller(product);
    cart.push({
      id,
      name: getProductName(product),
      price: Number(product.price || product.unitPrice || 0),
      priceLabel: formatMoney(product.price || product.unitPrice),
      image: product.imageUrl || product.image || product.images?.[0]?.url || '',
      sellerId: getSellerId(product),
      sellerName: seller.fullName || seller.name || seller.businessName || product.farmerName || 'Farmer',
      quantity: 1,
    });
  }
  saveCartItems(cart);
  return { ok: true, message: `${getProductName(product)} was added to this browser cart.` };
}

export function favoriteIds() {
  return readJson(FAVORITES_KEY, []).map(String);
}

export function saveFavoriteIds(ids) {
  writeJson(FAVORITES_KEY, Array.from(new Set(ids.map(String))));
}

export function isFavorite(productId) {
  return Boolean(productId && favoriteIds().includes(String(productId)));
}

export function toggleFavorite(product) {
  const id = getId(product);
  if (!id) return { ok: false, message: 'This product does not include a stable id.' };
  const ids = favoriteIds();
  const exists = ids.includes(id);
  saveFavoriteIds(exists ? ids.filter((item) => item !== id) : [...ids, id]);
  return { ok: true, message: exists ? 'Removed from favorites on this device.' : 'Saved to favorites on this device.' };
}
