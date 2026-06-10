import { getProducts } from './js/productService.js';
import { getFarmers } from './js/farmerService.js';
import {
  addProductToCart,
  customerFarmerUrl,
  customerMessageUrl,
  customerProductUrl,
  favoriteIds,
  getCartItems,
  getDisplayName,
  getFarmerId,
  getFarmerName,
  getInitials,
  getProductCategory,
  getProductId,
  getProductImage,
  getProductName,
  getProductPrice,
  getProductUnit,
  getSellerId,
  getSellerName,
  getStoredUser,
  hydrateCustomerShell,
  isFavorite,
  saveFavoriteIds,
  toggleFavorite,
} from './assets/js/customer-shell.js';

const FALLBACK_IMAGES = [
  'assets/images/home/product-tomatoes.webp',
  'assets/images/home/product-onions.webp',
  'assets/images/home/support-basket.webp',
  'assets/images/home/hero-delivery.webp',
];

const FARMER_FALLBACK_IMAGES = [
  'assets/images/home/farmer-fallback-1.webp',
  'assets/images/home/farmer-fallback-2.webp',
  'assets/images/home/farmer-fallback-3.webp',
];

const CATEGORY_ICONS = {
  vegetables: '<path d="M7 20c6 0 10-4 10-12V4C11 4 7 8 7 14v6Z"/><path d="M7 20c1-5 4-8 9-11"/>',
  fruits: '<path d="M12 7c-4-3-8 0-8 5.2C4 17 7.6 21 12 21s8-4 8-8.8C20 7 16 4 12 7Z"/><path d="M12 7c0-2 1.2-3.5 3.5-4"/><path d="M12 6c-2.3 0-3.8-1-4.5-2.5"/>',
  dairy: '<path d="M8 3h8l1 4-2 3v11H9V10L7 7Z"/><path d="M9 10h6M8 7h9"/>',
  eggs: '<path d="M12 3c-3 0-6 6-6 11a6 6 0 0 0 12 0c0-5-3-11-6-11Z"/>',
  grains: '<path d="M12 21V5"/><path d="M12 9c-3 0-5-2-5-5 3 0 5 2 5 5ZM12 14c-3 0-5-2-5-5 3 0 5 2 5 5ZM12 19c-3 0-5-2-5-5 3 0 5 2 5 5ZM12 9c3 0 5-2 5-5-3 0-5 2-5 5ZM12 14c3 0 5-2 5-5-3 0-5 2-5 5Z"/>',
  seeds: '<path d="M12 20c-5 0-8-3-8-7 0-5 5-8 8-10 3 2 8 5 8 10 0 4-3 7-8 7Z"/><path d="M12 20V8"/><path d="M12 13c-2-2-4-2-6-1M12 16c2-2 4-2 6-1"/>',
  more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
};

const MARKET_CATEGORIES = [
  { label: 'Vegetables', icon: 'vegetables', query: 'Vegetables' },
  { label: 'Fruits', icon: 'fruits', query: 'Fruits' },
  { label: 'Dairy', icon: 'dairy', query: 'Dairy' },
  { label: 'Meat & Eggs', icon: 'eggs', query: 'Eggs' },
  { label: 'Grains', icon: 'grains', query: 'Grains' },
  { label: 'Seeds', icon: 'seeds', query: 'Seeds' },
  { label: 'More', icon: 'more', query: '' },
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
const toggleProvidersBtn = document.getElementById('toggleProvidersBtn');
const favoriteCount = document.getElementById('favoriteCount');
const cartCount = document.getElementById('cartCount');

let allProducts = [];
let allFarmers = [];
let showAllProviders = false;

function formatKrw(value) {
  return Number(value || 0).toLocaleString('ko-KR');
}

function getProductCardImage(product, index = 0) {
  return getProductImage(product) || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

function getFarmerCardImage(farmer, index = 0) {
  return farmer.avatarUrl || farmer.profileImage || FARMER_FALLBACK_IMAGES[index % FARMER_FALLBACK_IMAGES.length];
}

function updateCounts() {
  const cartItems = getCartItems();
  const cartTotal = cartItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  if (cartCount) cartCount.textContent = String(cartTotal);
  if (favoriteCount) favoriteCount.textContent = String(favoriteIds().length);
  hydrateCustomerShell();
}

function updateFavoritesNote() {
  const count = favoriteIds().length;
  if (!favoritesNote) return;
  favoritesNote.textContent = count
    ? `${count} product${count === 1 ? '' : 's'} saved on this device. Open Favorites to review them.`
    : 'Saved products will appear after you tap Save on product cards.';
}

function setSaveButton(button, product) {
  const saved = isFavorite(product);
  button.textContent = saved ? 'Saved' : 'Save';
  button.setAttribute('aria-pressed', saved ? 'true' : 'false');
}

function renderCategories() {
  categoryGrid.innerHTML = '';
  MARKET_CATEGORIES.forEach((category) => {
    const link = document.createElement('a');
    link.className = 'category-card';
    link.href = category.query
      ? `customer-marketplace.html?category=${encodeURIComponent(category.query)}`
      : 'customer-marketplace.html';

    const icon = document.createElement('span');
    icon.className = 'category-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = `<svg viewBox="0 0 24 24" focusable="false">${CATEGORY_ICONS[category.icon]}</svg>`;
    link.append(icon, document.createTextNode(category.label));
    categoryGrid.appendChild(link);
  });
}

function renderProductState(title, body) {
  productGrid.innerHTML = '';
  const state = document.createElement('div');
  state.className = 'community-card';
  const heading = document.createElement('strong');
  heading.textContent = title;
  const copy = document.createElement('span');
  copy.textContent = body;
  state.append(heading, copy);
  productGrid.appendChild(state);
}

function renderProducts(products, hasActiveSearch = false) {
  const visible = products.slice(0, 8);
  productGrid.innerHTML = '';

  if (!visible.length) {
    renderProductState(
      hasActiveSearch ? 'No matching products' : 'No products yet',
      hasActiveSearch
        ? 'Try another product, category, or farmer name.'
        : 'Products from farmers will appear here once they are uploaded.'
    );
    return;
  }

  visible.forEach((product, index) => {
    const card = productTemplate.content.firstElementChild.cloneNode(true);
    const productId = getProductId(product);
    const sellerId = getSellerId(product);
    const sellerName = getSellerName(product);
    const image = getProductCardImage(product, index);

    card.querySelector('.product-image').style.backgroundImage = `url("${image}")`;
    card.querySelector('.product-category').textContent = getProductCategory(product);
    card.querySelector('h3').textContent = getProductName(product);
    card.querySelector('.product-farmer').textContent = `by ${sellerName}`;
    card.querySelector('.product-price').textContent = `KRW ${formatKrw(getProductPrice(product))} / ${getProductUnit(product)}`;

    const viewLink = card.querySelector('.view-product');
    viewLink.href = productId ? customerProductUrl(product) : 'customer-marketplace.html';

    const cartLink = card.querySelector('.order-product');
    cartLink.href = 'customer-cart.html';
    cartLink.addEventListener('click', () => {
      addProductToCart(product);
      updateCounts();
    });

    const message = card.querySelector('.message-farmer');
    if (sellerId) {
      message.href = customerMessageUrl({
        recipientId: sellerId,
        recipientName: sellerName,
        recipientRole: 'farmer',
        productId,
        productName: getProductName(product),
      });
    } else {
      message.href = 'customer-messages.html';
      message.setAttribute('aria-disabled', 'true');
    }

    const saveButton = card.querySelector('.save-product');
    setSaveButton(saveButton, product);
    saveButton.disabled = !productId;
    saveButton.addEventListener('click', () => {
      toggleFavorite(product);
      setSaveButton(saveButton, product);
      updateFavoritesNote();
      updateCounts();
    });

    productGrid.appendChild(card);
  });
}

function renderProviders(farmers) {
  providerGrid.innerHTML = '';
  const visible = showAllProviders ? farmers : farmers.slice(0, 3);

  if (toggleProvidersBtn) {
    toggleProvidersBtn.style.display = farmers.length > 3 ? 'inline-flex' : 'none';
    toggleProvidersBtn.textContent = showAllProviders ? 'Show less' : 'See all';
  }

  if (!visible.length) {
    const state = document.createElement('div');
    state.className = 'community-card';
    const heading = document.createElement('strong');
    heading.textContent = 'No nearby farmers yet';
    const copy = document.createElement('span');
    copy.textContent = 'Farmer/provider profiles will appear here when available.';
    state.append(heading, copy);
    providerGrid.appendChild(state);
    return;
  }

  visible.forEach((farmer, index) => {
    const card = providerTemplate.content.firstElementChild.cloneNode(true);
    const farmerId = getFarmerId(farmer);
    const image = getFarmerCardImage(farmer, index);
    const name = getFarmerName(farmer);

    card.querySelector('.provider-avatar').style.backgroundImage = `url("${image}")`;
    card.querySelector('h3').textContent = name;
    card.querySelector('p').textContent = farmer.location || farmer.address || 'Nearby local provider';
    card.querySelector('span').textContent = farmer.farmType || farmer.bio || 'Fresh products and farm support';

    const profileLink = card.querySelector('.provider-profile');
    const messageLink = card.querySelector('.provider-message');
    if (farmerId) {
      profileLink.href = customerFarmerUrl(farmerId);
      messageLink.href = customerMessageUrl({
        recipientId: farmer.userId || farmerId,
        recipientName: name,
        recipientRole: 'farmer',
      });
    } else {
      profileLink.href = 'customer-marketplace.html';
      messageLink.href = 'customer-messages.html';
    }

    providerGrid.appendChild(card);
  });
}

function filterProducts(query) {
  const term = query.trim().toLowerCase();
  if (!term) return allProducts;
  return allProducts.filter((product) => [
    getProductName(product),
    getProductCategory(product),
    product.description,
    getSellerName(product),
  ].some((value) => String(value || '').toLowerCase().includes(term)));
}

function filterFarmers(query) {
  const term = query.trim().toLowerCase();
  if (!term) return allFarmers;
  return allFarmers.filter((farmer) => [
    getFarmerName(farmer),
    farmer.farmName,
    farmer.farmType,
    farmer.bio,
    farmer.location,
    farmer.address,
  ].some((value) => String(value || '').toLowerCase().includes(term)));
}

function renderSearchResults() {
  const query = searchInput?.value || '';
  const hasActiveSearch = Boolean(query.trim());
  renderProducts(filterProducts(query), hasActiveSearch);
  renderProviders(filterFarmers(query));
}

function setupUser() {
  const user = getStoredUser();
  const greeting = document.getElementById('customerGreeting');
  const avatar = document.getElementById('customerAvatar');
  const displayName = getDisplayName(user);

  if (user?.fullName && greeting) {
    greeting.textContent = `Find fresh food near you, ${user.fullName.split(' ')[0]}`;
  }

  if (avatar) {
    const image = user?.avatarUrl || user?.profileImage || '';
    avatar.textContent = image ? '' : getInitials(displayName);
    if (image) {
      avatar.style.backgroundImage = `url("${image}")`;
      avatar.style.backgroundSize = 'cover';
      avatar.style.backgroundPosition = 'center';
    }
  }
}

async function loadCustomerHome() {
  setupUser();
  renderCategories();
  updateFavoritesNote();
  updateCounts();

  productGrid.innerHTML = '<div class="community-card"><strong>Loading products...</strong><span>Fetching fresh listings from FarmersHub.</span></div>';
  providerGrid.innerHTML = '<div class="community-card"><strong>Loading farmers...</strong><span>Finding local farmers and providers.</span></div>';

  const [productsResult, farmersResult] = await Promise.allSettled([
    getProducts({ limit: 100 }),
    getFarmers({ limit: 50 }),
  ]);

  allProducts = productsResult.status === 'fulfilled' ? (productsResult.value.data || []) : [];
  allFarmers = farmersResult.status === 'fulfilled' ? (farmersResult.value.data || []) : [];

  renderSearchResults();
}

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = String(searchInput?.value || '').trim();
  if (!query) {
    renderSearchResults();
    return;
  }
  window.location.href = `customer-marketplace.html?search=${encodeURIComponent(query)}`;
});

searchInput?.addEventListener('input', renderSearchResults);

clearFavoritesBtn?.addEventListener('click', () => {
  saveFavoriteIds([]);
  renderSearchResults();
  updateFavoritesNote();
  updateCounts();
});

toggleProvidersBtn?.addEventListener('click', () => {
  showAllProviders = !showAllProviders;
  renderProviders(allFarmers);
});

loadCustomerHome();
