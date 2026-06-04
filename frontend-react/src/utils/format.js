export function asArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.data?.products)) return data.data.products;
  if (Array.isArray(data?.data?.listings)) return data.data.listings;
  if (Array.isArray(data?.data?.requests)) return data.data.requests;
  if (Array.isArray(data?.data?.notifications)) return data.data.notifications;
  if (Array.isArray(data?.notifications)) return data.notifications;
  return [];
}

export function getId(item = {}) {
  return String(item.id || item._id || item.userId || item.productId || '');
}

export function getProductName(product = {}) {
  return product.name || product.title || product.productName || 'Farm product';
}

export function getSeller(product = {}) {
  return product.farmer || product.seller || product.owner || product.provider || {};
}

export function getSellerId(product = {}) {
  const seller = getSeller(product);
  return String(product.farmerId || product.sellerId || seller.id || seller._id || seller.userId || product.userId || '');
}

export function formatMoney(value, fallback = 'Price pending') {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return `KRW ${number.toLocaleString()}`;
}

export function formatDate(value) {
  if (!value) return 'Date pending';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date pending';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function humanize(value = '') {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Not set';
}

export function resolveMediaUrl(raw = '') {
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = 'https://farmershub-kkjd.onrender.com';
  return `${base}${raw.startsWith('/') ? raw : `/${raw}`}`;
}
