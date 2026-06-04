import { getServiceRequests } from './services/serviceRequestService.js';
import { requireProvider, clearElement, createStateCard, humanize, formatDate, formatMoney, setStatus } from './provider-shell.js';

function renderRequest(container, request) {
  const card = document.createElement('article');
  card.className = 'provider-card';
  const pill = document.createElement('span');
  pill.className = 'provider-pill';
  pill.textContent = humanize(request.status);
  const title = document.createElement('h3');
  title.textContent = request.listing?.title || 'Service request';
  const copy = document.createElement('p');
  copy.textContent = `${request.farmer?.name || 'Farmer'} - ${request.farmLocation || 'Location not set'} - ${formatDate(request.createdAt)}`;
  const quote = document.createElement('p');
  quote.textContent = request.quote?.amount ? `Quoted: ${formatMoney(request.quote.amount)}` : 'No quote sent yet.';
  const actions = document.createElement('div');
  actions.className = 'provider-actions';
  const detail = document.createElement('a');
  detail.className = 'provider-button';
  detail.href = `provider-request-detail.html?id=${encodeURIComponent(request.id)}`;
  detail.textContent = 'Open';
  const message = document.createElement('a');
  message.className = 'provider-secondary-button';
  message.href = `provider-messages.html?recipientId=${encodeURIComponent(request.farmer?.id || '')}&requestId=${encodeURIComponent(request.id)}`;
  message.textContent = 'Message farmer';
  actions.append(detail, message);
  card.append(pill, title, copy, quote, actions);
  container.appendChild(card);
}

async function initialise() {
  await requireProvider();
  const grid = document.getElementById('providerRequestsGrid');
  try {
    setStatus('providerRequestsStatus', 'Loading farmer requests...');
    const response = await getServiceRequests({ limit: 100 });
    const requests = response.data?.requests || [];
    clearElement(grid);
    setStatus('providerRequestsStatus', requests.length ? `${requests.length} request${requests.length === 1 ? '' : 's'} loaded.` : '');
    if (!requests.length) {
      grid.appendChild(createStateCard('No service requests yet', 'Requests from farmers will appear here after they submit real service needs.'));
      return;
    }
    requests.forEach((request) => renderRequest(grid, request));
  } catch (error) {
    setStatus('providerRequestsStatus', error.message || 'Unable to load requests.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', initialise);
