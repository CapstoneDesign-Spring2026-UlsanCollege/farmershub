import { getServiceRequestById, quoteServiceRequest, declineServiceRequest, completeServiceRequest } from './services/serviceRequestService.js';
import { requireProvider, getQueryParam, appendField, clearElement, createStateCard, formatDate, formatMoney, humanize, setStatus } from './provider-shell.js';

let currentRequest = null;

function renderRequest(request) {
  currentRequest = request;
  const detail = document.getElementById('providerRequestDetail');
  clearElement(detail);
  const card = document.createElement('article');
  card.className = 'provider-card';
  const title = document.createElement('h2');
  title.textContent = request.listing?.title || 'Service request';
  card.appendChild(title);
  appendField(card, 'Status', humanize(request.status));
  appendField(card, 'Farmer', request.farmer?.name || '');
  appendField(card, 'Farm location', request.farmLocation);
  appendField(card, 'Preferred dates', `${formatDate(request.preferredStartDate)} to ${formatDate(request.preferredEndDate)}`);
  appendField(card, 'Need', request.needDescription);
  appendField(card, 'Acreage or quantity', request.acreageOrQuantity);
  appendField(card, 'Budget', request.budget ? formatMoney(request.budget) : 'Not set');
  appendField(card, 'Quote', request.quote?.amount ? `${formatMoney(request.quote.amount)} - ${request.quote.notes || ''}` : 'Not quoted');
  const actions = document.createElement('div');
  actions.className = 'provider-actions';
  const message = document.createElement('a');
  message.className = 'provider-secondary-button';
  message.href = `provider-messages.html?recipientId=${encodeURIComponent(request.farmer?.id || '')}&requestId=${encodeURIComponent(request.id)}`;
  message.textContent = 'Message farmer';
  actions.appendChild(message);
  card.appendChild(actions);
  detail.appendChild(card);

  const canQuote = ['new', 'quoted'].includes(request.status);
  const canComplete = request.status === 'accepted';
  document.getElementById('providerQuoteForm').hidden = !canQuote;
  document.getElementById('providerCompleteBtn').disabled = !canComplete;
  document.getElementById('providerDeclineBtn').disabled = !canQuote;
}

async function loadRequest() {
  const id = getQueryParam('id');
  const detail = document.getElementById('providerRequestDetail');
  if (!id) {
    clearElement(detail);
    detail.appendChild(createStateCard('Request missing', 'Open a request from the Provider Requests page.', 'error'));
    return;
  }
  const response = await getServiceRequestById(id);
  renderRequest(response.data);
}

async function initialise() {
  await requireProvider();
  try {
    await loadRequest();
  } catch (error) {
    setStatus('providerRequestDetailStatus', error.message || 'Unable to load request.', 'error');
  }

  document.getElementById('providerQuoteForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!currentRequest) return;
    const data = new FormData(event.currentTarget);
    try {
      await quoteServiceRequest(currentRequest.id, {
        amount: Number(data.get('amount') || 0),
        pricingType: String(data.get('pricingType') || 'fixed'),
        validUntil: String(data.get('validUntil') || ''),
        notes: String(data.get('notes') || '').trim(),
      });
      setStatus('providerRequestDetailStatus', 'Quote sent to farmer.');
      await loadRequest();
    } catch (error) {
      setStatus('providerRequestDetailStatus', error.message || 'Unable to quote request.', 'error');
    }
  });

  document.getElementById('providerDeclineBtn')?.addEventListener('click', async () => {
    if (!currentRequest) return;
    try {
      await declineServiceRequest(currentRequest.id, { reason: 'Provider declined this request.' });
      setStatus('providerRequestDetailStatus', 'Request declined.');
      await loadRequest();
    } catch (error) {
      setStatus('providerRequestDetailStatus', error.message || 'Unable to decline request.', 'error');
    }
  });

  document.getElementById('providerCompleteBtn')?.addEventListener('click', async () => {
    if (!currentRequest) return;
    try {
      await completeServiceRequest(currentRequest.id);
      setStatus('providerRequestDetailStatus', 'Request marked complete.');
      await loadRequest();
    } catch (error) {
      setStatus('providerRequestDetailStatus', error.message || 'Unable to complete request.', 'error');
    }
  });
}

document.addEventListener('DOMContentLoaded', initialise);
