import { getProducts } from './services/productService.js';
import { getFarmers } from './services/farmerService.js';
import { getProfile } from './services/profileService.js';

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('fh_user') || 'null');
  } catch {
    return null;
  }
}

function getUserId(user) {
  return user?.id || user?._id || user?.userId || '';
}

function getProductId(product) {
  return product?.id || product?._id || product?.productId || '';
}

function getProductImage(product) {
  if (product?.imageUrl) return product.imageUrl;
  if (product?.image) return product.image;
  if (product?.photoUrl) return product.photoUrl;

  if (Array.isArray(product?.images) && product.images.length) {
    const first = product.images[0];
    return typeof first === 'string'
      ? first
      : (first.url || first.path || first.secureUrl || '');
  }

  if (Array.isArray(product?.media) && product.media.length) {
    const first = product.media[0];
    return typeof first === 'string'
      ? first
      : (first.url || first.path || first.secureUrl || '');
  }

  return '';
}

function getProductFallback(product, index) {
  const key = String(product?.category || product?.name || '').toLowerCase();

  if (key.includes('tomato') || key.includes('vegetable')) {
    return 'assets/images/home/product-tomatoes.webp';
  }
  if (key.includes('onion')) {
    return 'assets/images/home/product-onions.webp';
  }
  if (key.includes('organic') || key.includes('compost')) {
    return 'assets/images/home/product-compost.webp';
  }

  const fallbacks = [
    'assets/images/home/product-tomatoes.webp',
    'assets/images/home/product-onions.webp',
    'assets/images/home/support-basket.webp'
  ];

  return fallbacks[index % fallbacks.length];
}

function formatWon(value) {
  return `₩${Number(value || 0).toLocaleString()}`;
}

function getStockValue(product) {
  const possibleValues = [
    product?.stock,
    product?.quantity,
    product?.availableQuantity,
    product?.availableStock
  ];

  const value = possibleValues.find((item) => item !== undefined && item !== null && item !== '');
  return value === undefined ? null : Number(value);
}

function getStockLabel(product) {
  const stock = getStockValue(product);
  const unit = product?.unit || '';

  if (stock === null || Number.isNaN(stock)) {
    return 'Stock: check listing';
  }

  return `Stock: ${stock}${unit ? ` ${unit}` : ''}`;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderGreeting(user) {
  const farmName = user?.farmName || user?.fullName || 'Your Farm';
  setText('farmerDashboardGreeting', `${farmName} 🌱`);
}

function renderFarmerIdentity(profile, storedUser) {
  const farmer = profile || storedUser || {};
  const fullName = farmer.fullName || storedUser?.fullName || 'Farmer';
  const farmName = farmer.farmName || storedUser?.farmName || fullName || 'My Farm';
  const avatarUrl = farmer.avatarUrl || storedUser?.avatarUrl || '';

  setText('farmerDashboardGreeting', `${farmName} 🌱`);
  setText('farmerHeaderName', fullName);
  setText('farmerHeaderFarm', farmName);

  const avatar = document.getElementById('farmerHeaderAvatar');
  if (avatar && avatarUrl) {
    avatar.style.backgroundImage = `url('${avatarUrl}')`;
  }
}

function renderYourProducts(products) {
  const grid = document.getElementById('farmerProductGrid');
  if (!grid) return;

  setText('fdProductCount', String(products.length));
  setText('fdStoreProducts', String(products.length));

  const lowStockCount = products.filter((product) => {
    const stock = getStockValue(product);
    return stock !== null && !Number.isNaN(stock) && stock <= 10;
  }).length;
  setText('fdLowStockCount', String(lowStockCount));

  if (!products.length) {
    grid.innerHTML = `
      <article class="fd-product">
        <div class="fd-product-body">
          <h4>No products listed yet</h4>
          <p class="stock">Add your first crop listing to show it on your dashboard.</p>
          <div class="fd-product-actions">
            <a href="login/sell_crops.html">Add Product</a>
          </div>
        </div>
      </article>
    `;
    return;
  }

  grid.innerHTML = '';

  products.slice(0, 6).forEach((product, index) => {
    const productId = getProductId(product);
    const name = product.name || 'Farm product';
    const price = product.price || product.sellingPrice || 0;
    const image = getProductImage(product) || getProductFallback(product, index);
    const editUrl = productId
      ? `login/sell_crops.html?productId=${encodeURIComponent(productId)}`
      : 'login/sell_crops.html';
    const listingUrl = productId
      ? `product.html?productId=${encodeURIComponent(productId)}&id=${encodeURIComponent(productId)}`
      : 'product.html';

    const card = document.createElement('article');
    card.className = 'fd-product';
    card.innerHTML = `
      <div class="fd-product-image">
        <img src="${image}" alt="${name}" loading="lazy">
      </div>
      <div class="fd-product-body">
        <h4>${name}</h4>
        <p class="price">${formatWon(price)}</p>
        <p class="stock">${getStockLabel(product)}</p>
        <div class="fd-product-actions">
          <a href="${listingUrl}">View</a>
          <a href="${editUrl}">Manage</a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderFarmerFriends(farmers, currentUserId) {
  const container = document.getElementById('farmerFriendsGrid');
  if (!container) return;

  const friends = farmers
    .filter((farmer) => String(farmer.id || farmer._id || farmer.userId || '') !== String(currentUserId))
    .slice(0, 5);

  setText('fdFriendCount', String(friends.length));

  if (!friends.length) {
    container.innerHTML = `
      <div class="fd-person">
        <div class="fd-person-info">
          <h4>No farmer connections yet</h4>
          <p>Other farmer profiles will appear here when available.</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = '';

  const fallbackAvatars = [
    'assets/images/home/farmer-fallback-1.webp',
    'assets/images/home/farmer-fallback-2.webp',
    'assets/images/home/farmer-fallback-3.webp'
  ];

  friends.forEach((farmer, index) => {
    const farmerId = farmer.id || farmer._id || farmer.userId || '';
    const recipientId = farmer.userId || farmerId;
    const name = farmer.farmName || farmer.fullName || 'Local Farmer';
    const specialty = farmer.farmType || farmer.bio || farmer.location || 'Local grower';
    const avatar = farmer.avatarUrl || fallbackAvatars[index % fallbackAvatars.length];

    const row = document.createElement('div');
    row.className = 'fd-person';
    row.innerHTML = `
      <div class="fd-person-avatar" style="background-image:url('${avatar}')"></div>
      <div class="fd-person-info">
        <h4>${name}</h4>
        <p>${specialty}</p>
      </div>
      <a class="fd-mini-action" href="messages.html?recipientId=${encodeURIComponent(recipientId)}&recipientName=${encodeURIComponent(name)}&recipientRole=farmer">Message</a>
    `;
    container.appendChild(row);
  });
}

async function initialiseFarmerDashboard() {
  if (document.body.dataset.userRole !== 'farmer') return;

  const user = getStoredUser();
  const farmerId = getUserId(user);

  renderGreeting(user);

  if (!farmerId) {
    const grid = document.getElementById('farmerProductGrid');
    if (grid) {
      grid.innerHTML = `
        <article class="fd-product">
          <div class="fd-product-body">
            <h4>Session information missing</h4>
            <p class="stock">Log in again to load your farm products securely.</p>
          </div>
        </article>
      `;
    }
    return;
  }

  const [profileResult, productsResult, farmersResult] = await Promise.allSettled([
    getProfile(),
    getProducts({ farmerId, limit: 12 }),
    getFarmers({ limit: 12 })
  ]);

  if (profileResult.status === 'fulfilled') {
    renderFarmerIdentity(profileResult.value.data || {}, user);
  } else {
    renderFarmerIdentity(null, user);
  }

  if (productsResult.status === 'fulfilled') {
    renderYourProducts(productsResult.value.data || []);
  } else {
    const grid = document.getElementById('farmerProductGrid');
    if (grid) {
      grid.innerHTML = `
        <article class="fd-product">
          <div class="fd-product-body">
            <h4>Products could not be loaded</h4>
            <p class="stock">We will inspect the products function after the UI is visible.</p>
          </div>
        </article>
      `;
    }
  }

  if (farmersResult.status === 'fulfilled') {
    renderFarmerFriends(farmersResult.value.data || [], farmerId);
  } else {
    const container = document.getElementById('farmerFriendsGrid');
    if (container) {
      container.innerHTML = `
        <div class="fd-person">
          <div class="fd-person-info">
            <h4>Farmer friends unavailable</h4>
            <p>We will inspect this connection after the UI test.</p>
          </div>
        </div>
      `;
    }
  }
}

document.addEventListener('DOMContentLoaded', initialiseFarmerDashboard);
