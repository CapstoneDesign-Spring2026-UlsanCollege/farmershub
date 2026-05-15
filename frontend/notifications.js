const notifications = [
  {
    id: 'order-spinach',
    type: 'order',
    title: 'New order request',
    body: 'Maya Green Farm received a request for two crates of spinach for pickup today.',
    time: '8 minutes ago',
    href: 'product.html',
    read: false,
    sender: 'Maya Green Farm',
    senderRole: 'Customer',
  },
  {
    id: 'message-berry',
    type: 'message',
    title: 'New message from Ulsan Berry Co-op',
    body: 'The strawberry boxes are packed and ready for pickup between 3 PM and 5 PM.',
    time: '24 minutes ago',
    href: 'messages.html',
    read: false,
    sender: 'Ulsan Berry Co-op',
    senderRole: 'Customer',
  },
  {
    id: 'profile-live',
    type: 'market',
    title: 'Profile is visible to buyers',
    body: 'Your farmer profile is now appearing in FarmersHub search and nearby recommendations.',
    time: 'Today',
    href: 'profile.html',
    read: true,
    sender: 'FarmersHub Team',
    senderRole: 'System',
  },
  {
    id: 'listing-trending',
    type: 'market',
    title: 'Tomato listing is getting attention',
    body: 'Your tomato listing was viewed more than usual this week. Consider updating quantity if stock changed.',
    time: 'Yesterday',
    href: 'product.html',
    read: false,
    sender: 'Marketplace Insights',
    senderRole: 'System',
  },
  {
    id: 'order-rice',
    type: 'order',
    title: 'Order marked complete',
    body: 'The brown rice order was marked complete. Payment and review details are ready.',
    time: 'Mon',
    href: 'product.html',
    read: true,
    sender: 'Harvest Logistics',
    senderRole: 'Customer',
  },
];

const typeLabels = {
  order: 'Order',
  message: 'Message',
  market: 'Marketplace',
};

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
      || (item.sender || '').toLowerCase().includes(term)
      || (typeLabels[item.type] || '').toLowerCase().includes(term);

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
  kicker.textContent = typeLabels[item.type];

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
  readBtn.textContent = item.read ? 'Mark unread' : 'Mark read';
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

function openMessagePage(item) {
  item.read = true;
  renderNotifications();
  window.location.href = item.href || 'messages.html';
}

function sendReply() {
  const item = notifications.find((notification) => notification.id === currentReplyTargetId);
  if (!item) {
    return closeReplyModal();
  }

  closeReplyModal();
  openMessagePage(item);
}

function showHistory(item) {
  openMessagePage(item);
}

function handleNotificationListClick(event) {
  const toggleBtn = event.target.closest('button[data-action="toggle-read"]');
  if (toggleBtn) {
    const card = toggleBtn.closest('.notification-card');
    const item = notifications.find((notification) => notification.id === card.dataset.id);
    if (item) {
      item.read = !item.read;
      renderNotifications();
    }
    return;
  }

  const replyBtn = event.target.closest('button[data-action="reply"]');
  if (replyBtn) {
    const card = replyBtn.closest('.notification-card');
    const item = notifications.find((notification) => notification.id === card.dataset.id);
    if (item) {
      openReplyModal(item);
    }
    return;
  }

  const historyBtn = event.target.closest('button[data-action="history"]');
  if (historyBtn) {
    const card = historyBtn.closest('.notification-card');
    const item = notifications.find((notification) => notification.id === card.dataset.id);
    if (item) {
      showHistory(item);
    }
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

markAllReadBtn.addEventListener('click', () => {
  notifications.forEach((item) => {
    item.read = true;
  });
  renderNotifications();
});

refreshBtn.addEventListener('click', () => {
  statusEl.textContent = 'Notifications refreshed just now.';
  window.setTimeout(renderNotifications, 700);
});

setupSessionNav();
renderNotifications();
