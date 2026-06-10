import {
  getProfile,
  getProfileById,
  updateProfile,
  updateFarmerProfile,
  uploadAvatar,
  uploadCover,
  sendFriendRequest,
} from './js/profileService.js';
import { getFarmerById } from './js/farmerService.js';
import { getFeed, createPost, deletePost } from './js/postService.js';
import { getProducts } from './js/productService.js';
import { API_BASE } from './js/api.config.js';
import { isLoggedIn, logout, getCurrentUser } from './js/authService.js';

const VALID_ROLES = new Set(['farmer', 'customer', 'admin']);

let currentProfile = null;
let currentPosts = [];
let currentProducts = [];
let viewContext = {
  isOwner: false,
  requestedType: 'owner',
  requestedId: '',
};

function byId(id) {
  return document.getElementById(id);
}

function setText(id, value, fallback = '') {
  const element = byId(id);
  if (!element) return;
  const normalized = Array.isArray(value) ? value.filter(Boolean).join(', ') : value;
  element.textContent = normalized ? String(normalized) : fallback;
}

function setVisible(elementOrId, visible) {
  const element = typeof elementOrId === 'string' ? byId(elementOrId) : elementOrId;
  if (!element) return;
  element.hidden = !visible;
}

function on(id, eventName, handler) {
  const element = byId(id);
  if (element) element.addEventListener(eventName, handler);
}

function normalizeRole(role) {
  const normalized = String(role || '').trim().toLowerCase();
  return VALID_ROLES.has(normalized) ? normalized : 'unknown';
}

function getRoleLabel(role) {
  const normalized = normalizeRole(role);
  if (normalized === 'farmer') return 'Farmer';
  if (normalized === 'customer') return 'Customer';
  if (normalized === 'admin') return 'Admin';
  return 'FarmersHub Member';
}

function getProfileId(profile) {
  return String(profile?.userId || profile?.id || profile?._id || profile?.user?._id || '').trim();
}

function sameId(left, right) {
  return Boolean(left && right && String(left) === String(right));
}

function getStoredUser() {
  return getCurrentUser() || (() => {
    try {
      return JSON.parse(localStorage.getItem('fh_user') || 'null');
    } catch {
      return null;
    }
  })();
}

function getStoredUserId() {
  const user = getStoredUser();
  return String(user?.id || user?._id || user?.userId || '').trim();
}

function getRequestedProfile() {
  const params = new URLSearchParams(window.location.search);
  const farmerId = params.get('farmer') || params.get('farmerId');
  if (farmerId) {
    return { type: 'farmer', id: farmerId };
  }

  const userId = params.get('userId') || params.get('profileId') || params.get('user') || params.get('id');
  if (userId) {
    return { type: 'user', id: userId };
  }

  return { type: 'owner', id: '' };
}

function getProductsLabel(profile) {
  if (typeof profile?.products === 'string' && profile.products.trim()) {
    return profile.products.trim();
  }
  if (Array.isArray(profile?.cropTypes) && profile.cropTypes.length) {
    return profile.cropTypes.filter(Boolean).join(', ');
  }
  if (typeof profile?.farmType === 'string' && profile.farmType.trim()) {
    return profile.farmType.trim();
  }
  return '';
}

function normalizeProfile(profile = {}) {
  const userId = getProfileId(profile);
  const role = normalizeRole(profile.role);
  const avatarUrl = profile.avatarUrl || profile.avatar?.url || profile.profileImage || '';
  const coverUrl = profile.coverUrl || profile.coverImage?.url || profile.coverImage || '';

  return {
    ...profile,
    id: userId,
    userId,
    role,
    fullName: profile.fullName || profile.name || profile.user?.fullName || '',
    email: profile.email || profile.user?.email || '',
    phone: profile.phone || profile.user?.phone || '',
    location: profile.location || '',
    address: profile.address || '',
    farmName: profile.farmName || '',
    products: getProductsLabel(profile),
    cropTypes: Array.isArray(profile.cropTypes) ? profile.cropTypes : [],
    avatarUrl,
    coverUrl,
    stats: {
      products: Number(profile.stats?.products || 0),
      posts: Number(profile.stats?.posts || 0),
    },
    posts: Array.isArray(profile.posts) ? profile.posts : [],
    productListings: Array.isArray(profile.productListings) ? profile.productListings : [],
  };
}

function normalizePublicFarmerProfile(farmer = {}) {
  const productListings = Array.isArray(farmer.products) ? farmer.products : [];
  const posts = Array.isArray(farmer.posts)
    ? farmer.posts.map((post) => ({
        ...post,
        text: post.text || post.content || '',
        author: { name: farmer.fullName, id: farmer.id, role: 'farmer' },
        canDelete: false,
      }))
    : [];

  return normalizeProfile({
    ...farmer,
    role: 'farmer',
    userId: farmer.userId || farmer.id || farmer._id,
    products: farmer.productsLabel || farmer.farmType || '',
    productListings,
    posts,
    stats: {
      products: productListings.length,
      posts: posts.length,
    },
  });
}

function apiOrigin() {
  try {
    return new URL(API_BASE).origin;
  } catch {
    return 'https://farmershub-kkjd.onrender.com';
  }
}

function resolveMediaUrl(value) {
  let raw = String(value || '').trim();
  if (!raw || raw === 'null' || raw === 'undefined' || raw === '#') return '';
  if (/^[a-z]:[\\/]/i.test(raw)) return '';
  raw = raw.replaceAll('\\', '/');

  if (/^(data|blob):/i.test(raw)) return raw;
  if (/^(assets|login|\.{1,2})\//i.test(raw)) return raw;
  if (/^\/?uploads\//i.test(raw)) {
    const path = raw.startsWith('/') ? raw : `/${raw}`;
    return new URL(path, apiOrigin()).href;
  }
  if (/^\/api\/uploads\//i.test(raw)) {
    return new URL(raw.replace(/^\/api/i, ''), apiOrigin()).href;
  }

  try {
    const url = raw.startsWith('//')
      ? new URL(`${window.location.protocol}${raw}`)
      : new URL(raw, window.location.href);

    if (
      url.protocol === 'http:' &&
      window.location.protocol === 'https:' &&
      !['localhost', '127.0.0.1'].includes(url.hostname)
    ) {
      url.protocol = 'https:';
    }

    return url.href;
  } catch {
    return '';
  }
}

function getInitials(profile) {
  const source = profile?.fullName || profile?.farmName || 'FarmersHub';
  const initials = source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return initials || 'FH';
}

function setStatus(message, type = 'info') {
  const element = byId('actionStatus');
  if (!element) return;
  element.textContent = message || '';
  element.className = message ? `action-status ${type}` : 'action-status';
}

function validateImageFile(file, maxMb = 5) {
  if (!file) return { ok: false, message: 'Please choose an image first.' };
  if (!file.type || !file.type.startsWith('image/')) {
    return { ok: false, message: 'Only image files are allowed.' };
  }
  if (file.size > maxMb * 1024 * 1024) {
    return { ok: false, message: `Image must be smaller than ${maxMb}MB.` };
  }
  return { ok: true };
}

function showAuthGate() {
  const loginModal = byId('loginModal');
  const profilePage = byId('profilePage');
  if (loginModal) loginModal.style.display = 'flex';
  if (profilePage) profilePage.style.display = 'none';
}

function showProfilePage() {
  const loginModal = byId('loginModal');
  const profilePage = byId('profilePage');
  if (loginModal) loginModal.style.display = 'none';
  if (profilePage) profilePage.style.display = 'block';
}

function renderImage(targetId, placeholderId, rawUrl, fallbackText, altText) {
  const img = byId(targetId);
  const placeholder = byId(placeholderId);
  if (!img || !placeholder) return;

  const url = resolveMediaUrl(rawUrl);
  const showFallback = () => {
    img.onload = null;
    img.onerror = null;
    img.removeAttribute('src');
    img.hidden = true;
    placeholder.hidden = false;
    placeholder.textContent = fallbackText;
  };

  placeholder.textContent = fallbackText;
  placeholder.hidden = false;
  img.hidden = true;
  img.alt = altText;

  if (!url) {
    showFallback();
    return;
  }

  img.onload = () => {
    img.hidden = false;
    placeholder.hidden = true;
  };
  img.onerror = showFallback;
  img.src = url;
}

function renderSmallAvatar(profile) {
  const container = byId('postAvatarSmall');
  if (!container) return;

  const initials = getInitials(profile);
  const url = resolveMediaUrl(profile.avatarUrl);
  container.replaceChildren();
  container.textContent = initials;

  if (!url) return;

  const img = document.createElement('img');
  img.alt = `${profile.fullName || 'Profile'} picture`;
  img.hidden = true;
  img.onload = () => {
    container.textContent = '';
    img.hidden = false;
  };
  img.onerror = () => {
    img.remove();
    container.textContent = initials;
  };
  img.src = url;
  container.appendChild(img);
}

function renderByline(profile) {
  const byline = byId('profileByline');
  if (!byline) return;

  const role = normalizeRole(profile.role);
  const label = role === 'farmer'
    ? 'Managed by'
    : role === 'customer'
      ? 'Profile owner'
      : 'Account owner';

  const strong = document.createElement('strong');
  strong.id = 'profileName';
  strong.textContent = profile.fullName || 'FarmersHub member';

  byline.replaceChildren(document.createTextNode(`${label} `), strong);
}

function getDisplayTitle(profile) {
  const role = normalizeRole(profile.role);
  if (role === 'farmer') {
    return profile.farmName || profile.fullName || 'Farmer profile';
  }
  if (role === 'customer') {
    return profile.fullName || 'Customer profile';
  }
  if (role === 'admin') {
    return profile.fullName || 'Admin account';
  }
  return profile.fullName || 'FarmersHub profile';
}

function getVisibleLocation(profile) {
  if (viewContext.isOwner) {
    return profile.location || profile.address || profile.farmLocation || '';
  }

  const publicLocation = profile.location || profile.farmLocation || '';
  if (
    publicLocation &&
    profile.address &&
    String(publicLocation).trim().toLowerCase() === String(profile.address).trim().toLowerCase()
  ) {
    return '';
  }

  return publicLocation;
}

function renderSettingsProfile(profile) {
  const values = {
    settingsName: profile.fullName || 'Not set',
    settingsEmail: profile.email || 'Not available',
    settingsPhone: profile.phone || 'Not set',
    settingsRole: getRoleLabel(profile.role),
    settingsLocation: profile.location || profile.address || 'Not set',
  };

  Object.entries(values).forEach(([id, value]) => setText(id, value));
}

function setOwnerControlsVisible(isOwner, isFarmer, hasViewedUser) {
  ['editProfileBtn', 'settingsProfileBtn'].forEach((id) => setVisible(id, isOwner));
  ['coverInput', 'avatarInput'].forEach((id) => {
    const element = byId(id);
    if (element) element.disabled = !isOwner;
  });

  document.querySelectorAll('.cover-upload-btn, .avatar-upload-btn').forEach((element) => {
    setVisible(element, isOwner);
  });

  const canCreatePost = isOwner && isFarmer;
  setVisible('createPostCard', canCreatePost);
  ['submitPostBtn', 'postImageInput', 'postInput'].forEach((id) => {
    const element = byId(id);
    if (element) element.disabled = !canCreatePost;
  });

  const canContact = !isOwner && hasViewedUser;
  ['messageProfileBtn', 'addFriendBtn', 'profileContactCard'].forEach((id) => setVisible(id, canContact));
}

function updateMessageActions(profile) {
  const name = profile.fullName || getDisplayTitle(profile);
  const role = normalizeRole(profile.role);
  const messageLabel = role === 'farmer' ? 'Message Farmer' : 'Message User';
  const title = role === 'farmer' ? 'Contact Farmer' : 'Contact User';
  const text = role === 'farmer'
    ? 'Contact this farmer through FarmersHub Messages. Public phone details stay hidden until privacy controls are verified.'
    : 'Contact this user through FarmersHub Messages.';

  ['messageProfileBtn', 'sidebarMessageBtn'].forEach((id) => {
    const button = byId(id);
    if (!button) return;
    button.textContent = messageLabel;
    button.setAttribute('aria-label', `Message ${name}`);
  });

  setText('profileContactTitle', title);
  setText('profileContactText', text);
}

function updateSidebarVisibility() {
  const sidebar = document.querySelector('.store-sidebar');
  const layout = document.querySelector('.store-layout');
  if (!sidebar || !layout) return;

  const hasVisibleCards = Array.from(sidebar.children).some((child) => !child.hidden);
  sidebar.hidden = !hasVisibleCards;
  layout.classList.toggle('sidebar-hidden', !hasVisibleCards);
}

function setTabsForRole(role) {
  const isFarmer = role === 'farmer';
  setVisible('productsTab', isFarmer);
  setVisible('profileProducts', isFarmer);

  const productsTab = byId('productsTab');
  const aboutTab = byId('aboutTab');
  if (!isFarmer && productsTab?.classList.contains('active')) {
    productsTab.classList.remove('active');
    aboutTab?.classList.add('active');
  }

  const postsTab = byId('postsTab');
  if (postsTab?.firstChild) {
    postsTab.firstChild.textContent = isFarmer ? 'Posts ' : 'Activity ';
  }
}

function createDetailCard(label, value, className = '') {
  const card = document.createElement('div');
  card.className = `store-detail-card${className ? ` ${className}` : ''}`;

  const labelEl = document.createElement('span');
  labelEl.className = 'store-detail-label';
  labelEl.textContent = label;

  const valueEl = document.createElement('strong');
  valueEl.textContent = value || 'Not added yet';

  card.append(labelEl, valueEl);
  return card;
}

function renderAboutDetails(profile) {
  const grid = byId('profileAboutGrid');
  if (!grid) return;

  const role = normalizeRole(profile.role);
  const isFarmer = role === 'farmer';
  const visibleLocation = getVisibleLocation(profile);
  const details = [];

  if (isFarmer) {
    details.push(createDetailCard('Products grown', profile.products || 'Not listed yet'));
    details.push(createDetailCard('Location', visibleLocation || 'Not listed yet'));
  } else {
    details.push(createDetailCard('Account type', getRoleLabel(role)));
    details.push(createDetailCard('Location', visibleLocation || (viewContext.isOwner ? 'Not added yet' : 'Not listed publicly')));
  }

  if (viewContext.isOwner) {
    details.push(createDetailCard('Phone', profile.phone || 'Not added yet'));
  } else if (isFarmer) {
    details.push(createDetailCard('Contact', 'Contact through FarmersHub Messages'));
  }

  grid.replaceChildren(...details);
}

function renderRoleLayout(profile) {
  const role = normalizeRole(profile.role);
  const isFarmer = role === 'farmer';
  const isCustomer = role === 'customer';

  setTabsForRole(role);
  setVisible('profileGlanceCard', isFarmer);
  setVisible('profileCertificationsCard', isFarmer);

  setText('profileAboutTitle', isFarmer ? 'About the Farm' : 'About This Profile');
  setText('profilePostsTitle', isFarmer ? 'Farm Updates' : 'Profile Activity');
  setText('profileProductsTitle', 'Featured Products');

  const textarea = byId('postInput');
  if (textarea) {
    textarea.placeholder = isFarmer
      ? 'Share an update about your farm, harvest, or products...'
      : 'Posting is not connected for this profile type.';
  }

  const coverText = byId('coverPlaceholderText');
  if (coverText) {
    coverText.textContent = viewContext.isOwner
      ? (isFarmer ? 'Add a cover photo for your farm' : 'Add a cover photo')
      : 'No cover photo yet';
  }

  const productActions = byId('profileProductActions');
  if (productActions) {
    productActions.replaceChildren();
    if (viewContext.isOwner && isFarmer) {
      const addLink = document.createElement('a');
      addLink.className = 'section-action-link';
      addLink.href = 'login/sell_crops.html';
      addLink.textContent = 'Add Product';

      const manageLink = document.createElement('a');
      manageLink.className = 'section-action-link secondary';
      manageLink.href = 'products-management.html';
      manageLink.textContent = 'Manage Products';

      productActions.append(addLink, manageLink);
    }
  }

  document.body.dataset.profileRole = isCustomer ? 'customer' : role;
}

function renderProfile(profile) {
  currentProfile = normalizeProfile(profile);
  const role = normalizeRole(currentProfile.role);
  const isFarmer = role === 'farmer';
  const title = getDisplayTitle(currentProfile);
  const initials = getInitials(currentProfile);
  const visibleLocation = getVisibleLocation(currentProfile);
  const hasViewedUser = Boolean(getProfileId(currentProfile));

  setText('farmNameDisplay', title);
  setText('profileRole', getRoleLabel(role));
  setText('profileLocation', visibleLocation ? `Location: ${visibleLocation}` : (viewContext.isOwner ? 'Add your location' : 'Location not listed publicly'));
  setText(
    'bioText',
    currentProfile.bio,
    viewContext.isOwner
      ? 'No bio yet. Use Edit Profile to add one.'
      : 'No public bio has been added yet.'
  );

  renderByline(currentProfile);
  renderRoleLayout(currentProfile);
  renderAboutDetails(currentProfile);
  renderSettingsProfile(currentProfile);
  renderImage('coverImg', 'coverPlaceholder', currentProfile.coverUrl, 'Cover photo not added', `${title} cover photo`);
  renderImage('avatarImg', 'avatarPlaceholder', currentProfile.avatarUrl, initials, `${title} profile picture`);
  renderSmallAvatar(currentProfile);
  setOwnerControlsVisible(viewContext.isOwner, isFarmer, hasViewedUser);
  updateMessageActions(currentProfile);
  updateSidebarVisibility();

  setText('postCount', String(currentProfile.stats.posts || 0));
  setText('sidebarPostCount', String(currentProfile.stats.posts || 0));
  if (isFarmer) {
    setText('productCount', String(currentProfile.stats.products || 0));
  }
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
    'assets/images/home/support-basket.webp',
  ];

  return fallbacks[index % fallbacks.length];
}

function formatWon(value) {
  return `KRW ${Number(value || 0).toLocaleString()}`;
}

function getStockValue(product) {
  const value = [
    product?.stock,
    product?.quantity,
    product?.availableQuantity,
    product?.availableStock,
  ].find((item) => item !== undefined && item !== null && item !== '');

  return value === undefined ? null : Number(value);
}

function getProductUnit(product) {
  return product?.unit || product?.weightUnit || '';
}

function renderProductCountBadge(value, label = 'listed') {
  const badge = byId('profileProductCountBadge');
  if (!badge) return;
  badge.replaceChildren();

  if (value === 'Loading' || value === 'Unable to load') {
    badge.textContent = value === 'Loading' ? 'Loading products' : 'Products unavailable';
    return;
  }

  const strong = document.createElement('strong');
  strong.id = 'profileFeaturedProductCount';
  strong.textContent = String(value);
  badge.append(strong, document.createTextNode(` ${label}`));
}

function renderStateCard(container, title, text, className = 'profile-empty-products') {
  container.replaceChildren();
  const state = document.createElement('div');
  state.className = className;

  if (title) {
    const heading = document.createElement('h4');
    heading.textContent = title;
    state.appendChild(heading);
  }

  if (text) {
    const copy = document.createElement('p');
    copy.textContent = text;
    state.appendChild(copy);
  }

  container.appendChild(state);
}

function createProductCard(product, index) {
  const productId = getProductId(product);
  const listingUrl = productId
    ? `product.html?productId=${encodeURIComponent(productId)}&id=${encodeURIComponent(productId)}`
    : 'product.html';
  const manageUrl = productId
    ? `login/sell_crops.html?productId=${encodeURIComponent(productId)}`
    : 'login/sell_crops.html';
  const imageUrl = resolveMediaUrl(getProductImage(product)) || getProductFallback(product, index);
  const fallbackUrl = getProductFallback(product, index);
  const stock = getStockValue(product);
  const unit = getProductUnit(product);
  const amount = stock === null || Number.isNaN(stock)
    ? ''
    : `${stock}${unit ? ` ${unit}` : ''}`;

  const article = document.createElement('article');
  article.className = 'store-product-card';

  const imageLink = document.createElement('a');
  imageLink.className = 'store-product-image';
  imageLink.href = listingUrl;

  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = product.name || 'Farm product';
  img.loading = 'lazy';
  img.onerror = () => {
    img.onerror = null;
    img.src = fallbackUrl;
  };
  imageLink.appendChild(img);

  const content = document.createElement('div');
  content.className = 'store-product-content';

  const name = document.createElement('h4');
  name.textContent = product.name || 'Farm product';
  content.appendChild(name);

  if (amount) {
    const amountEl = document.createElement('p');
    amountEl.className = 'store-product-amount';
    amountEl.textContent = amount;
    content.appendChild(amountEl);
  }

  const bottom = document.createElement('div');
  bottom.className = 'store-product-bottom';

  const price = document.createElement('strong');
  price.textContent = formatWon(product.price || product.sellingPrice || 0);

  const view = document.createElement('a');
  view.className = 'store-product-view';
  view.href = listingUrl;
  view.textContent = 'View';

  bottom.append(price, view);

  if (viewContext.isOwner && normalizeRole(currentProfile?.role) === 'farmer') {
    const manage = document.createElement('a');
    manage.className = 'store-product-manage';
    manage.href = manageUrl;
    manage.textContent = 'Manage';
    bottom.appendChild(manage);
  }

  content.appendChild(bottom);
  article.append(imageLink, content);
  return article;
}

function renderProfileProducts(products) {
  const grid = byId('profileProductGrid');
  if (!grid) return;

  currentProducts = Array.isArray(products) ? products : [];
  renderProductCountBadge(currentProducts.length);
  setText('productCount', String(currentProducts.length));

  grid.replaceChildren();
  if (!currentProducts.length) {
    renderStateCard(
      grid,
      viewContext.isOwner ? 'No products listed yet' : 'No products listed',
      viewContext.isOwner
        ? 'Add your first product when your farm listing is ready.'
        : 'This farmer has not added products to the store yet.'
    );
    return;
  }

  currentProducts.slice(0, 6).forEach((product, index) => {
    grid.appendChild(createProductCard(product, index));
  });
}

async function loadProfileProducts() {
  if (!currentProfile || normalizeRole(currentProfile.role) !== 'farmer') {
    currentProducts = [];
    return;
  }

  const farmerId = getProfileId(currentProfile);
  const grid = byId('profileProductGrid');
  if (!farmerId || !grid) return;

  renderProductCountBadge('Loading');
  setText('productCount', '...');
  renderStateCard(grid, 'Loading products', 'Fetching this farmer profile product list.');

  try {
    const response = await getProducts({ farmerId, limit: 12 });
    renderProfileProducts(response.data || []);
  } catch (error) {
    renderProductCountBadge('Unable to load');
    setText('productCount', 'Unable');
    renderStateCard(grid, 'Unable to load products', error.message || 'Please try again later.');
  }
}

function openSettingsModal() {
  if (!currentProfile || !viewContext.isOwner) return;
  renderSettingsProfile(currentProfile);
  const modal = byId('settingsModal');
  if (modal) modal.style.display = 'flex';
}

function closeSettingsModal() {
  const modal = byId('settingsModal');
  if (modal) modal.style.display = 'none';
}

function setFarmerEditFieldsVisible(visible) {
  setVisible('farmNameFormGroup', visible);
  setVisible('productsFormGroup', visible);
}

function openEditModal() {
  if (!currentProfile || !viewContext.isOwner) return;

  const isFarmer = normalizeRole(currentProfile.role) === 'farmer';
  byId('editName').value = currentProfile.fullName || '';
  byId('editRole').value = isFarmer ? 'farmer' : 'customer';
  byId('editLocation').value = currentProfile.location || currentProfile.address || '';
  byId('editBio').value = currentProfile.bio || '';
  byId('editPhone').value = currentProfile.phone || '';
  byId('editFarmName').value = currentProfile.farmName || '';
  byId('editProducts').value = currentProfile.products || '';
  setFarmerEditFieldsVisible(isFarmer);

  const modal = byId('editModal');
  if (modal) modal.style.display = 'flex';
}

async function loadProfileData() {
  const requested = getRequestedProfile();
  const storedUserId = getStoredUserId();

  if (requested.type === 'farmer') {
    const response = await getFarmerById(requested.id);
    let profile = normalizePublicFarmerProfile(response.data || {});

    if (sameId(storedUserId, getProfileId(profile)) && isLoggedIn()) {
      const ownerResponse = await getProfile();
      profile = normalizeProfile(ownerResponse.data || {});
      viewContext = { isOwner: true, requestedType: 'owner', requestedId: getProfileId(profile) };
    } else {
      viewContext = { isOwner: false, requestedType: 'farmer', requestedId: requested.id };
    }

    renderProfile(profile);
    return profile;
  }

  if (requested.type === 'user') {
    if (!isLoggedIn()) {
      showAuthGate();
      return null;
    }

    const response = await getProfileById(requested.id);
    const profile = normalizeProfile(response.data || {});
    viewContext = {
      isOwner: sameId(storedUserId, getProfileId(profile)),
      requestedType: 'user',
      requestedId: requested.id,
    };
    renderProfile(profile);
    return profile;
  }

  if (!isLoggedIn()) {
    showAuthGate();
    return null;
  }

  const response = await getProfile();
  const profile = normalizeProfile(response.data || {});
  viewContext = { isOwner: true, requestedType: 'owner', requestedId: getProfileId(profile) };
  renderProfile(profile);
  return profile;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString();
}

function getPostImage(post) {
  if (post?.image) return post.image;
  if (Array.isArray(post?.imageUrls) && post.imageUrls.length) return post.imageUrls[0];
  if (Array.isArray(post?.images) && post.images.length) {
    const first = post.images[0];
    return typeof first === 'string' ? first : (first.url || first.path || '');
  }
  return '';
}


function normalizeYouTubeId(value) {
  const match = String(value || '').match(/^[A-Za-z0-9_-]{6,}$/);
  return match ? match[0] : null;
}

function extractYouTubeId(value) {
  const text = String(value || '');
  if (!text) return null;

  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?[^\s<>"']*v=([A-Za-z0-9_-]{6,})/i,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([A-Za-z0-9_-]{6,})/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    const videoId = normalizeYouTubeId(match?.[1]);
    if (videoId) return videoId;
  }

  return null;
}


function removeYouTubeUrls(value) {
  return String(value || '')
    .replace(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?[^\s<>"']*v=[A-Za-z0-9_-]{6,}[^\s<>"']*/gi, '')
    .replace(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/[A-Za-z0-9_-]{6,}[^\s<>"']*/gi, '')
    .replace(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/[A-Za-z0-9_-]{6,}[^\s<>"']*/gi, '')
    .replace(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/[A-Za-z0-9_-]{6,}[^\s<>"']*/gi, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function createYouTubeEmbed(videoId) {
  const safeVideoId = normalizeYouTubeId(videoId);
  if (!safeVideoId) return null;

  const wrapper = document.createElement('div');
  wrapper.className = 'post-video youtube-embed';

  const iframe = document.createElement('iframe');
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    playsinline: '1',
    enablejsapi: '1',
    rel: '0',
  });
  const origin = window.location.origin;
  if (origin && origin !== 'null') params.set('origin', origin);

  iframe.src = `https://www.youtube.com/embed/${safeVideoId}?${params.toString()}`;
  iframe.dataset.youtubePlayer = 'true';
  iframe.title = 'YouTube video player';
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;

  wrapper.appendChild(iframe);
  return wrapper;
}


let youtubeAutoplayObserver = null;

function sendYouTubeCommand(iframe, command) {
  if (!iframe?.contentWindow) return;

  iframe.contentWindow.postMessage(JSON.stringify({
    event: 'command',
    func: command,
    args: [],
  }), 'https://www.youtube.com');
}

function resetYouTubeAutoplay() {
  if (youtubeAutoplayObserver) {
    youtubeAutoplayObserver.disconnect();
    youtubeAutoplayObserver = null;
  }
}

function setupYouTubeAutoplay(root) {
  resetYouTubeAutoplay();

  const frames = root.querySelectorAll('iframe[data-youtube-player="true"]');
  if (!frames.length || !('IntersectionObserver' in window)) return;

  youtubeAutoplayObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const iframe = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
        sendYouTubeCommand(iframe, 'playVideo');
      } else {
        sendYouTubeCommand(iframe, 'pauseVideo');
      }
    });
  }, { threshold: [0, 0.65] });

  frames.forEach((iframe) => youtubeAutoplayObserver.observe(iframe));
}

function renderPosts(posts, state = 'loaded') {
  const feed = byId('postsFeed');
  if (!feed) return;

  const role = normalizeRole(currentProfile?.role);
  const isFarmer = role === 'farmer';
  currentPosts = Array.isArray(posts) ? posts : [];
  setText('postCount', state === 'error' ? '-' : String(currentPosts.length));
  setText('sidebarPostCount', state === 'error' ? '-' : String(currentPosts.length));

  feed.replaceChildren();
  resetYouTubeAutoplay();
  if (state === 'loading') {
    renderStateCard(feed, 'Loading posts', 'Fetching profile activity.', 'post-card profile-post-state');
    return;
  }

  if (state === 'error') {
    renderStateCard(feed, 'Unable to load posts', 'Profile posts could not be loaded right now.', 'post-card profile-post-state');
    return;
  }

  if (!currentPosts.length) {
    const title = isFarmer ? 'No farm updates yet' : 'No public activity yet';
    const text = viewContext.isOwner && isFarmer
      ? 'Share your first farm update when you are ready.'
      : isFarmer
        ? 'This farmer has not shared public farm updates yet.'
        : 'Public activity is not connected for this profile yet.';
    renderStateCard(feed, title, text, 'post-card profile-post-state');
    return;
  }

  currentPosts.forEach((post) => {
    const card = document.createElement('div');
    card.className = 'post-card';

    const header = document.createElement('div');
    header.className = 'post-header';

    const author = document.createElement('strong');
    author.textContent = post.author?.name || currentProfile?.fullName || 'FarmersHub member';

    const date = document.createElement('small');
    date.textContent = formatDate(post.createdAt);

    header.append(author, date);

    const canDelete = viewContext.isOwner && isFarmer && post.canDelete !== false;
    if (canDelete) {
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'delete-post-btn';
      deleteButton.dataset.id = post.id || post._id || '';
      deleteButton.title = 'Delete post';
      deleteButton.textContent = 'Delete';
      header.appendChild(deleteButton);
    }

    card.appendChild(header);

    const textValue = post.text || post.content || post.caption || '';
    const youtubeId = extractYouTubeId([
      textValue,
      post.youtubeUrl,
      post.videoUrl,
      post.link,
    ].filter(Boolean).join(' '));
    const displayTextValue = youtubeId ? removeYouTubeUrls(textValue) : textValue;

    if (displayTextValue) {
      const text = document.createElement('p');
      text.className = 'post-text';
      text.textContent = displayTextValue;
      card.appendChild(text);
    }

    if (youtubeId) {
      const embed = createYouTubeEmbed(youtubeId);
      if (embed) card.appendChild(embed);
    }

    const imageUrl = resolveMediaUrl(getPostImage(post));
    if (imageUrl) {
      const image = document.createElement('img');
      image.className = 'post-image';
      image.alt = 'Post image';
      image.src = imageUrl;
      image.onerror = () => image.remove();
      card.appendChild(image);
    }

    feed.appendChild(card);
  });

  setupYouTubeAutoplay(feed);

  feed.querySelectorAll('.delete-post-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const postId = button.dataset.id;
      if (!postId) return;

      try {
        await deletePost(postId);
        await loadPosts();
        setStatus('Post deleted.', 'success');
      } catch (error) {
        setStatus(error.message || 'Failed to delete post.', 'error');
      }
    });
  });
}

async function loadPosts() {
  if (!currentProfile) return;

  const authorId = getProfileId(currentProfile);
  if (!authorId) {
    renderPosts([], 'loaded');
    return;
  }

  renderPosts([], 'loading');

  try {
    const response = await getFeed({ authorId, limit: 100 });
    renderPosts(response.data || [], 'loaded');
  } catch {
    if (currentProfile.posts?.length) {
      renderPosts(currentProfile.posts, 'loaded');
      return;
    }
    renderPosts([], 'error');
  }
}

async function handleProfileSave(event) {
  event.preventDefault();

  const role = normalizeRole(currentProfile?.role);
  const updates = {
    fullName: byId('editName').value.trim(),
    location: byId('editLocation').value.trim(),
    bio: byId('editBio').value.trim(),
    phone: byId('editPhone').value.trim(),
  };

  if (role === 'farmer') {
    updates.farmName = byId('editFarmName').value.trim();
    updates.products = byId('editProducts').value.trim();
    updates.cropTypes = byId('editProducts').value.trim();
  }

  try {
    setStatus('Saving profile...', 'info');
    const action = role === 'farmer' ? updateFarmerProfile : updateProfile;
    const response = await action(updates);
    renderProfile(response.data || {});
    const modal = byId('editModal');
    if (modal) modal.style.display = 'none';
    setStatus('Profile updated successfully.', 'success');
  } catch (error) {
    setStatus(error.message || 'Failed to update profile.', 'error');
  }
}

async function handleAvatarUpload(event) {
  const file = event.target.files?.[0];
  const check = validateImageFile(file);
  if (!check.ok) {
    setStatus(check.message, 'error');
    event.target.value = '';
    return;
  }

  try {
    setStatus('Uploading profile picture...', 'info');
    const response = await uploadAvatar(file);
    renderProfile(response.data || {});
    setStatus('Profile picture uploaded successfully.', 'success');
  } catch (error) {
    setStatus(error.message || 'Failed to upload profile picture.', 'error');
  } finally {
    event.target.value = '';
  }
}

async function handleCoverUpload(event) {
  const file = event.target.files?.[0];
  const check = validateImageFile(file);
  if (!check.ok) {
    setStatus(check.message, 'error');
    event.target.value = '';
    return;
  }

  try {
    setStatus('Uploading cover photo...', 'info');
    const response = await uploadCover(file);
    renderProfile(response.data || {});
    setStatus('Cover photo uploaded successfully.', 'success');
  } catch (error) {
    setStatus(error.message || 'Failed to upload cover image.', 'error');
  } finally {
    event.target.value = '';
  }
}

function handleMessageProfile() {
  const recipientId = getProfileId(currentProfile);
  if (!recipientId) {
    setStatus('Unable to find this user profile.', 'error');
    return;
  }

  if (sameId(recipientId, getStoredUserId())) {
    setStatus('This is your own profile.', 'info');
    return;
  }

  if (!isLoggedIn()) {
    showAuthGate();
    return;
  }

  const params = new URLSearchParams({
    recipientId,
    recipientName: currentProfile.fullName || 'FarmersHub member',
    recipientRole: getRoleLabel(currentProfile.role),
  });

  window.location.href = `messages.html?${params.toString()}`;
}

async function handleAddFriend() {
  const recipientId = getProfileId(currentProfile);
  if (!recipientId) {
    setStatus('Unable to find this user profile.', 'error');
    return;
  }

  if (sameId(recipientId, getStoredUserId())) {
    setStatus('This is your own profile.', 'info');
    return;
  }

  if (!isLoggedIn()) {
    showAuthGate();
    return;
  }

  const button = byId('addFriendBtn');
  try {
    if (button) {
      button.disabled = true;
      button.textContent = 'Sending...';
    }
    setStatus('Sending connection request...', 'info');
    await sendFriendRequest(recipientId);
    if (button) button.textContent = 'Request Sent';
    setStatus('Connection request sent.', 'success');
  } catch (error) {
    if (button) {
      button.disabled = false;
      button.textContent = 'Connect';
    }
    setStatus(error.message || 'Failed to send connection request.', 'error');
  }
}

async function handlePostSubmit() {
  if (!viewContext.isOwner || normalizeRole(currentProfile?.role) !== 'farmer') {
    setStatus('Only farmer profile owners can publish farm updates.', 'error');
    return;
  }

  const text = byId('postInput').value.trim();
  const imageInput = byId('postImageInput');
  const file = imageInput.files?.[0];

  if (!text && !file) {
    setStatus('Write something or select an image before posting.', 'error');
    return;
  }

  if (file) {
    const check = validateImageFile(file);
    if (!check.ok) {
      setStatus(check.message, 'error');
      return;
    }
  }

  const form = new FormData();
  if (text) form.append('text', text);
  if (file) form.append('images', file);

  try {
    setStatus('Publishing post...', 'info');
    await createPost(form);
    byId('postInput').value = '';
    setText('postImageName', '');
    imageInput.value = '';
    await loadPosts();
    setStatus('Post published successfully.', 'success');
  } catch (error) {
    setStatus(error.message || 'Failed to create post.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  on('goLoginBtn', 'click', () => {
    window.location.href = 'login/login.html';
  });
  on('logoutBtn', 'click', () => logout('index.html'));
  on('editProfileBtn', 'click', openEditModal);
  on('settingsProfileBtn', 'click', openSettingsModal);
  on('closeSettingsBtn', 'click', closeSettingsModal);
  on('settingsCloseOnlyBtn', 'click', closeSettingsModal);
  on('settingsEditProfileBtn', 'click', () => {
    closeSettingsModal();
    openEditModal();
  });
  on('settingsLogoutBtn', 'click', () => logout('index.html'));
  on('cancelEditBtn', 'click', () => {
    const modal = byId('editModal');
    if (modal) modal.style.display = 'none';
  });
  on('editForm', 'submit', handleProfileSave);
  on('avatarInput', 'change', handleAvatarUpload);
  on('coverInput', 'change', handleCoverUpload);
  on('submitPostBtn', 'click', handlePostSubmit);
  on('messageProfileBtn', 'click', handleMessageProfile);
  on('sidebarMessageBtn', 'click', handleMessageProfile);
  on('addFriendBtn', 'click', handleAddFriend);
  on('postImageInput', 'change', (event) => {
    const name = event.target.files?.[0] ? event.target.files[0].name : '';
    setText('postImageName', name);
  });

  const requested = getRequestedProfile();
  if (requested.type === 'owner' && !isLoggedIn()) {
    showAuthGate();
    return;
  }

  showProfilePage();

  try {
    setStatus('Loading profile...', 'info');
    const profile = await loadProfileData();
    if (!profile) return;
    await Promise.all([loadPosts(), loadProfileProducts()]);
    setStatus('');
  } catch (error) {
    const message = error.message || '';
    if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('authentication')) {
      showAuthGate();
      return;
    }
    setStatus(message || 'Failed to load profile data.', 'error');
  }
});
