import { getFarmServiceListings } from './services/farmServiceListingService.js';
import { requireFarmer, clearElement, createStateCard, humanize, formatMoney, setStatus } from './farmer-services-shell.js';

function queryValue(name) {
  return new URLSearchParams(window.location.search).get(name) || '';
}

function cardForListing(listing) {
  const card = document.createElement('article');
  card.className = 'farmer-service-card';
  const pill = document.createElement('span');
  pill.className = 'farmer-service-pill';
  pill.textContent = humanize(listing.category);
  const title = document.createElement('h3');
  title.textContent = listing.title;
  const provider = document.createElement('p');
  provider.textContent = `${listing.provider?.businessName || 'Provider'} - ${listing.serviceArea || 'Service area not set'}`;
  const price = document.createElement('p');
  price.textContent = listing.pricingType === 'quote_required' ? 'Quote required after request review' : `${formatMoney(listing.price)} - ${humanize(listing.pricingType)}`;
  const actions = document.createElement('div');
  actions.className = 'farmer-service-card-actions';
  const detail = document.createElement('a');
  detail.className = 'farmer-service-button';
  detail.href = `farmer-service-detail.html?id=${encodeURIComponent(listing.id)}`;
  detail.textContent = 'View service';
  const request = document.createElement('a');
  request.className = 'farmer-service-secondary-button';
  request.href = `farmer-service-request.html?listingId=${encodeURIComponent(listing.id)}`;
  request.textContent = 'Request';
  const profile = document.createElement('a');
  profile.className = 'farmer-service-secondary-button';
  profile.href = `farmer-provider-profile.html?id=${encodeURIComponent(listing.provider?.id || '')}`;
  profile.textContent = 'Provider profile';
  actions.append(detail, request, profile);
  card.append(pill, title, provider, price, actions);
  return card;
}

async function loadListings() {
  const grid = document.getElementById('farmerServicesGrid');
  clearElement(grid);
  const category = document.getElementById('serviceCategoryFilter')?.value || queryValue('category');
  const search = document.getElementById('serviceSearchInput')?.value || queryValue('search');
  setStatus('farmerServicesStatus', 'Loading active provider listings...');
  const response = await getFarmServiceListings({ category, search, limit: 100 });
  const listings = response.data?.listings || [];
  setStatus('farmerServicesStatus', listings.length ? `${listings.length} service listing${listings.length === 1 ? '' : 's'} available.` : '');
  if (!listings.length) {
    grid.appendChild(createStateCard('No active services found', 'Try a different category or search term. Providers can publish listings from the Provider Portal.'));
    return;
  }
  listings.forEach((listing) => grid.appendChild(cardForListing(listing)));
}

async function initialise() {
  await requireFarmer();
  const initialCategory = queryValue('category');
  if (initialCategory && document.getElementById('serviceCategoryFilter')) {
    document.getElementById('serviceCategoryFilter').value = initialCategory;
  }
  document.getElementById('serviceSearchForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await loadListings();
    } catch (error) {
      setStatus('farmerServicesStatus', error.message || 'Unable to load services.', 'error');
    }
  });
  document.getElementById('serviceCategoryFilter')?.addEventListener('change', loadListings);
  try {
    await loadListings();
  } catch (error) {
    setStatus('farmerServicesStatus', error.message || 'Unable to load services.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', initialise);
