const CATEGORY_LABELS = {
  tractor: 'Tractor',
  tiller: 'Tiller',
  irrigation_pump: 'Irrigation Pump',
  delivery_truck: 'Delivery Truck',
  fertilizer: 'Fertilizer',
  cold_storage: 'Cold Storage',
};

function getValidCategory(value) {
  return Object.prototype.hasOwnProperty.call(CATEGORY_LABELS, value) ? value : '';
}

function getCategoryLabel(category) {
  return category ? CATEGORY_LABELS[category] : 'All Services';
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function buildServicesUrl(category) {
  const url = new URL(window.location.href);
  url.pathname = url.pathname.replace(/[^/]*$/, 'services.html');
  url.search = '';

  if (category) {
    url.searchParams.set('category', category);
  }

  return url;
}

function updateActiveLinks(category) {
  document.querySelectorAll('[data-category]').forEach((link) => {
    const linkCategory = link.getAttribute('data-category') || '';
    link.classList.toggle('active', linkCategory === category);
    link.setAttribute('aria-current', linkCategory === category ? 'page' : 'false');
  });

  document.querySelectorAll('[data-category-link]').forEach((link) => {
    const linkCategory = link.getAttribute('data-category-link') || '';
    link.classList.toggle('active', linkCategory === category);
  });
}

function renderListingState(category, label) {
  if (category) {
    setText('servicesStateTitle', `No verified ${label} providers are connected yet.`);
    setText('servicesStateText', `You will be able to compare providers and request this service after the Farm Services backend is connected.`);
    return;
  }

  setText('servicesStateTitle', 'Service listings are being connected.');
  setText('servicesStateText', 'Verified farm-service providers are not available in FarmersHub yet. Once service listings are connected, farmers will be able to browse equipment, transport and farm support here.');
}

function renderRequestState(category, label, action) {
  const requestInput = document.getElementById('requestCategory');
  if (requestInput) requestInput.value = label;

  const requestArea = document.getElementById('requestArea');
  if (!requestArea) return;

  if (action === 'request') {
    requestArea.classList.add('request-highlight');
    requestArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    requestArea.classList.remove('request-highlight');
  }
}

function normalizeUrlIfNeeded(rawCategory, category, action) {
  const current = new URL(window.location.href);
  let changed = false;

  if (rawCategory && !category) {
    current.searchParams.delete('category');
    changed = true;
  }

  if (action && action !== 'request') {
    current.searchParams.delete('action');
    changed = true;
  }

  if (changed) {
    window.history.replaceState({}, '', current);
  }
}

function attachCategoryHandlers() {
  document.querySelectorAll('[data-category], [data-category-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const category = link.getAttribute('data-category') ?? link.getAttribute('data-category-link') ?? '';
      event.preventDefault();
      window.location.href = buildServicesUrl(category).toString();
    });
  });
}

function initialiseServicesPage() {
  const params = new URLSearchParams(window.location.search);
  const rawCategory = params.get('category') || '';
  const category = getValidCategory(rawCategory);
  const action = params.get('action') || '';
  const label = getCategoryLabel(category);

  normalizeUrlIfNeeded(rawCategory, category, action);
  attachCategoryHandlers();
  updateActiveLinks(category);

  setText('servicesTitle', label);
  setText('servicesTopLabel', category ? `${label} services` : 'Farm services workspace');
  setText('selectedCategoryBadge', label);
  setText('selectedCategoryText', category ? `${label} is selected in the Services page URL.` : 'All service categories are shown. The category query parameter is removed.');

  if (category) {
    setText('servicesIntro', `${label} is selected. Real provider listings will appear after provider data and request storage are implemented.`);
  }

  renderListingState(category, label);
  renderRequestState(category, label, action);
}

document.addEventListener('DOMContentLoaded', initialiseServicesPage);
