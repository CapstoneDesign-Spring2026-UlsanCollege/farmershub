import { getProviderProfile } from './services/providerService.js';
import { getFarmServiceListings } from './services/farmServiceListingService.js';
import { getServiceRequests } from './services/serviceRequestService.js';
import { requireProvider, setText, clearElement, createStateCard, humanize, formatMoney, formatDate } from './provider-shell.js';

function countStatus(requests, status) {
  return requests.filter((request) => request.status === status).length;
}

function appendRecentRequest(container, request) {
  const card = document.createElement('article');
  card.className = 'provider-card';
  const title = document.createElement('h3');
  title.textContent = request.listing?.title || 'Service request';
  const meta = document.createElement('p');
  meta.textContent = `${request.farmer?.name || 'Farmer'} - ${humanize(request.status)} - ${formatDate(request.createdAt)}`;
  const action = document.createElement('a');
  action.className = 'provider-secondary-button';
  action.href = `provider-request-detail.html?id=${encodeURIComponent(request.id)}`;
  action.textContent = 'Open request';
  card.append(title, meta, action);
  container.appendChild(card);
}

function appendListing(container, listing) {
  const card = document.createElement('article');
  card.className = 'provider-card';
  const title = document.createElement('h3');
  title.textContent = listing.title;
  const meta = document.createElement('p');
  meta.textContent = `${humanize(listing.category)} - ${listing.pricingType === 'quote_required' ? 'Quote required' : formatMoney(listing.price)}`;
  const action = document.createElement('a');
  action.className = 'provider-secondary-button';
  action.href = `provider-listing-form.html?id=${encodeURIComponent(listing.id)}`;
  action.textContent = 'Manage';
  card.append(title, meta, action);
  container.appendChild(card);
}

async function initialise() {
  await requireProvider();
  const [profileResult, listingsResult, requestsResult] = await Promise.allSettled([
    getProviderProfile(),
    getFarmServiceListings({ mine: 'true', limit: 100 }),
    getServiceRequests({ limit: 100 }),
  ]);

  const profile = profileResult.status === 'fulfilled' ? (profileResult.value.data || {}) : {};
  const listings = listingsResult.status === 'fulfilled' ? (listingsResult.value.data?.listings || []) : [];
  const requests = requestsResult.status === 'fulfilled' ? (requestsResult.value.data?.requests || []) : [];

  setText('providerBusinessName', profile.businessName || 'Provider workspace');
  setText('providerProfileStatus', profile.isOnboarded ? 'Profile ready' : 'Onboarding required');
  setText('providerListingCount', String(listings.length));
  setText('providerActiveListingCount', String(listings.filter((item) => item.isActive).length));
  setText('providerNewRequestCount', String(countStatus(requests, 'new')));
  setText('providerQuotedRequestCount', String(countStatus(requests, 'quoted')));

  const listingGrid = document.getElementById('providerDashboardListings');
  clearElement(listingGrid);
  if (!listings.length) {
    listingGrid.appendChild(createStateCard('No service listings yet', 'Create a listing after onboarding so farmers can request real support.'));
  } else {
    listings.slice(0, 3).forEach((listing) => appendListing(listingGrid, listing));
  }

  const requestGrid = document.getElementById('providerDashboardRequests');
  clearElement(requestGrid);
  if (!requests.length) {
    requestGrid.appendChild(createStateCard('No farmer requests yet', 'Incoming service requests will appear here when farmers submit them.'));
  } else {
    requests.slice(0, 4).forEach((request) => appendRecentRequest(requestGrid, request));
  }
}

document.addEventListener('DOMContentLoaded', initialise);
