import { getFarmServiceListingById } from './services/farmServiceListingService.js';
import { createServiceRequest, getServiceRequestById, acceptServiceRequestQuote, cancelServiceRequest } from './services/serviceRequestService.js';
import { requireFarmer, getQueryParam, appendField, clearElement, createStateCard, formatDate, formatMoney, humanize, setStatus } from './farmer-services-shell.js';

let currentRequest = null;

function renderListingSummary(listing) {
  const summary = document.getElementById('farmerServiceRequestListing');
  clearElement(summary);
  const title = document.createElement('h2');
  title.textContent = listing.title;
  summary.appendChild(title);
  appendField(summary, 'Provider', listing.provider?.businessName);
  appendField(summary, 'Pricing', listing.pricingType === 'quote_required' ? 'Quote required' : `${formatMoney(listing.price)} - ${humanize(listing.pricingType)}`);
  appendField(summary, 'Service area', listing.serviceArea);
}

function renderSubmittedRequest(request) {
  currentRequest = request;
  document.getElementById('farmerServiceRequestForm').hidden = true;
  const panel = document.getElementById('farmerSubmittedRequestPanel');
  clearElement(panel);
  const card = document.createElement('article');
  card.className = 'farmer-service-card';
  const title = document.createElement('h2');
  title.textContent = request.listing?.title || 'Submitted request';
  card.appendChild(title);
  appendField(card, 'Status', humanize(request.status));
  appendField(card, 'Provider', request.provider?.businessName || '');
  appendField(card, 'Farm location', request.farmLocation);
  appendField(card, 'Need', request.needDescription);
  appendField(card, 'Preferred dates', `${formatDate(request.preferredStartDate)} to ${formatDate(request.preferredEndDate)}`);
  appendField(card, 'Quote', request.quote?.amount ? `${formatMoney(request.quote.amount)} - ${request.quote.notes || ''}` : 'No quote yet');
  const actions = document.createElement('div');
  actions.className = 'farmer-service-card-actions';
  if (request.status === 'quoted') {
    const accept = document.createElement('button');
    accept.className = 'farmer-service-button';
    accept.type = 'button';
    accept.textContent = 'Accept quote';
    accept.addEventListener('click', async () => {
      try {
        await acceptServiceRequestQuote(request.id);
        setStatus('farmerServiceRequestStatus', 'Quote accepted.');
        await loadExistingRequest(request.id);
      } catch (error) {
        setStatus('farmerServiceRequestStatus', error.message || 'Unable to accept quote.', 'error');
      }
    });
    actions.appendChild(accept);
  }
  if (['new', 'quoted', 'accepted'].includes(request.status)) {
    const cancel = document.createElement('button');
    cancel.className = 'farmer-service-danger-button';
    cancel.type = 'button';
    cancel.textContent = 'Cancel request';
    cancel.addEventListener('click', async () => {
      try {
        await cancelServiceRequest(request.id);
        setStatus('farmerServiceRequestStatus', 'Request cancelled.');
        await loadExistingRequest(request.id);
      } catch (error) {
        setStatus('farmerServiceRequestStatus', error.message || 'Unable to cancel request.', 'error');
      }
    });
    actions.appendChild(cancel);
  }
  const message = document.createElement('a');
  message.className = 'farmer-service-secondary-button';
  message.href = `farmer-provider-messages.html?recipientId=${encodeURIComponent(request.provider?.id || '')}&requestId=${encodeURIComponent(request.id)}`;
  message.textContent = 'Message provider';
  actions.appendChild(message);
  card.appendChild(actions);
  panel.appendChild(card);
}

async function loadExistingRequest(id) {
  const response = await getServiceRequestById(id);
  renderSubmittedRequest(response.data);
}

function payloadFrom(form, listingId) {
  const data = new FormData(form);
  return {
    listingId,
    farmLocation: String(data.get('farmLocation') || '').trim(),
    needDescription: String(data.get('needDescription') || '').trim(),
    preferredStartDate: String(data.get('preferredStartDate') || ''),
    preferredEndDate: String(data.get('preferredEndDate') || ''),
    acreageOrQuantity: String(data.get('acreageOrQuantity') || '').trim(),
    budget: Number(data.get('budget') || 0),
    contactPreference: String(data.get('contactPreference') || 'message'),
    notes: String(data.get('notes') || '').trim(),
  };
}

async function initialise() {
  await requireFarmer();
  const existingId = getQueryParam('id');
  const listingId = getQueryParam('listingId');
  const summary = document.getElementById('farmerServiceRequestListing');
  if (existingId) {
    try {
      await loadExistingRequest(existingId);
    } catch (error) {
      setStatus('farmerServiceRequestStatus', error.message || 'Unable to load request.', 'error');
    }
    return;
  }
  if (!listingId) {
    summary.appendChild(createStateCard('Listing missing', 'Select a service before submitting a request.', 'error'));
    document.getElementById('farmerServiceRequestForm').hidden = true;
    return;
  }
  try {
    const response = await getFarmServiceListingById(listingId);
    renderListingSummary(response.data);
  } catch (error) {
    setStatus('farmerServiceRequestStatus', error.message || 'Unable to load listing.', 'error');
  }

  document.getElementById('farmerServiceRequestForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const payload = payloadFrom(event.currentTarget, listingId);
      if (!payload.farmLocation || !payload.needDescription) {
        throw new Error('Farm location and description of need are required.');
      }
      const response = await createServiceRequest(payload);
      window.location.href = `farmer-service-request.html?id=${encodeURIComponent(response.data.id)}`;
    } catch (error) {
      setStatus('farmerServiceRequestStatus', error.message || 'Unable to submit request.', 'error');
    }
  });
}

document.addEventListener('DOMContentLoaded', initialise);
