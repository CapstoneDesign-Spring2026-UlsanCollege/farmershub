import { apiFetch, jsonHeaders } from './config/api.config.js';
import { requireProvider, clearElement, createStateCard, formatDate, setStatus } from './provider-shell.js';

function renderNotification(container, item) {
  const card = document.createElement('article');
  card.className = 'provider-card';
  const title = document.createElement('h3');
  title.textContent = item.title || 'Notification';
  const body = document.createElement('p');
  body.textContent = item.body || '';
  const meta = document.createElement('p');
  meta.textContent = `${item.type || 'system'} - ${formatDate(item.createdAt)}${item.read ? ' - Read' : ' - Unread'}`;
  const actions = document.createElement('div');
  actions.className = 'provider-actions';
  if (item.relatedModel === 'FarmServiceRequest' && item.relatedId?._id) {
    const link = document.createElement('a');
    link.className = 'provider-secondary-button';
    link.href = `provider-request-detail.html?id=${encodeURIComponent(item.relatedId._id)}`;
    link.textContent = 'Open request';
    actions.appendChild(link);
  }
  card.append(title, body, meta, actions);
  container.appendChild(card);
}

async function initialise() {
  await requireProvider();
  const list = document.getElementById('providerNotificationsList');
  try {
    const response = await apiFetch('/notifications?limit=50', { headers: jsonHeaders() });
    const notifications = response.data?.notifications || [];
    clearElement(list);
    if (!notifications.length) {
      list.appendChild(createStateCard('No notifications yet', 'Request, quote, and message updates will appear here.'));
      return;
    }
    notifications
      .filter((item) => ['service_request', 'message', 'system'].includes(item.type))
      .forEach((item) => renderNotification(list, item));
  } catch (error) {
    setStatus('providerNotificationsStatus', error.message || 'Unable to load notifications.', 'error');
  }

  document.getElementById('providerMarkNotificationsRead')?.addEventListener('click', async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'PUT', headers: jsonHeaders() });
      setStatus('providerNotificationsStatus', 'Notifications marked as read.');
    } catch (error) {
      setStatus('providerNotificationsStatus', error.message || 'Unable to update notifications.', 'error');
    }
  });
}

document.addEventListener('DOMContentLoaded', initialise);
