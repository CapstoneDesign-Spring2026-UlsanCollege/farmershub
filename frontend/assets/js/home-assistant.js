import { apiFetch, getToken, jsonHeaders } from './config/api.config.js';
import { getFarmers } from './services/farmerService.js';
import { getProducts } from './services/productService.js';
import { getFeed } from './services/postService.js';
import { getProfile } from './services/profileService.js';

const KNOWLEDGE = {
  app: [
    'FarmersHub is a marketplace and community app that connects farmers, customers, providers, and admins.',
    'The home page changes by role: farmers see a dashboard; customers and visitors see a marketplace feed.',
    'Core modules include auth, profiles, products, posts, messages, notifications, orders, payments, analytics, admin tools, and farm services.',
    'The backend is Express with MongoDB models for users, profiles, products, posts, messages, notifications, orders, providers, and farm service listings.',
    'The frontend is a static multi-page app served from the frontend folder and can be deployed separately from the API.'
  ],
  roles: [
    'Farmers can manage farm profiles, sell crops, manage listings, view orders, inventory, customers, analytics, payments, messages, alerts, and service requests.',
    'Customers can browse products, discover farmers, favorite listings, place orders, message sellers, manage carts, orders, alerts, addresses, and settings.',
    'Providers can onboard, publish farm service listings, manage service requests, messages, notifications, and provider settings.',
    'Admins can access admin dashboards and user/platform management areas when logged in with an admin account.'
  ],
  limitations: [
    'Public browsing works for farmers, products, and posts when the API is reachable.',
    'Revenue analytics, some order summaries, and some dashboard widgets depend on verified order/payment records.',
    'The assistant does not expose passwords, JWTs, private contact data beyond the current signed-in user context, or admin-only data without permission.',
    'Agent actions are limited to safe navigation, search, saving local favorites, opening conversation context, refreshing app data, and drafting copy.'
  ],
  pages: {
    products: 'product.html',
    market: 'product.html',
    marketplace: 'product.html',
    farmers: '#featuredFarmers',
    services: 'farmer-services-marketplace.html',
    equipment: 'farmer-services-marketplace.html',
    messages: 'messages.html',
    notifications: 'notifications.html',
    alerts: 'notifications.html',
    profile: 'profile.html',
    settings: 'settings.html',
    orders: 'orders.html',
    cart: 'customer-cart.html',
    favorites: 'customer-favorites.html',
    saved: 'saved.html',
    feed: 'social-feed.html',
    social: 'social-feed.html',
    productsManagement: 'products-management.html',
    inventory: 'inventory.html',
    analytics: 'analytics.html',
    payments: 'payments.html',
    customers: 'customers.html',
    admin: 'admin.html',
    login: 'login/login.html',
    signup: 'login/createAccount.html',
    sell: 'login/sell_crops.html',
    addProduct: 'login/sell_crops.html',
    help: 'help-center.html'
  }
};

const SAFE_ACTIONS = [
  'open pages',
  'search this home page',
  'save a product to local favorites',
  'open a prepared message thread',
  'open an order/product page',
  'draft messages, posts, and listing copy',
  'refresh live app context'
];

const BLOCKED_ACTION_WORDS = [
  'delete',
  'remove',
  'deactivate',
  'ban',
  'change password',
  'reset password',
  'charge',
  'refund',
  'update order',
  'cancel order',
  'mark all',
  'send message',
  'place order',
  'checkout',
  'edit product',
  'update product'
];

const state = {
  loaded: false,
  loading: false,
  lastSyncedAt: null,
  errors: [],
  role: 'visitor',
  user: null,
  profile: null,
  farmers: [],
  customers: [],
  products: [],
  posts: [],
  orders: [],
  conversations: [],
  notifications: [],
  serviceListings: [],
  farmStats: null
};

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('fh_user') || 'null')
      || JSON.parse(localStorage.getItem('currentUser') || 'null')
      || null;
  } catch {
    return null;
  }
}

function getUserId(user = state.user) {
  return String(user?.id || user?._id || user?.userId || '');
}

function getProductId(product) {
  return String(product?.id || product?._id || product?.productId || '');
}

function getSellerId(product) {
  return String(product?.seller?.id || product?.seller?._id || product?.sellerId || product?.farmerId || '');
}

function getSellerName(product) {
  return product?.seller?.name || product?.seller?.fullName || product?.farmerName || 'Farmer';
}

function formatMoney(value) {
  return `W${Number(value || 0).toLocaleString()}`;
}

function cleanText(value) {
  return String(value || '').trim();
}

function normalize(value) {
  return cleanText(value).toLowerCase();
}

function plural(count, singular, pluralLabel = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralLabel}`;
}

function listNames(items, getName, limit = 5) {
  const names = items.map(getName).filter(Boolean).slice(0, limit);
  if (!names.length) return 'none loaded yet';
  const suffix = items.length > limit ? `, and ${items.length - limit} more` : '';
  return `${names.join(', ')}${suffix}`;
}

function sameWordsScore(text, query) {
  const source = normalize(text);
  const words = normalize(query)
    .split(/\s+/)
    .filter((word) => word.length > 2);
  if (!source || !words.length) return 0;
  return words.reduce((score, word) => score + (source.includes(word) ? 1 : 0), 0);
}

function findBestProduct(query) {
  const scored = state.products
    .map((product) => ({
      product,
      score: sameWordsScore([
        product.name,
        product.category,
        product.description,
        product.brand,
        getSellerName(product)
      ].join(' '), query)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.product || null;
}

function findBestFarmer(query) {
  const scored = state.farmers
    .map((farmer) => ({
      farmer,
      score: sameWordsScore([
        farmer.fullName,
        farmer.farmName,
        farmer.location,
        farmer.address,
        farmer.farmType,
        farmer.bio
      ].join(' '), query)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.farmer || null;
}

function currentRole() {
  const token = getToken();
  const storedRole = localStorage.getItem('fh_role') || state.user?.role || '';
  return token ? (storedRole || 'customer') : 'visitor';
}

function createAssistant() {
  const root = document.createElement('section');
  root.className = 'fh-assistant';
  root.dataset.open = 'false';
  root.setAttribute('aria-label', 'FarmersHub assistant');
  root.innerHTML = `
    <button class="fh-assistant-launcher" type="button" aria-expanded="false" aria-controls="fhAssistantPanel">
      <span class="fh-assistant-mark" aria-hidden="true">FH</span>
      <span class="fh-assistant-launcher-label">Ask FarmersHub</span>
      <span class="fh-assistant-live">Live</span>
    </button>
    <section class="fh-assistant-panel" id="fhAssistantPanel" role="dialog" aria-label="FarmersHub chatbot" aria-hidden="true">
      <header class="fh-assistant-head">
        <div class="fh-assistant-title">
          <span class="fh-assistant-mark" aria-hidden="true">FH</span>
          <div>
            <strong>FarmersHub Assistant</strong>
            <small>App-aware, limited-action helper</small>
          </div>
        </div>
        <button class="fh-assistant-close" type="button" aria-label="Close assistant">x</button>
      </header>
      <div class="fh-assistant-status" aria-live="polite">Syncing app knowledge...</div>
      <div class="fh-assistant-messages" aria-live="polite"></div>
      <div class="fh-assistant-quick" aria-label="Quick prompts"></div>
      <form class="fh-assistant-form">
        <input type="text" autocomplete="off" placeholder="Ask about FarmersHub..." aria-label="Ask the FarmersHub assistant">
        <button type="submit">Send</button>
      </form>
    </section>
  `;

  document.body.appendChild(root);

  const launcher = root.querySelector('.fh-assistant-launcher');
  const panel = root.querySelector('.fh-assistant-panel');
  const closeButton = root.querySelector('.fh-assistant-close');
  const form = root.querySelector('.fh-assistant-form');
  const input = root.querySelector('.fh-assistant-form input');

  launcher.addEventListener('click', () => toggleAssistant(root, true));
  closeButton.addEventListener('click', () => toggleAssistant(root, false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.dataset.open === 'true') {
      toggleAssistant(root, false);
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    input.value = '';
    addMessage(root, 'user', value);
    await answer(root, value);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    form.requestSubmit();
  });

  root.addEventListener('click', (event) => {
    const quick = event.target.closest('[data-assistant-prompt]');
    if (!quick) return;
    const prompt = quick.dataset.assistantPrompt;
    input.value = prompt;
    form.requestSubmit();
  });

  panel.addEventListener('transitionend', () => {
    if (root.dataset.open === 'true') input.focus();
  });

  return root;
}

function toggleAssistant(root, open) {
  const launcher = root.querySelector('.fh-assistant-launcher');
  const panel = root.querySelector('.fh-assistant-panel');
  root.dataset.open = open ? 'true' : 'false';
  launcher.setAttribute('aria-expanded', open ? 'true' : 'false');
  panel.setAttribute('aria-hidden', open ? 'false' : 'true');
  if (open) {
    window.setTimeout(() => root.querySelector('.fh-assistant-form input')?.focus(), 50);
  }
}

function setStatus(root, text) {
  const status = root.querySelector('.fh-assistant-status');
  if (status) status.textContent = text;
}

function addMessage(root, role, text, actions = []) {
  const list = root.querySelector('.fh-assistant-messages');
  const bubble = document.createElement('article');
  bubble.className = `fh-assistant-message ${role}`;
  bubble.textContent = text;

  if (actions.length) {
    const actionWrap = document.createElement('div');
    actionWrap.className = 'fh-assistant-actions';
    actions.forEach((action) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'fh-assistant-action';
      button.textContent = action.label;
      button.addEventListener('click', action.handler);
      actionWrap.appendChild(button);
    });
    bubble.appendChild(actionWrap);
  }

  list.appendChild(bubble);
  list.scrollTop = list.scrollHeight;
  return bubble;
}

function replaceMessage(bubble, text, role = 'bot', actions = []) {
  bubble.className = `fh-assistant-message ${role}`;
  bubble.textContent = text;
  if (actions.length) {
    const actionWrap = document.createElement('div');
    actionWrap.className = 'fh-assistant-actions';
    actions.forEach((action) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'fh-assistant-action';
      button.textContent = action.label;
      button.addEventListener('click', action.handler);
      actionWrap.appendChild(button);
    });
    bubble.appendChild(actionWrap);
  }
  bubble.parentElement.scrollTop = bubble.parentElement.scrollHeight;
}

function setQuickPrompts(root) {
  const quick = root.querySelector('.fh-assistant-quick');
  const role = state.role;
  const prompts = [
    'What does our app do?',
    'Show current app data',
    role === 'farmer' ? 'What should I do next?' : 'Recommend products',
    role === 'farmer' ? 'Open add product' : 'Open products',
    'What actions can you do?'
  ];

  quick.innerHTML = '';
  prompts.forEach((prompt) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.assistantPrompt = prompt;
    button.textContent = prompt;
    quick.appendChild(button);
  });
}

async function loadContext(root, force = false) {
  if (state.loading) return;
  if (state.loaded && !force) return;

  state.loading = true;
  state.errors = [];
  state.user = getStoredUser();
  state.role = currentRole();
  setStatus(root, 'Loading live FarmersHub data...');

  const token = getToken();
  const role = state.role;
  const tasks = [
    ['farmers', getFarmers({ limit: 100 })],
    ['products', getProducts({ limit: 100 })],
    ['posts', getFeed({ limit: 100 })],
    ['customers', apiFetch('/users/customers?limit=100')]
  ];

  if (token) {
    tasks.push(['profile', getProfile()]);
    tasks.push(['messages', apiFetch('/messages', { headers: jsonHeaders() })]);
    tasks.push(['notifications', apiFetch('/notifications?limit=50', { headers: jsonHeaders() })]);
  }

  if (token && ['farmer', 'customer', 'admin'].includes(role)) {
    tasks.push(['orders', apiFetch('/orders?limit=50', { headers: jsonHeaders() })]);
  }

  if (token && role === 'farmer') {
    tasks.push(['farmStats', apiFetch('/users/me/farm-stats', { headers: jsonHeaders() })]);
  }

  if (token && ['farmer', 'provider', 'admin'].includes(role)) {
    tasks.push(['serviceListings', apiFetch('/farm-service-listings?limit=50', { headers: jsonHeaders() })]);
  }

  const settled = await Promise.allSettled(tasks.map(([, promise]) => promise));
  settled.forEach((result, index) => {
    const key = tasks[index][0];
    if (result.status === 'rejected') {
      state.errors.push(key);
      return;
    }
    assignContextValue(key, result.value);
  });

  state.loaded = true;
  state.loading = false;
  state.lastSyncedAt = new Date();
  setStatus(root, statusText());
  setQuickPrompts(root);
}

function assignContextValue(key, response) {
  const data = response?.data;
  if (key === 'farmers') state.farmers = Array.isArray(data) ? data : [];
  if (key === 'customers') state.customers = Array.isArray(data) ? data : [];
  if (key === 'products') state.products = Array.isArray(data) ? data : [];
  if (key === 'posts') state.posts = Array.isArray(data) ? data : [];
  if (key === 'profile') state.profile = data || null;
  if (key === 'messages') state.conversations = Array.isArray(data) ? data : [];
  if (key === 'notifications') state.notifications = data?.notifications || [];
  if (key === 'orders') state.orders = data?.orders || [];
  if (key === 'farmStats') state.farmStats = data || null;
  if (key === 'serviceListings') state.serviceListings = data?.listings || [];
}

function statusText() {
  const parts = [
    plural(state.products.length, 'product'),
    plural(state.farmers.length, 'farmer'),
    plural(state.posts.length, 'post')
  ];
  if (state.customers.length) parts.push(plural(state.customers.length, 'customer'));
  const errorText = state.errors.length ? `; limited: ${state.errors.join(', ')}` : '';
  return `Synced ${parts.join(', ')}${errorText}.`;
}

function contextSummary() {
  const userName = state.user?.fullName || state.profile?.fullName || 'visitor';
  const productCategories = Array.from(new Set(state.products.map((product) => product.category).filter(Boolean))).slice(0, 8);
  return [
    `You are browsing as ${userName} (${state.role}).`,
    `Live data loaded: ${plural(state.products.length, 'product')}, ${plural(state.farmers.length, 'farmer')}, ${plural(state.customers.length, 'customer')}, ${plural(state.posts.length, 'community post')}.`,
    `Product categories: ${productCategories.length ? productCategories.join(', ') : 'none loaded yet'}.`,
    `Farmers visible now: ${listNames(state.farmers, (farmer) => farmer.farmName || farmer.fullName)}.`,
    `Products visible now: ${listNames(state.products, (product) => product.name)}.`,
    `Safe actions I can do: ${SAFE_ACTIONS.join(', ')}.`
  ].join('\n');
}

function forbiddenAction(query) {
  return BLOCKED_ACTION_WORDS.find((word) => query.includes(word));
}

async function answer(root, rawQuestion) {
  await loadContext(root);
  const pending = addMessage(root, 'bot pending', 'Thinking with the current app context...');
  const response = await routeQuestion(root, rawQuestion);
  replaceMessage(pending, response.text, 'bot', response.actions || []);
  if (typeof response.run === 'function') {
    response.run();
  }
}

async function routeQuestion(root, rawQuestion) {
  const query = normalize(rawQuestion);
  const blocked = forbiddenAction(query);
  if (blocked) {
    return {
      text: `I cannot directly perform "${blocked}" from the home assistant.\n\nI can still help safely by opening the right page, drafting the text, or showing the current data so you can confirm the action yourself.`
    };
  }

  if (/\b(refresh|reload|resync|sync)\b/.test(query)) {
    await loadContext(root, true);
    return { text: `Refreshed.\n\n${contextSummary()}` };
  }

  const actionResult = runLimitedAction(query, rawQuestion);
  if (actionResult) return actionResult;

  if (/\b(what can you do|actions|agent|limited)\b/.test(query)) {
    return { text: `I can do limited agent work only:\n- ${SAFE_ACTIONS.join('\n- ')}\n\nI will not delete records, send messages without you, place orders, change passwords, or expose private credentials.` };
  }

  if (/\b(everything|current data|as of now|status|summary|know)\b/.test(query)) {
    return { text: contextSummary() };
  }

  if (/\b(app|farmershub|feature|features|about|module|modules|backend|frontend|api)\b/.test(query)) {
    return { text: answerAboutApp() };
  }

  if (/\b(user|users|customer|customers|farmer|farmers|profile|account|role|roles|who am i)\b/.test(query)) {
    return { text: answerUsers(query) };
  }

  if (/\b(product|products|listing|listings|price|stock|category|categories|buy|recommend)\b/.test(query)) {
    return answerProducts(query);
  }

  if (/\b(order|orders|payment|payments|revenue|earning|earnings|analytics)\b/.test(query)) {
    return { text: answerOrders() };
  }

  if (/\b(message|messages|conversation|chat|notification|notifications|alert|alerts)\b/.test(query)) {
    return { text: answerMessagesAndAlerts() };
  }

  if (/\b(service|services|equipment|provider|tractor|tiller|irrigation|delivery|storage|fertilizer)\b/.test(query)) {
    return { text: answerServices() };
  }

  if (/\b(limit|limitations|pending|not connected|unavailable|missing)\b/.test(query)) {
    return { text: answerLimitations() };
  }

  const matches = searchContext(rawQuestion);
  if (matches) return matches;

  return {
    text: `I did not find an exact answer in the loaded app data.\n\nTry asking about FarmersHub features, users, products, orders, messages, services, or say things like "search tomatoes", "open messages", or "save tomato".`
  };
}

function answerAboutApp() {
  return [
    KNOWLEDGE.app.join('\n'),
    '',
    'Important app areas:',
    '- Marketplace: products, categories, farmer discovery, favorites, cart, orders.',
    '- Farmer workspace: product management, inventory, customers, analytics, payments, posts, messages, alerts.',
    '- Services: tractors, tillers, irrigation pumps, delivery trucks, fertilizer, cold storage, and provider workflows.',
    '- Community: social feed, posts, likes, uploaded media, and direct messages.'
  ].join('\n');
}

function answerUsers(query) {
  const current = state.profile || state.user || {};
  const lines = [
    `Current role: ${state.role}.`,
    current.fullName ? `Current user: ${current.fullName}.` : 'Current user: no signed-in user loaded.',
    current.email ? `Your email: ${current.email}.` : '',
    current.phone ? `Your phone: ${current.phone}.` : '',
    current.address || current.location ? `Your location/address: ${current.address || current.location}.` : '',
    '',
    `Public farmers loaded: ${plural(state.farmers.length, 'farmer')}.`,
    `Public customers loaded: ${plural(state.customers.length, 'customer')}.`,
    `Farmer names: ${listNames(state.farmers, (farmer) => farmer.farmName || farmer.fullName, 8)}.`,
    `Customer names: ${listNames(state.customers, (customer) => customer.fullName, 8)}.`
  ].filter(Boolean);

  if (query.includes('role') || query.includes('roles')) {
    lines.push('', KNOWLEDGE.roles.join('\n'));
  }

  lines.push('', 'Privacy boundary: I summarize public and signed-in user data only. I do not reveal passwords, tokens, or private admin-only records.');
  return lines.join('\n');
}

function answerProducts(query) {
  const matched = findBestProduct(query);
  if (matched) {
    const stock = matched.stock === undefined || matched.stock === null ? 'stock not listed' : `${matched.stock} ${matched.unit || ''}`.trim();
    const sellerName = getSellerName(matched);
    return {
      text: [
        `${matched.name}`,
        `Category: ${matched.category || 'General'}.`,
        `Price: ${formatMoney(matched.price || matched.sellingPrice)}${matched.discount ? ` after ${matched.discount}% discount` : ''}.`,
        `Stock: ${stock}.`,
        `Seller: ${sellerName}${matched.seller?.location ? ` in ${matched.seller.location}` : ''}.`,
        matched.description ? `Description: ${matched.description}` : '',
      ].filter(Boolean).join('\n'),
      actions: [
        { label: 'Open Product', handler: () => openProduct(matched, true) },
        { label: 'Save Favorite', handler: () => saveFavorite(matched) },
        { label: 'Message Seller', handler: () => openProductMessage(matched, true) }
      ]
    };
  }

  const categories = Array.from(new Set(state.products.map((product) => product.category || 'General'))).slice(0, 10);
  const affordable = [...state.products]
    .sort((a, b) => Number(a.price || a.sellingPrice || 0) - Number(b.price || b.sellingPrice || 0))
    .slice(0, 5);
  return {
    text: [
      `Products loaded: ${plural(state.products.length, 'product')}.`,
      `Categories: ${categories.length ? categories.join(', ') : 'none loaded yet'}.`,
      `Recommended picks: ${listNames(affordable, (product) => `${product.name} (${formatMoney(product.price || product.sellingPrice)})`, 5)}.`,
      'Ask for a specific product name or say "search tomatoes" to filter the home page.'
    ].join('\n'),
    actions: [
      { label: 'Open Products', handler: () => navigateTo('product.html') },
      { label: 'Search Tomatoes', handler: () => performHomeSearch('tomatoes') }
    ]
  };
}

function answerOrders() {
  const stats = state.farmStats;
  const lines = [
    `Orders loaded for this session: ${plural(state.orders.length, 'order')}.`,
    state.orders.length ? `Recent orders: ${listNames(state.orders, (order) => `${order.orderNumber || order.id} - ${order.status}`, 5)}.` : 'No personal order records were loaded for this session.',
    stats ? `Farmer stats: ${stats.pendingOrders || 0} active orders and ${formatMoney(stats.deliveredRevenue || 0)} delivered revenue.` : '',
    '',
    'Known status: order placement, stock reservation, notifications, and order status routes exist in the backend. Some dashboard revenue/payment widgets still need verified order and payment records before they can show reliable totals.'
  ].filter(Boolean);
  return lines.join('\n');
}

function answerMessagesAndAlerts() {
  const unreadNotifications = state.notifications.filter((item) => !item.read).length;
  const unreadConversations = state.conversations.reduce((sum, item) => sum + Number(item.unreadCount || 0), 0);
  return [
    `Conversations loaded: ${plural(state.conversations.length, 'conversation')}.`,
    `Unread messages: ${unreadConversations}.`,
    `Notifications loaded: ${plural(state.notifications.length, 'notification')}.`,
    `Unread notifications: ${unreadNotifications}.`,
    'I can open a prepared message thread, but I will not send a message for you from this assistant.'
  ].join('\n');
}

function answerServices() {
  const staticCategories = [
    'tractor',
    'tiller',
    'irrigation pump',
    'delivery truck',
    'fertilizer',
    'cold storage'
  ];
  const loadedListings = state.serviceListings.map((listing) => listing.title).filter(Boolean);
  return [
    'Farm services help farmers find equipment, transport, storage, farm inputs, and specialist support.',
    `Home page service shortcuts: ${staticCategories.join(', ')}.`,
    `Authenticated service listings loaded: ${state.serviceListings.length ? loadedListings.slice(0, 6).join(', ') : 'none loaded or not available for this role'}.`,
    'Farmers can browse/request services. Providers can onboard and manage service listings.'
  ].join('\n');
}

function answerLimitations() {
  return KNOWLEDGE.limitations.join('\n');
}

function searchContext(rawQuestion) {
  const query = rawQuestion.replace(/^(find|search|show me|look for)\s+/i, '');
  const productMatches = state.products.filter((product) => sameWordsScore([
    product.name,
    product.category,
    product.description,
    getSellerName(product)
  ].join(' '), query) > 0);
  const farmerMatches = state.farmers.filter((farmer) => sameWordsScore([
    farmer.fullName,
    farmer.farmName,
    farmer.location,
    farmer.farmType,
    farmer.bio
  ].join(' '), query) > 0);
  const postMatches = state.posts.filter((post) => sameWordsScore([
    post.text,
    post.caption,
    post.content,
    post.author?.name
  ].join(' '), query) > 0);

  if (!productMatches.length && !farmerMatches.length && !postMatches.length) return null;

  return {
    text: [
      `Matches for "${cleanText(query)}":`,
      `Products: ${listNames(productMatches, (product) => product.name)}.`,
      `Farmers: ${listNames(farmerMatches, (farmer) => farmer.farmName || farmer.fullName)}.`,
      `Posts: ${listNames(postMatches, (post) => post.author?.name || post.text || post.content)}.`
    ].join('\n'),
    actions: [
      { label: 'Filter Home', handler: () => performHomeSearch(query) }
    ]
  };
}

function runLimitedAction(query, rawQuestion) {
  const navigationTarget = detectNavigation(query);
  if (navigationTarget) {
    return {
      text: `Opening ${navigationTarget.label}.`,
      actions: [{ label: 'Open Now', handler: () => navigateTo(navigationTarget.href) }],
      run: () => window.setTimeout(() => navigateTo(navigationTarget.href), 650)
    };
  }

  const searchMatch = rawQuestion.match(/^(search|find|show me|look for)\s+(.+)$/i);
  if (searchMatch) {
    const term = searchMatch[2].trim();
    const count = performHomeSearch(term);
    return { text: `Filtered the home page for "${term}". I found ${count} likely matching loaded item${count === 1 ? '' : 's'}.` };
  }

  if (/\b(save|favorite|favourite)\b/.test(query)) {
    const product = findBestProduct(rawQuestion);
    if (!product) {
      return { text: 'Tell me which product to save, for example "save tomato" or "favorite fresh onions".' };
    }
    saveFavorite(product);
    return { text: `Saved ${product.name} to local favorites on this browser.` };
  }

  if (/\b(message|contact|chat with)\b/.test(query)) {
    const product = findBestProduct(rawQuestion);
    if (product) {
      return {
        text: `I can prepare a message thread with ${getSellerName(product)} about ${product.name}. You will review and send the message yourself.`,
        actions: [{ label: 'Open Message', handler: () => openProductMessage(product, true) }]
      };
    }
    const farmer = findBestFarmer(rawQuestion);
    if (farmer) {
      return {
        text: `I can open a conversation with ${farmer.farmName || farmer.fullName}. You will write and send the message yourself.`,
        actions: [{ label: 'Open Message', handler: () => openFarmerMessage(farmer, true) }]
      };
    }
  }

  if (/\b(order|buy|purchase)\b/.test(query)) {
    const product = findBestProduct(rawQuestion);
    if (!product) return null;
    return {
      text: `I can open ${product.name} with order intent. Final order placement stays on the product page so you can confirm quantity and details.`,
      actions: [{ label: 'Open Product', handler: () => openProduct(product, true) }]
    };
  }

  if (/\b(draft|write|caption|copy)\b/.test(query)) {
    return { text: draftCopy(query, rawQuestion) };
  }

  return null;
}

function detectNavigation(query) {
  if (!/\b(open|go to|take me|navigate|show)\b/.test(query)) return null;
  const entries = [
    ['add product', KNOWLEDGE.pages.addProduct, 'Add Product'],
    ['sell crops', KNOWLEDGE.pages.sell, 'Sell Crops'],
    ['my listings', KNOWLEDGE.pages.productsManagement, 'Product Management'],
    ['products', KNOWLEDGE.pages.products, 'Products'],
    ['marketplace', KNOWLEDGE.pages.marketplace, 'Marketplace'],
    ['services', KNOWLEDGE.pages.services, 'Farm Services'],
    ['equipment', KNOWLEDGE.pages.equipment, 'Farm Services'],
    ['messages', KNOWLEDGE.pages.messages, 'Messages'],
    ['notifications', KNOWLEDGE.pages.notifications, 'Notifications'],
    ['alerts', KNOWLEDGE.pages.alerts, 'Alerts'],
    ['orders', KNOWLEDGE.pages.orders, 'Orders'],
    ['profile', KNOWLEDGE.pages.profile, 'Profile'],
    ['settings', KNOWLEDGE.pages.settings, 'Settings'],
    ['cart', KNOWLEDGE.pages.cart, 'Cart'],
    ['favorites', KNOWLEDGE.pages.favorites, 'Favorites'],
    ['saved', KNOWLEDGE.pages.saved, 'Saved'],
    ['feed', KNOWLEDGE.pages.feed, 'Social Feed'],
    ['analytics', KNOWLEDGE.pages.analytics, 'Analytics'],
    ['payments', KNOWLEDGE.pages.payments, 'Payments'],
    ['customers', KNOWLEDGE.pages.customers, 'Customers'],
    ['admin', KNOWLEDGE.pages.admin, 'Admin Panel'],
    ['login', KNOWLEDGE.pages.login, 'Login'],
    ['sign up', KNOWLEDGE.pages.signup, 'Create Account'],
    ['create account', KNOWLEDGE.pages.signup, 'Create Account'],
    ['help', KNOWLEDGE.pages.help, 'Help Center']
  ];
  const found = entries.find(([term]) => query.includes(term));
  return found ? { href: found[1], label: found[2] } : null;
}

function performHomeSearch(term) {
  const searchInput = document.getElementById('globalSearchInput');
  if (searchInput) {
    searchInput.value = term;
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    searchInput.closest('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const text = normalize(term);
  const loadedMatches = [
    ...state.products.filter((product) => sameWordsScore(`${product.name} ${product.category} ${product.description}`, text) > 0),
    ...state.farmers.filter((farmer) => sameWordsScore(`${farmer.fullName} ${farmer.farmName} ${farmer.location}`, text) > 0),
    ...state.posts.filter((post) => sameWordsScore(`${post.text} ${post.caption} ${post.content}`, text) > 0)
  ];
  return loadedMatches.length;
}

function saveFavorite(product) {
  const id = getProductId(product);
  if (!id) return false;
  let favorites = [];
  try {
    favorites = JSON.parse(localStorage.getItem('fh_favorite_products') || '[]');
    if (!Array.isArray(favorites)) favorites = [];
  } catch {
    favorites = [];
  }
  if (!favorites.map(String).includes(String(id))) {
    favorites.push(String(id));
    localStorage.setItem('fh_favorite_products', JSON.stringify(favorites));
  }
  return true;
}

function openProduct(product, orderIntent = false) {
  const id = getProductId(product);
  const params = new URLSearchParams();
  if (id) {
    params.set('productId', id);
    params.set('id', id);
  }
  if (orderIntent) params.set('intent', 'order');
  navigateTo(`product.html${params.toString() ? `?${params.toString()}` : ''}`);
}

function openProductMessage(product, shouldNavigate = false) {
  const sellerId = getSellerId(product);
  const params = new URLSearchParams({
    recipientId: sellerId,
    recipientName: getSellerName(product),
    recipientRole: 'farmer'
  });
  const productId = getProductId(product);
  if (productId) params.set('productId', productId);
  if (shouldNavigate) navigateTo(`messages.html?${params.toString()}`);
}

function openFarmerMessage(farmer, shouldNavigate = false) {
  const farmerId = farmer.userId || farmer.id || farmer._id || '';
  const params = new URLSearchParams({
    recipientId: farmerId,
    recipientName: farmer.farmName || farmer.fullName || 'FarmersHub member',
    recipientRole: 'farmer'
  });
  if (shouldNavigate) navigateTo(`messages.html?${params.toString()}`);
}

function navigateTo(href) {
  if (!href) return;
  if (href.startsWith('#')) {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  window.location.href = href;
}

function draftCopy(query, rawQuestion) {
  const product = findBestProduct(rawQuestion);
  const farmer = findBestFarmer(rawQuestion);

  if (query.includes('post') || query.includes('caption')) {
    const name = product?.name || 'today\'s fresh harvest';
    return `Draft social post:\nFresh from the farm: ${name}. Available now on FarmersHub for local buyers who want trusted, seasonal produce. Message us for details or place an order through the listing.`;
  }

  if (query.includes('listing') || query.includes('product')) {
    return `Draft product listing:\nTitle: Fresh seasonal produce\nDescription: Locally grown, carefully harvested, and ready for direct pickup or delivery. Add harvest date, stock, unit, price, payment methods, and a clear product photo before publishing.`;
  }

  const recipient = farmer?.farmName || farmer?.fullName || (product ? getSellerName(product) : 'FarmersHub member');
  const subject = product?.name ? ` about ${product.name}` : '';
  return `Draft message to ${recipient}${subject}:\nHi ${recipient}, I saw your listing on FarmersHub and would like to ask about availability, price, delivery or pickup options, and the best time to order. Thank you.`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const root = createAssistant();
  setQuickPrompts(root);
  addMessage(
    root,
    'bot',
    'Hi, I am your FarmersHub assistant. I know the current app structure, live public marketplace data when the API is reachable, and your signed-in session when available.\n\nAsk me about the app, users, products, orders, messages, services, or ask me to do a safe action.'
  );
  await loadContext(root);
});
