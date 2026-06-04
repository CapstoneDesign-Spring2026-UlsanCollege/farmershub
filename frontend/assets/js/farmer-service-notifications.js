import { apiFetch, jsonHeaders } from './config/api.config.js';
import { requireFarmer, clearElement, createStateCard, formatDate, setStatus } from './farmer-services-shell.js';

function renderNotification(container, item) {
  const card = document.createElement('article');
  card.className = 'farmer-service-card';
  const title = document.createElement('h3');
  title.textContent = item.title || 'Notification';
  const body = document.createElement('p');
  body.textContent = item.body || '';
  const meta = document.createElement('p');
  meta.textContent = `${item.type || 'system'} - ${formatDate(item.createdAt)}${item.read ? ' - Read' : ' - Unread'}`;
  const actions = document.createElement('div');
  actions.className = 'farmer-service-card-actions';
  if (item.relatedModel === 'FarmServiceRequest' && item.relatedId?._id) {
    const link = document.createElement('a');
    link.className = 'farmer-service-secondary-button';
    link.href = `farmer-service-request.html?id=${encodeURIComponent(item.relatedId._id)}`;
    link.textContent = 'Open request';
    actions.appendChild(link);
  }
  card.append(title, body, meta, actions);
  container.appendChild(card);
}

async function initialise() {
  await requireFarmer();
  const list = document.getElementById('farmerServiceNotificationsList');
  try {
    const response = await apiFetch('/notifications?limit=50', { headers: jsonHeaders() });
    const notifications = response.data?.notifications || [];
    clearElement(list);
    const serviceNotifications = notifications.filter((item) => ['service_request', 'message', 'system'].includes(item.type));
    if (!serviceNotifications.length) {
      list.appendChild(createStateCard('No service notifications yet', 'Provider quotes, request updates, and service messages will appear here.'));
      return;
    }
    serviceNotifications.forEach((item) => renderNotification(list, item));
  } catch (error) {
    setStatus('farmerServiceNotificationsStatus', error.message || 'Unable to load notifications.', 'error');
  }

  document.getElementById('farmerMarkServiceNotificationsRead')?.addEventListener('click', async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'PUT', headers: jsonHeaders() });
      setStatus('farmerServiceNotificationsStatus', 'Notifications marked as read.');
    } catch (error) {
      setStatus('farmerServiceNotificationsStatus', error.message || 'Unable to update notifications.', 'error');
    }
  });
}

document.addEventListener('DOMContentLoaded', initialise);
