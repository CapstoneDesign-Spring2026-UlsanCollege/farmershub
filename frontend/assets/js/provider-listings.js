import { getFarmServiceListings, setFarmServiceListingActive } from './services/farmServiceListingService.js';
import { requireProvider, clearElement, createStateCard, humanize, formatMoney, setStatus } from './provider-shell.js';

function renderListing(container, listing, reload) {
  const card = document.createElement('article');
  card.className = 'provider-card';
  const pill = document.createElement('span');
  pill.className = 'provider-pill';
  pill.textContent = listing.isActive ? 'Active' : 'Inactive';
  const title = document.createElement('h3');
  title.textContent = listing.title;
  const copy = document.createElement('p');
  copy.textContent = `${humanize(listing.category)} - ${humanize(listing.listingType)} - ${listing.pricingType === 'quote_required' ? 'Quote required' : formatMoney(listing.price)}`;
  const area = document.createElement('p');
  area.textContent = `Service area: ${listing.serviceArea || 'Not set'}`;
  const actions = document.createElement('div');
  actions.className = 'provider-actions';
  const edit = document.createElement('a');
  edit.className = 'provider-secondary-button';
  edit.href = `provider-listing-form.html?id=${encodeURIComponent(listing.id)}`;
  edit.textContent = 'Edit';
  const toggle = document.createElement('button');
  toggle.className = listing.isActive ? 'provider-danger-button' : 'provider-button';
  toggle.type = 'button';
  toggle.textContent = listing.isActive ? 'Deactivate' : 'Activate';
  toggle.addEventListener('click', async () => {
    toggle.disabled = true;
    try {
      await setFarmServiceListingActive(listing.id, !listing.isActive);
      await reload();
    } catch (error) {
      setStatus('providerListingsStatus', error.message || 'Unable to update listing.', 'error');
      toggle.disabled = false;
    }
  });
  actions.append(edit, toggle);
  card.append(pill, title, copy, area, actions);
  container.appendChild(card);
}

async function loadListings() {
  const grid = document.getElementById('providerListingsGrid');
  clearElement(grid);
  setStatus('providerListingsStatus', 'Loading your service listings...');
  const response = await getFarmServiceListings({ mine: 'true', limit: 100 });
  const listings = response.data?.listings || [];
  setStatus('providerListingsStatus', listings.length ? `${listings.length} listing${listings.length === 1 ? '' : 's'} loaded.` : '');
  if (!listings.length) {
    grid.appendChild(createStateCard('No listings created', 'Create a real listing for equipment, transport, inputs, storage, or specialist support.'));
    return;
  }
  listings.forEach((listing) => renderListing(grid, listing, loadListings));
}

async function initialise() {
  await requireProvider();
  try {
    await loadListings();
  } catch (error) {
    setStatus('providerListingsStatus', error.message || 'Unable to load listings.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', initialise);
