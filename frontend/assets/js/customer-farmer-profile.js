import { getFarmerById } from './services/farmerService.js';
import {
  createImageBlock,
  customerMessageUrl,
  customerProductUrl,
  formatCurrency,
  getFarmerId,
  getFarmerImage,
  getFarmerName,
  getInitials,
  getProductCategory,
  getProductId,
  getProductImage,
  getProductName,
  getProductPrice,
  hydrateCustomerShell,
} from './customer-shell.js';

const shell = document.getElementById('farmerProfileShell');
const topTitle = document.getElementById('farmerTopTitle');
const searchForm = document.getElementById('farmerSearchForm');
const searchInput = document.getElementById('farmerSearchInput');
const params = new URLSearchParams(window.location.search);
const requestedFarmerId = params.get('farmer') || params.get('id');

function renderState(title, body, type = '') {
  shell.innerHTML = '';
  const state = document.createElement('div');
  state.className = 'customer-state customer-empty';
  if (type === 'error') state.classList.add('is-error');
  const heading = document.createElement('strong');
  heading.textContent = title;
  const copy = document.createElement('p');
  copy.textContent = body;
  const action = document.createElement('a');
  action.className = 'customer-button';
  action.href = 'customer-marketplace.html';
  action.textContent = 'Browse marketplace';
  state.append(heading, copy, action);
  shell.appendChild(state);
}

function addMeta(dl, label, value) {
  if (!value) return;
  const item = document.createElement('div');
  const term = document.createElement('dt');
  const detail = document.createElement('dd');
  term.textContent = label;
  detail.textContent = Array.isArray(value) ? value.join(', ') : String(value);
  item.append(term, detail);
  dl.appendChild(item);
}

function renderProducts(products = [], farmer) {
  const panel = document.createElement('section');
  panel.className = 'customer-panel';
  const heading = document.createElement('div');
  heading.className = 'customer-panel-heading';
  const headingCopy = document.createElement('div');
  const kicker = document.createElement('p');
  kicker.className = 'customer-section-kicker';
  kicker.textContent = 'Returned products';
  const title = document.createElement('h2');
  title.textContent = 'Products from this farmer';
  headingCopy.append(kicker, title);
  heading.appendChild(headingCopy);
  panel.appendChild(heading);

  if (!products.length) {
    const empty = document.createElement('div');
    empty.className = 'customer-state customer-empty';
    const emptyTitle = document.createElement('strong');
    emptyTitle.textContent = 'No products returned for this farmer';
    const emptyCopy = document.createElement('p');
    emptyCopy.textContent = 'This public profile did not return product listings yet.';
    empty.append(emptyTitle, emptyCopy);
    panel.appendChild(empty);
    return panel;
  }

  const grid = document.createElement('div');
  grid.className = 'farmer-products-grid';
  products.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'customer-product-card';
    const body = document.createElement('div');
    body.className = 'customer-product-body';
    const category = document.createElement('span');
    category.className = 'customer-pill';
    category.textContent = getProductCategory(product);
    const name = document.createElement('h3');
    name.textContent = getProductName(product);
    const price = document.createElement('strong');
    price.className = 'customer-product-price';
    price.textContent = formatCurrency(getProductPrice(product));
    const actions = document.createElement('div');
    actions.className = 'customer-product-actions';
    const view = document.createElement('a');
    view.className = 'customer-button';
    view.href = customerProductUrl(product);
    view.textContent = 'View';
    const message = document.createElement('a');
    message.className = 'customer-secondary-button';
    message.href = customerMessageUrl({
      recipientId: getFarmerId(farmer),
      recipientName: getFarmerName(farmer),
      recipientRole: 'farmer',
      productId: getProductId(product),
      productName: getProductName(product),
    });
    message.textContent = 'Message';
    actions.append(view, message);
    body.append(category, name, price, actions);
    card.append(createImageBlock(getProductImage(product), getProductName(product)), body);
    grid.appendChild(card);
  });
  panel.appendChild(grid);
  return panel;
}

function renderFarmer(farmer) {
  const farmerId = getFarmerId(farmer);
  const name = getFarmerName(farmer);
  topTitle.textContent = name;
  shell.innerHTML = '';

  const hero = document.createElement('section');
  hero.className = 'farmer-public-hero';
  if (farmer.coverUrl) {
    hero.style.backgroundImage = `linear-gradient(110deg, rgba(18, 78, 43, 0.96), rgba(37, 133, 76, 0.72)), url("${farmer.coverUrl}")`;
  }

  const avatar = document.createElement('div');
  avatar.className = 'farmer-public-avatar';
  const image = getFarmerImage(farmer);
  if (image) {
    avatar.textContent = '';
    avatar.style.backgroundImage = `url("${image}")`;
    avatar.setAttribute('role', 'img');
    avatar.setAttribute('aria-label', `${name} profile picture`);
  } else {
    avatar.textContent = getInitials(name);
  }

  const copy = document.createElement('div');
  const kicker = document.createElement('p');
  kicker.className = 'customer-section-kicker';
  kicker.textContent = 'Public farmer profile';
  const title = document.createElement('h1');
  title.textContent = name;
  const summary = document.createElement('p');
  summary.textContent = farmer.farmName || farmer.location || 'Local FarmersHub provider';
  copy.append(kicker, title, summary);

  const actions = document.createElement('div');
  actions.className = 'farmer-public-actions';
  const message = document.createElement('a');
  message.className = 'customer-button';
  message.href = customerMessageUrl({
    recipientId: farmerId,
    recipientName: name,
    recipientRole: 'farmer',
  });
  message.textContent = 'Message farmer';
  const market = document.createElement('a');
  market.className = 'customer-secondary-button';
  market.href = 'customer-marketplace.html';
  market.textContent = 'Back to marketplace';
  actions.append(message, market);
  hero.append(avatar, copy, actions);
  shell.appendChild(hero);

  const grid = document.createElement('section');
  grid.className = 'farmer-profile-grid';

  const about = document.createElement('article');
  about.className = 'customer-card farmer-about-card';
  const aboutPill = document.createElement('span');
  aboutPill.className = 'customer-pill';
  aboutPill.textContent = 'Customer view';
  const aboutTitle = document.createElement('h2');
  aboutTitle.textContent = 'About this farmer';
  const aboutCopy = document.createElement('p');
  aboutCopy.textContent = farmer.bio || 'This farmer has not added a public bio yet.';
  const meta = document.createElement('dl');
  meta.className = 'customer-meta-list';
  addMeta(meta, 'Farm name', farmer.farmName);
  addMeta(meta, 'Location', farmer.location || farmer.address);
  addMeta(meta, 'Products', farmer.productsLabel);
  addMeta(meta, 'Crop types', farmer.cropTypes);
  about.append(aboutPill, aboutTitle, aboutCopy, meta);

  const contact = document.createElement('aside');
  contact.className = 'customer-card farmer-contact-card';
  const contactPill = document.createElement('span');
  contactPill.className = 'customer-pill';
  contactPill.textContent = 'Private controls hidden';
  const contactTitle = document.createElement('h2');
  contactTitle.textContent = 'Contact safely';
  const contactCopy = document.createElement('p');
  contactCopy.textContent = 'Use customer Messages to ask about products. This page does not expose farmer management or editing tools.';
  const contactAction = document.createElement('a');
  contactAction.className = 'customer-button';
  contactAction.href = message.href;
  contactAction.textContent = 'Open message';
  contact.append(contactPill, contactTitle, contactCopy, contactAction);

  grid.append(about, contact);
  shell.appendChild(grid);
  shell.appendChild(renderProducts(farmer.products || [], farmer));
}

async function loadFarmer() {
  hydrateCustomerShell();

  if (!requestedFarmerId) {
    renderState('Farmer not selected', 'Open a farmer from Customer Marketplace to view a public profile.', 'error');
    return;
  }

  try {
    const response = await getFarmerById(requestedFarmerId);
    if (!response.data) {
      renderState('Farmer unavailable', 'The Farmers API did not return a public farmer profile.', 'error');
      return;
    }
    renderFarmer(response.data);
  } catch (error) {
    renderState('Unable to load farmer profile', error.message || 'Please return to the marketplace and try again.', 'error');
  }
}

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = String(searchInput?.value || '').trim();
  const params = new URLSearchParams();
  if (query) params.set('search', query);
  window.location.href = `customer-marketplace.html${params.toString() ? `?${params.toString()}` : ''}`;
});

loadFarmer();
