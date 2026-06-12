import { getProducts } from './services/productService.js';
import { getFarmers } from './services/farmerService.js';
import { getProfile } from './services/profileService.js';
import { getFeed } from './services/postService.js';
import { apiFetch, jsonHeaders, getToken } from './config/api.config.js';

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

async function getFarmerStats() {
  const token = getToken();
  if (!token) return null;
  try {
    const response = await apiFetch('/users/me/farm-stats', { headers: jsonHeaders() });
    return response.data || null;
  } catch {
    return null;
  }
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function clearElement(element) {
  if (element) {
    element.textContent = '';
  }
}

function appendStateCard(container, className, title, text, action = null) {
  if (!container) return;
  clearElement(container);

  const card = document.createElement('article');
  card.className = className;

  const body = document.createElement('div');
  body.className = className === 'fd-product' ? 'fd-product-body' : '';

  const heading = document.createElement('h4');
  heading.textContent = title;

  const copy = document.createElement('p');
  copy.className = 'stock';
  copy.textContent = text;

  body.append(heading, copy);

  if (action) {
    const actions = document.createElement('div');
    actions.className = 'fd-product-actions';
    const link = document.createElement('a');
    link.href = action.href;
    link.textContent = action.label;
    actions.appendChild(link);
    body.appendChild(actions);
  }

  card.appendChild(body);
  container.appendChild(card);
}

function setOwnStoreLinks(userId) {
  const href = userId ? `profile.html?farmer=${encodeURIComponent(userId)}` : 'profile.html';
  document.querySelectorAll('[data-own-store-link], .fd-header-profile').forEach((link) => {
    link.setAttribute('href', href);
  });
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
  const userId = getUserId(farmer) || getUserId(storedUser);

  setText('farmerDashboardGreeting', `${farmName} 🌱`);
  setText('farmerHeaderName', fullName);
  setText('farmerHeaderFarm', farmName);
  setOwnStoreLinks(userId);

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
    appendStateCard(grid, 'fd-product', 'No products listed yet', 'Add your first crop listing to show it on your dashboard.', {
      href: 'login/sell_crops.html',
      label: 'Add Product',
    });
    return;
  }

  clearElement(grid);

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

    const imageWrap = document.createElement('div');
    imageWrap.className = 'fd-product-image';
    const img = document.createElement('img');
    img.src = image;
    img.alt = name;
    img.loading = 'lazy';
    imageWrap.appendChild(img);

    const body = document.createElement('div');
    body.className = 'fd-product-body';
    const title = document.createElement('h4');
    title.textContent = name;
    const priceEl = document.createElement('p');
    priceEl.className = 'price';
    priceEl.textContent = formatWon(price);
    const stockEl = document.createElement('p');
    stockEl.className = 'stock';
    stockEl.textContent = getStockLabel(product);
    const actions = document.createElement('div');
    actions.className = 'fd-product-actions';
    const viewLink = document.createElement('a');
    viewLink.href = listingUrl;
    viewLink.textContent = 'View';
    const manageLink = document.createElement('a');
    manageLink.href = editUrl;
    manageLink.textContent = 'Manage';
    actions.append(viewLink, manageLink);
    body.append(title, priceEl, stockEl, actions);
    card.append(imageWrap, body);
    grid.appendChild(card);
  });
}

function renderDiscoveredFarmers(farmers, currentUserId) {
  const container = document.getElementById('farmerFriendsGrid');
  if (!container) return;

  const discoveredFarmers = farmers
    .filter((farmer) => String(farmer.id || farmer._id || farmer.userId || '') !== String(currentUserId))
    .slice(0, 5);

  setText('fdFriendCount', String(discoveredFarmers.length));

  if (!discoveredFarmers.length) {
    container.innerHTML = `
      <div class="fd-person">
        <div class="fd-person-info">
          <h4>No farmers found yet</h4>
          <p>Public farmer profiles will appear here when available.</p>
        </div>
      </div>
    `;
    return;
  }

  clearElement(container);

  const fallbackAvatars = [
    'assets/images/home/farmer-fallback-1.webp',
    'assets/images/home/farmer-fallback-2.webp',
    'assets/images/home/farmer-fallback-3.webp'
  ];

  discoveredFarmers.forEach((farmer, index) => {
    const farmerId = farmer.id || farmer._id || farmer.userId || '';
    const recipientId = farmer.userId || farmerId;
    const name = farmer.farmName || farmer.fullName || 'Local Farmer';
    const specialty = farmer.farmType || farmer.bio || farmer.location || 'Local grower';
    const avatar = farmer.avatarUrl || fallbackAvatars[index % fallbackAvatars.length];

    const row = document.createElement('div');
    row.className = 'fd-person';

    const avatarEl = document.createElement('div');
    avatarEl.className = 'fd-person-avatar';
    avatarEl.style.backgroundImage = `url('${avatar}')`;

    const info = document.createElement('div');
    info.className = 'fd-person-info';
    const heading = document.createElement('h4');
    heading.textContent = name;
    const copy = document.createElement('p');
    copy.textContent = specialty;
    info.append(heading, copy);

    const link = document.createElement('a');
    link.className = 'fd-mini-action';
    link.href = `messages.html?recipientId=${encodeURIComponent(recipientId)}&recipientName=${encodeURIComponent(name)}&recipientRole=farmer`;
    link.textContent = 'Message';

    row.append(avatarEl, info, link);
    container.appendChild(row);
  });
}

function renderKpis(stats) {
  if (!stats) {
    setText('fdRevenue', 'Unavailable');
    setText('fdPendingOrders', 'Unavailable');
    setText('fdEarningsTotal', 'Unavailable');
    return;
  }
  setText('fdRevenue', formatWon(stats.deliveredRevenue || 0));
  setText('fdPendingOrders', String(stats.pendingOrders || 0));
  setText('fdEarningsTotal', formatWon(stats.deliveredRevenue || 0));

  const earningsPanel = document.getElementById('fdEarnings');
  if (earningsPanel) {
    const unavailable = earningsPanel.querySelector('.fd-unavailable-state');
    if (unavailable) unavailable.hidden = true;
  }
}

function renderRecentOrders(stats) {
  const container = document.getElementById('farmerRecentOrders');
  if (!container) return;

  if (!stats) {
    container.innerHTML = `
      <div class="fd-order">
        <div>
          <h4>Orders unavailable</h4>
          <p>Unable to load order data right now. Try refreshing.</p>
        </div>
      </div>
    `;
    return;
  }

  const pending = stats.pendingOrders || 0;
  const revenue = stats.deliveredRevenue || 0;

  if (pending === 0 && revenue === 0) {
    container.innerHTML = `
      <div class="fd-order">
        <div>
          <h4>No orders yet</h4>
          <p>Customer orders will appear here once you start receiving them.</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="fd-order">
      <div>
        <h4>${pending} active order${pending !== 1 ? 's' : ''}</h4>
        <p>Delivered revenue: ${formatWon(revenue)}</p>
        <a class="fd-link" href="orders.html">Manage orders →</a>
      </div>
    </div>
  `;
}

function renderRecentPosts(posts) {
  const container = document.getElementById('farmerPostSummary');
  if (!container) return;

  clearElement(container);

  if (!posts.length) {
    const empty = document.createElement('div');
    empty.className = 'fd-list-item';
    const title = document.createElement('h4');
    title.textContent = 'No farm updates yet';
    const copy = document.createElement('p');
    copy.textContent = 'Posts you publish from your store profile or Social Feed will appear here.';
    empty.append(title, copy);
    container.appendChild(empty);
    return;
  }

  posts.slice(0, 3).forEach((post) => {
    const item = document.createElement('div');
    item.className = 'fd-list-item';
    const title = document.createElement('h4');
    title.textContent = post.author?.name || 'Farm update';
    const copy = document.createElement('p');
    copy.textContent = post.text || post.caption || post.content || 'Farm update published.';
    item.append(title, copy);
    container.appendChild(item);
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

  setOwnStoreLinks(farmerId);

  const [profileResult, productsResult, farmersResult, postsResult, statsResult] = await Promise.allSettled([
    getProfile(),
    getProducts({ farmerId, limit: 12 }),
    getFarmers({ limit: 12 }),
    getFeed({ authorId: farmerId, limit: 5 }),
    getFarmerStats(),
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
      appendStateCard(grid, 'fd-product', 'Products could not be loaded', 'Unable to load your products right now.');
    }
  }

  if (farmersResult.status === 'fulfilled') {
    renderDiscoveredFarmers(farmersResult.value.data || [], farmerId);
  } else {
    const container = document.getElementById('farmerFriendsGrid');
    if (container) {
      container.innerHTML = `
        <div class="fd-person">
          <div class="fd-person-info">
            <h4>Farmer discovery unavailable</h4>
            <p>Public farmer profiles could not be loaded right now.</p>
          </div>
        </div>
      `;
    }
  }

  const farmStats = statsResult.status === 'fulfilled' ? (statsResult.value ?? null) : null;
  renderKpis(farmStats);
  renderRecentOrders(farmStats);

  if (postsResult.status === 'fulfilled') {
    renderRecentPosts(postsResult.value.data || []);
  } else {
    const container = document.getElementById('farmerPostSummary');
    if (container) {
      clearElement(container);
      const item = document.createElement('div');
      item.className = 'fd-list-item';
      const title = document.createElement('h4');
      title.textContent = 'Posts could not be loaded';
      const copy = document.createElement('p');
      copy.textContent = 'Your recent posts are unavailable right now.';
      item.append(title, copy);
      container.appendChild(item);
    }
  }
}

document.addEventListener('DOMContentLoaded', initialiseFarmerDashboard);
