import { getProviderPublicProfile } from './services/providerService.js';
import { requireFarmer, getQueryParam, appendField, clearElement, createStateCard, humanize, formatMoney, setStatus } from './farmer-services-shell.js';

function renderProfile(data) {
  const profile = data.profile || {};
  const panel = document.getElementById('farmerProviderProfilePanel');
  clearElement(panel);
  const card = document.createElement('article');
  card.className = 'farmer-service-card';
  const title = document.createElement('h2');
  title.textContent = profile.businessName || 'Provider profile';
  card.appendChild(title);
  appendField(card, 'Service area', profile.serviceArea);
  appendField(card, 'Business type', profile.businessType);
  appendField(card, 'About', profile.bio);
  appendField(card, 'Contact preference', humanize(profile.contactPreference));
  appendField(card, 'Verification', profile.verificationStatus === 'approved' ? 'Approved' : 'Verification is pending platform review.');
  panel.appendChild(card);

  const listingsPanel = document.getElementById('farmerProviderListings');
  clearElement(listingsPanel);
  const listings = data.listings || [];
  if (!listings.length) {
    listingsPanel.appendChild(createStateCard('No active listings', 'This provider has no active farmer-facing services right now.'));
    return;
  }
  listings.forEach((listing) => {
    const listingCard = document.createElement('article');
    listingCard.className = 'farmer-service-card';
    const listingTitle = document.createElement('h3');
    listingTitle.textContent = listing.title;
    const copy = document.createElement('p');
    copy.textContent = `${humanize(listing.category)} - ${listing.pricingType === 'quote_required' ? 'Quote required' : formatMoney(listing.price)}`;
    const action = document.createElement('a');
    action.className = 'farmer-service-button';
    action.href = `farmer-service-detail.html?id=${encodeURIComponent(listing.id)}`;
    action.textContent = 'View service';
    listingCard.append(listingTitle, copy, action);
    listingsPanel.appendChild(listingCard);
  });
}

async function initialise() {
  await requireFarmer();
  const id = getQueryParam('id');
  if (!id) {
    document.getElementById('farmerProviderProfilePanel').appendChild(createStateCard('Provider missing', 'Open a provider from a service listing.', 'error'));
    return;
  }
  try {
    const response = await getProviderPublicProfile(id);
    renderProfile(response.data || {});
  } catch (error) {
    setStatus('farmerProviderProfileStatus', error.message || 'Unable to load provider profile.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', initialise);
