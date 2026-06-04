import { getFarmServiceListingById } from './services/farmServiceListingService.js';
import { requireFarmer, getQueryParam, appendField, clearElement, createStateCard, humanize, formatMoney, setStatus } from './farmer-services-shell.js';

function renderListing(listing) {
  const panel = document.getElementById('farmerServiceDetailPanel');
  clearElement(panel);
  const card = document.createElement('article');
  card.className = 'farmer-service-card';
  const title = document.createElement('h2');
  title.textContent = listing.title;
  card.appendChild(title);
  appendField(card, 'Provider', listing.provider?.businessName || '');
  appendField(card, 'Category', humanize(listing.category));
  appendField(card, 'Listing type', humanize(listing.listingType));
  appendField(card, 'Pricing', listing.pricingType === 'quote_required' ? 'Quote required' : `${formatMoney(listing.price)} - ${humanize(listing.pricingType)}`);
  appendField(card, 'Service area', listing.serviceArea);
  appendField(card, 'Availability', listing.availability);
  appendField(card, 'Description', listing.description);
  appendField(card, 'Equipment details', listing.equipmentDetails);
  appendField(card, 'Terms summary', listing.termsSummary);
  const actions = document.createElement('div');
  actions.className = 'farmer-service-card-actions';
  const request = document.createElement('a');
  request.className = 'farmer-service-button';
  request.href = `farmer-service-request.html?listingId=${encodeURIComponent(listing.id)}`;
  request.textContent = 'Request this service';
  const message = document.createElement('a');
  message.className = 'farmer-service-secondary-button';
  message.href = `farmer-provider-messages.html?recipientId=${encodeURIComponent(listing.provider?.id || '')}`;
  message.textContent = 'Message provider';
  const profile = document.createElement('a');
  profile.className = 'farmer-service-secondary-button';
  profile.href = `farmer-provider-profile.html?id=${encodeURIComponent(listing.provider?.id || '')}`;
  profile.textContent = 'View provider profile';
  actions.append(request, message, profile);
  card.appendChild(actions);
  panel.appendChild(card);
}

async function initialise() {
  await requireFarmer();
  const id = getQueryParam('id');
  const panel = document.getElementById('farmerServiceDetailPanel');
  if (!id) {
    panel.appendChild(createStateCard('Listing missing', 'Open a service listing from the marketplace.', 'error'));
    return;
  }
  try {
    const response = await getFarmServiceListingById(id);
    renderListing(response.data);
  } catch (error) {
    setStatus('farmerServiceDetailStatus', error.message || 'Unable to load service listing.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', initialise);
