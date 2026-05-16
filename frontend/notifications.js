import { API_BASE } from './assets/js/config/api.config.js';

const ALERT_READ_SYNC_KEY = 'fh_alerts_read_sync';

// API functions for notifications
async function fetchNotifications() {
  try {
    const token = localStorage.getItem('fh_token');
    if (!token) {
      console.warn('No auth token found');
      return [];
    }

    const response = await fetch(`${API_BASE}/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.success && result.data) {
      return result.data.notifications.map(notification => ({
        id: notification._id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        time: formatTimeAgo(notification.createdAt),
        href: getNotificationHref(notification),
        read: notification.read,
        recipientId: getNotificationRecipientId(notification),
        sender: getNotificationSender(notification),
        senderRole: getNotificationSenderRole(notification),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

async function markAsRead(notificationId) {
  try {
    const token = localStorage.getItem('fh_token');
    if (!token) return false;

    const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

async function markAllAsRead() {
  try {
    const token = localStorage.getItem('fh_token');
    if (!token) return false;

    const response = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

// Helper functions
function formatTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return date.toLocaleDateString();
}

function getNotificationHref(notification) {
  switch (notification.type) {
    case 'message': {
      const sender = notification.relatedId?.sender;
      const senderId = sender?._id || sender;
      const params = new URLSearchParams();
      if (senderId) params.set('recipientId', senderId);
      if (sender?.fullName) params.set('recipientName', sender.fullName);
      if (sender?.role) params.set('recipientRole', sender.role);

      const query = params.toString();
      return query ? `messages.html?${query}` : 'messages.html';
    }
    case 'order':
      return 'product.html';
    case 'friend_request':
      return notification.relatedId?._id
        ? `profile.html?id=${notification.relatedId._id}`
        : 'profile.html';
    case 'market':
      return 'profile.html';
    default:
      return '#';
  }
}

function getNotificationSender(notification) {
  if (notification.type === 'message' && notification.relatedId?.sender?.fullName) {
    return notification.relatedId.sender.fullName;
  }

  if (notification.type === 'friend_request' && notification.relatedId?.fullName) {
    return notification.relatedId.fullName;
  }

  if (notification.user && notification.user.fullName) {
    return notification.user.fullName;
  }
  return 'FarmersHub Team';
}

function getNotificationRecipientId(notification) {
  if (notification.type !== 'message') {
    return null;
  }

  const sender = notification.relatedId?.sender;
  return sender?._id || (typeof sender === 'string' ? sender : null);
}

function getNotificationSenderRole(notification) {
  const user = notification.type === 'message' && notification.relatedId?.sender?.role
    ? notification.relatedId.sender
    : notification.type === 'friend_request' && notification.relatedId?.role
      ? notification.relatedId
      : notification.user;

  if (user && user.role) {
    return user.role === 'farmer' ? 'Farmer' : 'Customer';
  }
  return 'System';
}

let notifications = []; // Will be populated from API

const typeLabels = {
  order: 'Order',
  message: 'Message',
  market: 'Marketplace',
  system: 'System',
  friend_request: 'Friend Request',
};

// Fix before merging to main: prevents notification filtering/rendering from crashing when the backend sends an unknown type.
function getTypeLabel(type) {
  return typeLabels[type] || 'Notification';
}

const listEl = document.getElementById('notificationList');
const statusEl = document.getElementById('notificationStatus');
const searchEl = document.getElementById('notificationSearch');
const unreadCountEl = document.getElementById('unreadCount');
const orderCountEl = document.getElementById('orderCount');
const messageCountEl = document.getElementById('messageCount');
const markAllReadBtn = document.getElementById('markAllReadBtn');
const refreshBtn = document.getElementById('refreshNotificationsBtn');
const tabBtns = Array.from(document.querySelectorAll('.tab-btn'));
const loginBtn = document.getElementById('navLoginBtn');
const logoutBtn = document.getElementById('navLogoutBtn');
const replyModal = document.getElementById('replyModal');
const replyContextEl = document.getElementById('replyContext');
const replyInputEl = document.getElementById('replyInput');
const sendReplyBtn = document.getElementById('sendReplyBtn');
const cancelReplyBtn = document.getElementById('cancelReplyBtn');
const closeReplyModalBtn = document.getElementById('closeReplyModal');

let activeFilter = 'all';
let currentReplyTargetId = null;

function setupSessionNav() {
  const token = localStorage.getItem('fh_token');
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem('fh_user'));
  } catch {
    user = null;
  }

  if (!token) {
    return;
  }

  if (loginBtn) {
    loginBtn.style.display = 'none';
  }

  if (logoutBtn) {
    logoutBtn.style.display = 'inline-block';
    if (user?.fullName) {
      logoutBtn.textContent = 'Logout (' + user.fullName.split(' ')[0] + ')';
    }
    logoutBtn.addEventListener('click', () => {
      ['fh_token', 'fh_user', 'fh_loggedIn', 'fh_role', 'currentUser'].forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      window.location.reload();
    });
  }
}

function updateSummary() {
  unreadCountEl.textContent = notifications.filter((item) => !item.read).length;
  orderCountEl.textContent = notifications.filter((item) => item.type === 'order').length;
  messageCountEl.textContent = notifications.filter((item) => item.type === 'message').length;
}

function getFilteredNotifications() {
  const term = searchEl.value.trim().toLowerCase();

  return notifications.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
    const matchesSearch = !term
      || item.title.toLowerCase().includes(term)
      || item.body.toLowerCase().includes(term)
      || item.sender.toLowerCase().includes(term)
      || getTypeLabel(item.type).toLowerCase().includes(term);

    return matchesFilter && matchesSearch;
  });
}

function createNotificationCard(item) {
  const card = document.createElement('article');
  card.className = 'notification-card' + (item.read ? ' read' : '');
  card.dataset.id = item.id;

  const dot = document.createElement('span');
  dot.className = 'notification-dot';

  const content = document.createElement('div');
  content.className = 'notification-content';

  const senderRow = document.createElement('div');
  senderRow.className = 'notification-sender-row';

  const avatar = document.createElement('div');
  avatar.className = 'notification-avatar';
  avatar.textContent = item.sender ? item.sender.charAt(0) : 'F';

  const senderMeta = document.createElement('div');
  senderMeta.className = 'notification-sender-meta';

  const senderName = document.createElement('span');
  senderName.className = 'notification-sender';
  senderName.textContent = item.sender || 'FarmersHub Team';

  const senderRole = document.createElement('span');
  senderRole.className = 'notification-role';
  senderRole.textContent = item.senderRole || (item.type === 'message' ? 'Customer' : 'System');

  senderMeta.append(senderName, senderRole);
  senderRow.append(avatar, senderMeta);

  const kicker = document.createElement('span');
  kicker.className = 'notification-kicker';
  kicker.textContent = getTypeLabel(item.type);

  const title = document.createElement('h3');
  title.textContent = item.title;

  const body = document.createElement('p');
  body.textContent = item.body;

  const meta = document.createElement('div');
  meta.className = 'notification-meta';
  meta.textContent = item.time + ' • ' + (item.read ? 'Read' : 'Unread');

  content.append(senderRow, kicker, title, body);

  if (item.type === 'message') {
    const chatNote = document.createElement('div');
    chatNote.className = 'notification-chat-note';
    chatNote.textContent = 'Customer ↔ Farmer chat support';
    content.append(chatNote);
  }

  content.append(meta);

  const actions = document.createElement('div');
  actions.className = 'notification-card-actions';

  const openLink = document.createElement('a');
  openLink.className = 'open-link';
  openLink.href = item.href;
  openLink.textContent = item.type === 'message' ? 'Open chat' : 'View details';
  openLink.setAttribute('aria-label', `Open ${item.type} notification`);
  actions.append(openLink);

  if (item.type === 'message') {
    const replyBtn = document.createElement('button');
    replyBtn.type = 'button';
    replyBtn.dataset.action = 'reply';
    replyBtn.textContent = 'Reply';
    actions.append(replyBtn);

    const historyBtn = document.createElement('button');
    historyBtn.type = 'button';
    historyBtn.dataset.action = 'history';
    historyBtn.textContent = 'Message history';
    actions.append(historyBtn);
  }

  const readBtn = document.createElement('button');
  readBtn.type = 'button';
  readBtn.dataset.action = 'toggle-read';
  readBtn.textContent = item.read ? 'Read' : 'Mark read';
  readBtn.disabled = item.read;
  actions.append(readBtn);

  card.append(dot, content, actions);

  return card;
}

function renderNotifications() {
  const filtered = getFilteredNotifications();
  updateSummary();

  tabBtns.forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === activeFilter);
  });

  statusEl.textContent = filtered.length
    ? filtered.length + ' notification' + (filtered.length === 1 ? '' : 's') + ' shown'
    : 'No notifications match this view.';

  if (!filtered.length) {
    listEl.innerHTML = '<div class="empty-panel">No notifications match this view.</div>';
    return;
  }

  listEl.innerHTML = '';
  filtered.forEach((item) => {
    listEl.appendChild(createNotificationCard(item));
  });
}

function syncFloatingAlertState() {
  localStorage.setItem(ALERT_READ_SYNC_KEY, String(Date.now()));
}

function openReplyModal(item) {
  currentReplyTargetId = item.id;
  replyContextEl.textContent = `Reply to ${item.sender} (${item.senderRole})`;
  replyInputEl.value = '';
  replyModal.classList.remove('hidden');
  replyModal.setAttribute('aria-hidden', 'false');
  replyInputEl.focus();
}

function closeReplyModal() {
  currentReplyTargetId = null;
  replyModal.classList.add('hidden');
  replyModal.setAttribute('aria-hidden', 'true');
}

async function sendReply() {
  if (!currentReplyTargetId) {
    return;
  }

  const messageText = replyInputEl.value.trim();
  const item = notifications.find((notification) => notification.id === currentReplyTargetId);
  if (!item) {
    return closeReplyModal();
  }

  try {
    if (messageText && item.type === 'message' && item.recipientId) {
      const token = localStorage.getItem('fh_token');
      const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: item.recipientId,
          content: messageText,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || 'Failed to send reply.');
      }
    }

    await markAsRead(currentReplyTargetId);
    item.read = true;
    syncFloatingAlertState();
    statusEl.textContent = messageText
      ? `Reply sent to ${item.sender}.`
      : `Closed reply to ${item.sender}.`;
    closeReplyModal();
    renderNotifications();
  } catch (error) {
    statusEl.textContent = error.message || 'Failed to send reply.';
  }
}

async function showHistory(item) {
  statusEl.textContent = `Showing message history for ${item.sender}.`;
  await markAsRead(item.id);
  item.read = true;
  syncFloatingAlertState();
  renderNotifications();
  window.location.href = item.href || 'messages.html';
}

async function pollForNewNotifications() {
  setInterval(async () => {
    const freshNotifications = await fetchNotifications();
    const hasNewNotifications = freshNotifications.length > notifications.length ||
      freshNotifications.some((newNotif, index) => {
        const oldNotif = notifications[index];
        return !oldNotif || newNotif.id !== oldNotif.id;
      });

    if (hasNewNotifications) {
      notifications = freshNotifications;
      statusEl.textContent = 'New notifications available.';
      renderNotifications();
    }
  }, 30000); // Poll every 30 seconds
}

async function handleNotificationListClick(event) {
  const toggleBtn = event.target.closest('button[data-action="toggle-read"]');
  if (toggleBtn) {
    const card = toggleBtn.closest('.notification-card');
    const notificationId = card.dataset.id;
    const success = await markAsRead(notificationId);
    if (success) {
      // Update local state
      const item = notifications.find(n => n.id === notificationId);
      if (item) {
        item.read = true;
        syncFloatingAlertState();
        renderNotifications();
      }
    }
    return;
  }

  const replyBtn = event.target.closest('button[data-action="reply"]');
  if (replyBtn) {
    const card = replyBtn.closest('.notification-card');
    const item = notifications.find(n => n.id === card.dataset.id);
    if (item) {
      openReplyModal(item);
    }
    return;
  }

  const historyBtn = event.target.closest('button[data-action="history"]');
  if (historyBtn) {
    const card = historyBtn.closest('.notification-card');
    const item = notifications.find(n => n.id === card.dataset.id);
    if (item) {
      showHistory(item);
    }
    return;
  }

  const openLink = event.target.closest('a.open-link');
  if (openLink) {
    event.preventDefault();
    const card = openLink.closest('.notification-card');
    const item = notifications.find(n => n.id === card?.dataset.id);
    if (item && !item.read) {
      await markAsRead(item.id);
      item.read = true;
      syncFloatingAlertState();
    }
    window.location.href = openLink.href;
  }
}

tabBtns.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    renderNotifications();
  });
});

searchEl.addEventListener('input', renderNotifications);
listEl.addEventListener('click', handleNotificationListClick);
sendReplyBtn.addEventListener('click', sendReply);
cancelReplyBtn.addEventListener('click', closeReplyModal);
closeReplyModalBtn.addEventListener('click', closeReplyModal);
replyModal.addEventListener('click', (event) => {
  if (event.target === replyModal) {
    closeReplyModal();
  }
});

markAllReadBtn.addEventListener('click', async () => {
  const success = await markAllAsRead();
  if (success) {
    notifications.forEach((item) => {
      item.read = true;
    });
    syncFloatingAlertState();
    renderNotifications();
  }
});

refreshBtn.addEventListener('click', async () => {
  statusEl.textContent = 'Refreshing notifications...';
  const freshNotifications = await fetchNotifications();
  notifications = freshNotifications;
  statusEl.textContent = 'Notifications refreshed just now.';
  renderNotifications();
});

async function initializeNotifications() {
  notifications = await fetchNotifications();
  renderNotifications();
}

setupSessionNav();
initializeNotifications();
pollForNewNotifications();
