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

const MARKET_CATEGORIES = [
  { label: 'Vegetables', icon: 'Veg', query: 'Vegetables' },
  { label: 'Fruits', icon: 'Fruit', query: 'Fruits' },
  { label: 'Dairy', icon: 'Dairy', query: 'Dairy' },
  { label: 'Meat & Eggs', icon: 'Eggs', query: 'Eggs' },
  { label: 'Grains', icon: 'Grain', query: 'Grains' },
  { label: 'Seeds', icon: 'Seed', query: 'Seeds' },
  { label: 'More', icon: 'All', query: '' },
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
    icon.textContent = category.icon;
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

function renderProducts(products) {
  const visible = products.slice(0, 8);
  productGrid.innerHTML = '';

  if (!visible.length) {
    renderProductState('No products yet', 'Products from farmers will appear here once they are uploaded.');
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
  updateFavoritesNote();
  updateCounts();
});

toggleProvidersBtn?.addEventListener('click', () => {
  showAllProviders = !showAllProviders;
  renderProviders(allFarmers);
});

loadCustomerHome();
