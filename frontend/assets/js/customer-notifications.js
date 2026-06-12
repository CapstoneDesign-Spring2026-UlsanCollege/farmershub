import { apiFetch, jsonHeaders } from './config/api.config.js';
import {
  hydrateNotificationSoundSelect,
  playNotificationSound,
  saveNotificationSoundPreference,
  syncNotificationSoundFromBackend,
} from './notification-sounds.js';
import {
  customerMessageUrl,
  formatDate,
  getToken,
  hydrateCustomerShell,
  setStatus,
} from './customer-shell.js';

let notifications = [];
let activeFilter = 'all';

const listEl = document.getElementById('notificationList');
const statusEl = document.getElementById('notificationStatus');
const searchForm = document.getElementById('notificationSearchForm');
const searchEl = document.getElementById('notificationSearch');
const unreadCountEl = document.getElementById('notificationUnreadCount');
const messageCountEl = document.getElementById('notificationMessageCount');
const orderCountEl = document.getElementById('notificationOrderCount');
const refreshBtn = document.getElementById('refreshNotificationsBtn');
const markAllReadBtn = document.getElementById('markAllReadBtn');
const soundSelectEl = document.getElementById('notificationSoundSelect');
const previewSoundBtn = document.getElementById('previewNotificationSoundBtn');
const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));

function normalizeNotification(item = {}) {
  const related = item.relatedId || {};
  const sender = related.sender || item.sender || item.user || {};
  const senderId = sender._id || sender.id || (typeof sender === 'string' ? sender : '');
  const senderName = sender.fullName || item.senderName || 'FarmersHub';
  const senderRole = sender.role || item.senderRole || '';

  return {
    id: item._id || item.id || '',
    type: item.type || 'system',
    title: item.title || 'Notification',
    body: item.body || '',
    read: Boolean(item.read),
    createdAt: item.createdAt,
    senderId,
    senderName,
    senderRole,
    relatedId: related._id || related.id || (typeof related === 'string' ? related : ''),
  };
}

function notificationHref(item) {
  if (item.type === 'message') {
    return customerMessageUrl({
      recipientId: item.senderId,
      recipientName: item.senderName,
      recipientRole: item.senderRole || 'farmer',
    });
  }

  if (item.type === 'order') {
    return 'customer-orders.html';
  }

  if (item.type === 'market') {
    return 'customer-marketplace.html';
  }

  return 'customer-notifications.html';
}

function typeLabel(type) {
  const labels = {
    message: 'Message',
    order: 'Order',
    market: 'Marketplace',
    system: 'System',
    friend_request: 'Connection',
  };
  return labels[type] || 'Notification';
}

function matchesFilters(item) {
  const term = String(searchEl?.value || '').trim().toLowerCase();
  const filterMatch = activeFilter === 'all' || item.type === activeFilter;
  if (!term) return filterMatch;
  return filterMatch && [
    item.title,
    item.body,
    item.senderName,
    typeLabel(item.type),
  ].join(' ').toLowerCase().includes(term);
}

function updateSummary() {
  unreadCountEl.textContent = String(notifications.filter((item) => !item.read).length);
  messageCountEl.textContent = String(notifications.filter((item) => item.type === 'message').length);
  orderCountEl.textContent = String(notifications.filter((item) => item.type === 'order').length);
  markAllReadBtn.disabled = !notifications.some((item) => !item.read);
}

function renderEmpty(message) {
  listEl.innerHTML = '';
  const empty = document.createElement('div');
  empty.className = 'customer-state customer-empty';
  const title = document.createElement('strong');
  title.textContent = 'No customer notifications connected yet';
  const copy = document.createElement('p');
  copy.textContent = message || 'Marketplace and order notification support will appear here after customer notification integration is connected.';
  empty.append(title, copy);
  listEl.appendChild(empty);
}

function renderNotifications() {
  hydrateCustomerShell();
  updateSummary();
  filterButtons.forEach((button) => {
    const active = button.dataset.filter === activeFilter;
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  const visible = notifications.filter(matchesFilters);
  setStatus(statusEl, visible.length ? `${visible.length} notification${visible.length === 1 ? '' : 's'} shown.` : 'No notifications match this view.');

  if (!visible.length) {
    renderEmpty(notifications.length ? 'No notifications match the selected filter or search.' : '');
    return;
  }

  listEl.innerHTML = '';
  visible.forEach((item) => {
    const card = document.createElement('article');
    card.className = `customer-card notification-card${item.read ? ' is-read' : ''}`;
    card.dataset.id = item.id;

    const dot = document.createElement('span');
    dot.className = 'notification-dot';
    dot.setAttribute('aria-hidden', 'true');

    const content = document.createElement('div');
    content.className = 'notification-content';
    const pill = document.createElement('span');
    pill.className = 'customer-pill';
    pill.textContent = typeLabel(item.type);
    const title = document.createElement('h2');
    title.textContent = item.title;
    const body = document.createElement('p');
    body.textContent = item.body || 'No details were returned for this notification.';
    const meta = document.createElement('div');
    meta.className = 'notification-meta';
    meta.textContent = `${formatDate(item.createdAt)} | ${item.read ? 'Read' : 'Unread'}`;
    content.append(pill, title, body, meta);

    const actions = document.createElement('div');
    actions.className = 'notification-card-actions';
    const open = document.createElement('a');
    open.className = 'customer-secondary-button';
    open.href = notificationHref(item);
    open.dataset.action = 'open';
    open.textContent = item.type === 'message' ? 'Open message' : 'Open';
    actions.appendChild(open);

    const read = document.createElement('button');
    read.type = 'button';
    read.className = 'customer-secondary-button';
    read.dataset.action = 'read';
    read.disabled = item.read || !item.id;
    read.textContent = item.read ? 'Read' : 'Mark read';
    actions.appendChild(read);

    card.append(dot, content, actions);
    listEl.appendChild(card);
  });
}

async function fetchNotifications() {
  if (!getToken()) {
    notifications = [];
    updateSummary();
    renderEmpty('Log in to load real customer notifications.');
    setStatus(statusEl, 'Log in to load notifications.');
    return;
  }

  setStatus(statusEl, 'Loading notifications...');
  try {
    const response = await apiFetch('/notifications?limit=50', {
      method: 'GET',
      headers: jsonHeaders(),
    });
    notifications = (response.data?.notifications || []).map(normalizeNotification);
    renderNotifications();
  } catch (error) {
    notifications = [];
    updateSummary();
    renderEmpty(error.message || 'Unable to load notifications right now.');
    setStatus(statusEl, error.message || 'Unable to load notifications.', 'error');
  }
}

async function markNotificationRead(id) {
  if (!id || !getToken()) return false;
  await apiFetch(`/notifications/${id}/read`, {
    method: 'PUT',
    headers: jsonHeaders(),
  });
  const item = notifications.find((notification) => notification.id === id);
  if (item) item.read = true;
  return true;
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    renderNotifications();
  });
});

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  renderNotifications();
});
searchEl?.addEventListener('input', renderNotifications);

listEl.addEventListener('click', async (event) => {
  const readButton = event.target.closest('button[data-action="read"]');
  if (readButton) {
    const card = readButton.closest('.notification-card');
    try {
      await markNotificationRead(card?.dataset.id);
      renderNotifications();
      setStatus(statusEl, 'Notification marked read.', 'success');
    } catch (error) {
      setStatus(statusEl, error.message || 'Unable to mark notification read.', 'error');
    }
    return;
  }

  const openLink = event.target.closest('a[data-action="open"]');
  if (openLink) {
    const card = openLink.closest('.notification-card');
    const id = card?.dataset.id;
    if (id) {
      event.preventDefault();
      try {
        await markNotificationRead(id);
      } catch {
        // Navigation should still work even if read sync fails.
      }
      window.location.href = openLink.href;
    }
  }
});

markAllReadBtn?.addEventListener('click', async () => {
  if (!getToken()) {
    setStatus(statusEl, 'Log in before marking notifications read.', 'error');
    return;
  }
  try {
    await apiFetch('/notifications/read-all', {
      method: 'PUT',
      headers: jsonHeaders(),
    });
    notifications.forEach((item) => {
      item.read = true;
    });
    renderNotifications();
    setStatus(statusEl, 'All notifications marked read.', 'success');
  } catch (error) {
    setStatus(statusEl, error.message || 'Unable to mark all notifications read.', 'error');
  }
});

refreshBtn?.addEventListener('click', fetchNotifications);

if (soundSelectEl) {
  hydrateNotificationSoundSelect(soundSelectEl);
  syncNotificationSoundFromBackend(soundSelectEl);
  soundSelectEl.addEventListener('change', () => {
    const selected = saveNotificationSoundPreference(soundSelectEl.value);
    soundSelectEl.value = selected;
    playNotificationSound(selected);
  });
}

previewSoundBtn?.addEventListener('click', () => {
  playNotificationSound(soundSelectEl?.value);
});

hydrateCustomerShell();
fetchNotifications();
