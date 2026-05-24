import { getProducts } from './js/productService.js';
import { getFarmers } from './js/farmerService.js';
import './assets/js/notification-float.js';

const FALLBACK_IMAGES = [
  'assets/images/home/product-tomatoes.webp',
  'assets/images/home/product-onions.webp',
  'assets/images/home/support-basket.webp',
  'assets/images/home/hero-delivery.webp',
];

const CATEGORY_IMAGES = {
  vegetables: 'assets/images/home/product-tomatoes.webp',
  vegetable: 'assets/images/home/product-tomatoes.webp',
  tomatoes: 'assets/images/home/product-tomatoes.webp',
  tomato: 'assets/images/home/product-tomatoes.webp',
  onions: 'assets/images/home/product-onions.webp',
  onion: 'assets/images/home/product-onions.webp',
  organic: 'assets/images/home/product-compost.webp',
  compost: 'assets/images/home/product-compost.webp',
  dairy: 'assets/images/home/hero-delivery.webp',
  milk: 'assets/images/home/hero-delivery.webp',
  eggs: 'assets/images/home/support-basket.webp',
  egg: 'assets/images/home/support-basket.webp',
  meat: 'assets/images/home/service-delivery.webp',
  fruits: 'assets/images/home/support-basket.webp',
  fruit: 'assets/images/home/support-basket.webp',
};

const MARKET_CATEGORIES = [
  { label: 'Vegetables', icon: '🥬', query: 'Vegetables' },
  { label: 'Fruits', icon: '🍎', query: 'Fruits' },
  { label: 'Dairy', icon: '🥛', query: 'Dairy' },
  { label: 'Meat & Eggs', icon: '🥚', query: 'Eggs' },
  { label: 'Grains', icon: '🌾', query: 'Grains' },
  { label: 'Seeds', icon: '🌱', query: 'Seeds' },
  { label: 'More', icon: '➕', query: '' },
];

const productGrid = document.getElementById('customerProducts');
const providerGrid = document.getElementById('customerProviders');
const categoryGrid = document.getElementById('customerCategories');
const productTemplate = document.getElementById('customerProductTemplate');
const providerTemplate = document.getElementById('customerProviderTemplate');
const searchForm = document.getElementById('customerSearchForm');
const searchInput = document.getElementById('customerSearchInput');
const favoritesNote = document.getElementById('favoritesNote');
const clearFavoritesBtn = document.getElementById('clearFavoritesBtn');

let allProducts = [];
let allFarmers = [];

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('fh_user') || sessionStorage.getItem('fh_user') || 'null');
  } catch {
    return null;
  }
}

function getProductId(product) {
  return product.id || product._id || product.productId || product.slug || product.name || '';
}

function getSellerId(product) {
  return product.seller?.id || product.seller?._id || product.sellerId || product.farmerId || product.userId || '';
}

function getSellerName(product) {
  return product.seller?.name || product.seller?.fullName || product.farmerName || 'Local farmer';
}

function getProductImage(product, index = 0) {
  if (product.imageUrl) return product.imageUrl;
  if (product.image) return product.image;
  if (product.photoUrl) return product.photoUrl;
  if (Array.isArray(product.images) && product.images.length) {
    const first = product.images[0];
    return typeof first === 'string' ? first : (first.url || first.path || first.secureUrl || '');
  }

  const key = String(product.category || product.name || '').toLowerCase();
  const categoryImage = Object.entries(CATEGORY_IMAGES).find(([name]) => key.includes(name))?.[1];
  return categoryImage || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

function getFarmerId(farmer) {
  return farmer.id || farmer._id || farmer.userId || '';
}

function getFarmerImage(farmer, index = 0) {
  if (farmer.avatarUrl) return farmer.avatarUrl;
  if (farmer.profileImage) return farmer.profileImage;
  return [
    'assets/images/home/farmer-fallback-1.webp',
    'assets/images/home/farmer-fallback-2.webp',
    'assets/images/home/farmer-fallback-3.webp',
  ][index % 3];
}

function productUrl(product, extra = {}) {
  const params = new URLSearchParams(extra);
  const id = getProductId(product);
  if (id) {
    params.set('productId', id);
    params.set('id', id);
  }
  return `product.html${params.toString() ? `?${params.toString()}` : ''}`;
}

function favoriteIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem('fh_favorite_products') || '[]');
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function saveFavoriteIds(ids) {
  localStorage.setItem('fh_favorite_products', JSON.stringify(Array.from(new Set(ids.map(String)))));
  updateFavoritesNote();
}

function isFavorite(product) {
  const id = String(getProductId(product));
  return Boolean(id && favoriteIds().includes(id));
}

function updateSaveButton(button, product) {
  const saved = isFavorite(product);
  button.textContent = saved ? '♥ Saved' : '♡ Save';
  button.setAttribute('aria-pressed', saved ? 'true' : 'false');
}

function toggleFavorite(product, button) {
  const id = String(getProductId(product));
  if (!id) return;
  const ids = favoriteIds();
  const next = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
  saveFavoriteIds(next);
  updateSaveButton(button, product);
}

function updateFavoritesNote() {
  const count = favoriteIds().length;
  if (!favoritesNote) return;
  favoritesNote.textContent = count
    ? `${count} product${count === 1 ? '' : 's'} saved. Open product cards to continue shopping.`
    : 'Saved products will appear after you tap Save on product cards.';
}

function renderCategories() {
  categoryGrid.innerHTML = '';
  MARKET_CATEGORIES.forEach((category) => {
    const link = document.createElement('a');
    link.className = 'category-card';
    link.href = category.query
      ? `product.html?category=${encodeURIComponent(category.query)}`
      : 'product.html';
    link.innerHTML = `<span>${category.icon}</span>${category.label}`;
    categoryGrid.appendChild(link);
  });
}

function renderProducts(products) {
  const visible = products.slice(0, 8);
  productGrid.innerHTML = '';

  if (!visible.length) {
    productGrid.innerHTML = '<div class="community-card"><strong>No products yet</strong><span>Products from farmers will appear here once they are uploaded.</span></div>';
    return;
  }

  visible.forEach((product, index) => {
    const card = productTemplate.content.firstElementChild.cloneNode(true);
    const productId = getProductId(product);
    const sellerId = getSellerId(product);
    const sellerName = getSellerName(product);
    const image = getProductImage(product, index);
    const price = Number(product.price || product.sellingPrice || 0).toLocaleString();

    card.querySelector('.product-image').style.backgroundImage = `url("${image}")`;
    card.querySelector('.product-category').textContent = product.category || 'Fresh';
    card.querySelector('h3').textContent = product.name || 'Fresh product';
    card.querySelector('.product-farmer').textContent = `by ${sellerName}`;
    card.querySelector('.product-price').textContent = `₩${price} / ${product.unit || 'unit'}`;

    card.querySelector('.view-product').href = productUrl(product);
    card.querySelector('.order-product').href = productUrl(product, { intent: 'order' });

    const message = card.querySelector('.message-farmer');
    if (sellerId) {
      const params = new URLSearchParams({
        recipientId: sellerId,
        recipientName: sellerName,
        recipientRole: 'farmer',
      });
      if (productId) params.set('productId', productId);
      message.href = `messages.html?${params.toString()}`;
    }

    const saveButton = card.querySelector('.save-product');
    updateSaveButton(saveButton, product);
    saveButton.addEventListener('click', () => toggleFavorite(product, saveButton));

    productGrid.appendChild(card);
  });
}

function renderProviders(farmers) {
  providerGrid.innerHTML = '';
  const visible = farmers.slice(0, 6);

  if (!visible.length) {
    providerGrid.innerHTML = '<div class="community-card"><strong>No nearby farmers yet</strong><span>Farmer/provider profiles will appear here when available.</span></div>';
    return;
  }

  visible.forEach((farmer, index) => {
    const card = providerTemplate.content.firstElementChild.cloneNode(true);
    const farmerId = getFarmerId(farmer);
    const image = getFarmerImage(farmer, index);
    const name = farmer.fullName || farmer.farmName || 'Local farmer';

    card.querySelector('.provider-avatar').style.backgroundImage = `url("${image}")`;
    card.querySelector('h3').textContent = name;
    card.querySelector('p').textContent = farmer.location || farmer.address || 'Nearby local provider';
    card.querySelector('span').textContent = farmer.farmType || farmer.bio || 'Fresh products and farm support';

    if (farmerId) {
      card.querySelector('.provider-profile').href = `profile.html?farmer=${encodeURIComponent(farmerId)}`;
      const params = new URLSearchParams({
        recipientId: farmer.userId || farmerId,
        recipientName: name,
        recipientRole: 'farmer',
      });
      card.querySelector('.provider-message').href = `messages.html?${params.toString()}`;
    }

    providerGrid.appendChild(card);
  });
}

function filterProducts(query) {
  const term = query.trim().toLowerCase();
  if (!term) return allProducts;
  return allProducts.filter((product) => [
    product.name,
    product.category,
    product.description,
    getSellerName(product),
  ].some((value) => String(value || '').toLowerCase().includes(term)));
}

function setupUser() {
  const user = getStoredUser();
  const greeting = document.getElementById('customerGreeting');
  const avatar = document.getElementById('customerAvatar');

  if (user?.fullName && greeting) {
    greeting.textContent = `Find fresh food near you, ${user.fullName.split(' ')[0]}`;
  }

  if (user?.avatarUrl && avatar) {
    avatar.textContent = '';
    avatar.style.backgroundImage = `url("${user.avatarUrl}")`;
    avatar.style.backgroundSize = 'cover';
    avatar.style.backgroundPosition = 'center';
  }
}

async function loadCustomerHome() {
  setupUser();
  renderCategories();
  updateFavoritesNote();

  productGrid.innerHTML = '<div class="community-card"><strong>Loading products...</strong><span>Fetching fresh listings from FarmersHub.</span></div>';
  providerGrid.innerHTML = '<div class="community-card"><strong>Loading farmers...</strong><span>Finding local farmers and providers.</span></div>';

  const [productsResult, farmersResult] = await Promise.allSettled([
    getProducts({ limit: 100 }),
    getFarmers({ limit: 50 }),
  ]);

  allProducts = productsResult.status === 'fulfilled' ? (productsResult.value.data || []) : [];
  allFarmers = farmersResult.status === 'fulfilled' ? (farmersResult.value.data || []) : [];

  renderProducts(allProducts);
  renderProviders(allFarmers);
}

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  renderProducts(filterProducts(searchInput.value || ''));
});

searchInput?.addEventListener('input', () => {
  renderProducts(filterProducts(searchInput.value || ''));
});

clearFavoritesBtn?.addEventListener('click', () => {
  saveFavoriteIds([]);
  renderProducts(filterProducts(searchInput?.value || ''));
});

loadCustomerHome();
