import { getServiceRequests, acceptServiceRequestQuote, cancelServiceRequest } from './services/serviceRequestService.js';
import { requireFarmer, clearElement, createStateCard, formatDate, formatMoney, humanize, setStatus } from './farmer-services-shell.js';

async function reload() {
  const list = document.getElementById('farmerServiceRequestsList');
  clearElement(list);
  const response = await getServiceRequests({ limit: 100 });
  const requests = response.data?.requests || [];
  setStatus('farmerServiceRequestsStatus', requests.length ? `${requests.length} request${requests.length === 1 ? '' : 's'} loaded.` : '');
  if (!requests.length) {
    list.appendChild(createStateCard('No service requests submitted', 'Requests you submit to providers will appear here.'));
    return;
  }
  requests.forEach((request) => {
    const card = document.createElement('article');
    card.className = 'farmer-service-card';
    const pill = document.createElement('span');
    pill.className = 'farmer-service-pill';
    pill.textContent = humanize(request.status);
    const title = document.createElement('h3');
    title.textContent = request.listing?.title || 'Service request';
    const copy = document.createElement('p');
    copy.textContent = `${request.provider?.businessName || 'Provider'} - ${formatDate(request.createdAt)}`;
    const quote = document.createElement('p');
    quote.textContent = request.quote?.amount ? `Quoted amount: ${formatMoney(request.quote.amount)}` : 'No quote yet';
    const actions = document.createElement('div');
    actions.className = 'farmer-service-card-actions';
    const view = document.createElement('a');
    view.className = 'farmer-service-button';
    view.href = `farmer-service-request.html?id=${encodeURIComponent(request.id)}`;
    view.textContent = 'View';
    actions.appendChild(view);
    if (request.status === 'quoted') {
      const accept = document.createElement('button');
      accept.type = 'button';
      accept.className = 'farmer-service-secondary-button';
      accept.textContent = 'Accept quote';
      accept.addEventListener('click', async () => {
        try {
          await acceptServiceRequestQuote(request.id);
          // Accepting pays the provider from the farmer's wallet — refresh balance.
          window.dispatchEvent(new CustomEvent('fh-wallet-changed'));
          await reload();
        } catch (error) {
          setStatus('farmerServiceRequestsStatus', error.message || 'Unable to accept quote.', 'error');
        }
      });
      actions.appendChild(accept);
    }
    if (['new', 'quoted', 'accepted'].includes(request.status)) {
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'farmer-service-danger-button';
      cancel.textContent = 'Cancel';
      cancel.addEventListener('click', async () => {
        await cancelServiceRequest(request.id);
        await reload();
      });
      actions.appendChild(cancel);
    }
    const message = document.createElement('a');
    message.className = 'farmer-service-secondary-button';
    message.href = `farmer-provider-messages.html?recipientId=${encodeURIComponent(request.provider?.id || '')}&requestId=${encodeURIComponent(request.id)}`;
    message.textContent = 'Message provider';
    actions.appendChild(message);
    card.append(pill, title, copy, quote, actions);
    list.appendChild(card);
  });
}

async function initialise() {
  await requireFarmer();
  try {
    await reload();
  } catch (error) {
    setStatus('farmerServiceRequestsStatus', error.message || 'Unable to load requests.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', initialise);
