import './assets/js/notification-float.js';
import { API_BASE, apiFetch, authHeader, getToken, jsonHeaders } from './assets/js/config/api.config.js';

const conversations = [];
let activeFilter = 'all';
let selectedFiles = [];
let recipients = [];
const markingRead = new Set();

const listEl = document.getElementById('conversationList');
const headerEl = document.getElementById('chatHeader');
const threadEl = document.getElementById('messageThread');
const contextEl = document.getElementById('messageContext');
const searchEl = document.getElementById('conversationSearch');
const composerEl = document.getElementById('messageComposer');
const inputEl = document.getElementById('messageInput');
const attachmentBtn = document.getElementById('attachmentBtn');
const attachmentInput = document.getElementById('attachmentInput');
const selectedAttachmentsEl = document.getElementById('selectedAttachments');
const newConversationBtn = document.getElementById('newConversationBtn');
const recipientDialog = document.getElementById('recipientDialog');
const recipientSearch = document.getElementById('recipientSearch');
const recipientList = document.getElementById('recipientList');
const loginBtn = document.getElementById('navLoginBtn');
const logoutBtn = document.getElementById('navLogoutBtn');

function getRequestedConversation() {
  const params = new URLSearchParams(window.location.search);
  const recipientId = params.get('recipientId');

  if (!recipientId) {
    return null;
  }

  return {
    id: `profile-${recipientId}`,
    recipientId,
    name: params.get('recipientName') || 'FarmersHub member',
    role: params.get('recipientRole') || 'Profile contact',
    productId: params.get('productId') || '',
    time: 'New',
    unread: 0,
    hasContext: Boolean(params.get('productId')),
    messages: [],
  };
}

const requestedConversation = getRequestedConversation();
if (requestedConversation && !conversations.some((conversation) => conversation.id === requestedConversation.id)) {
  conversations.unshift(requestedConversation);
}

let activeId = requestedConversation?.id || conversations[0]?.id || null;

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('fh_user')) || JSON.parse(localStorage.getItem('farmershub_user')) || null;
  } catch {
    return null;
  }
}

function setupSessionNav() {
  const token = getToken();
  const user = getStoredUser();

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

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function getActiveConversation() {
  return conversations.find((conversation) => conversation.id === activeId);
}

function lastMessage(conversation) {
  const last = conversation.messages[conversation.messages.length - 1];
  return last?.text || (last?.attachments?.length ? `${last.attachments.length} attachment${last.attachments.length === 1 ? '' : 's'}` : 'No messages yet');
}

function renderConversationList() {
  const term = searchEl.value.trim().toLowerCase();
  const filtered = conversations.filter((conversation) => {
    const matchesFilter = activeFilter === 'all'
      || (activeFilter === 'unread' && conversation.unread > 0)
      || (activeFilter === 'context' && conversation.hasContext);
    return matchesFilter && (conversation.name.toLowerCase().includes(term)
      || conversation.role.toLowerCase().includes(term)
      || lastMessage(conversation).toLowerCase().includes(term));
  });

  if (!filtered.length) {
    listEl.innerHTML = term
      ? '<p class="empty-message">No conversations match your search.</p>'
      : `<p class="empty-message">${activeFilter === 'context' ? 'No conversations with real product or service context.' : activeFilter === 'unread' ? 'No unread conversations.' : 'No conversations yet.'}</p>`;
    return;
  }

  listEl.innerHTML = '';
  filtered.forEach((conversation) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'conversation-card' + (conversation.id === activeId ? ' active' : '');
    button.dataset.id = conversation.id;

    const avatar = document.createElement('span');
    avatar.className = 'conversation-avatar';
    avatar.textContent = initials(conversation.name);

    const main = document.createElement('span');
    main.className = 'conversation-main';

    const name = document.createElement('span');
    name.className = 'conversation-name';
    name.textContent = conversation.name;

    const preview = document.createElement('span');
    preview.className = 'conversation-preview';
    preview.textContent = lastMessage(conversation);

    const time = document.createElement('span');
    time.className = 'conversation-time';
    time.textContent = conversation.time;

    main.append(name, preview);
    button.append(avatar, main, time);

    if (conversation.unread) {
      const badge = document.createElement('span');
      badge.className = 'unread-badge';
      badge.textContent = conversation.unread;
      button.appendChild(badge);
    }

    listEl.appendChild(button);
  });
}

function formatMessageTime(value) {
  if (!value) return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function normalizeConversation(item) {
  const currentUser = getStoredUser();
  const currentUserId = String(currentUser?.id || currentUser?._id || '');
  const user = item.user || {};
  const recipientId = String(user._id || user.id || '');
  const messages = Array.isArray(item.messages) ? item.messages : [];

  return {
    id: `profile-${recipientId || item.id || Date.now()}`,
    recipientId,
    name: user.fullName || 'FarmersHub member',
    role: user.role || 'Direct message',
    time: formatMessageTime(item.lastMessage?.createdAt || messages[0]?.createdAt),
    unread: Number(item.unreadCount || 0),
    hasContext: messages.some((message) => message.relatedProduct || message.relatedServiceRequest),
    messages: messages
      .slice()
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
      .map((message) => {
        const senderId = String(message.sender?._id || message.sender || '');
        return {
          id: message._id || message.id,
          from: senderId && currentUserId && senderId === currentUserId ? 'me' : 'them',
          text: message.content || '',
          time: formatMessageTime(message.createdAt),
          isRead: Boolean(message.isRead),
          attachments: Array.isArray(message.attachments) ? message.attachments : [],
          relatedProduct: message.relatedProduct || '',
          relatedServiceRequest: message.relatedServiceRequest || '',
        };
      }),
  };
}

function upsertConversation(conversation) {
  const index = conversations.findIndex((item) => item.id === conversation.id);
  if (index === -1) {
    conversations.push(conversation);
    return;
  }

  const existing = conversations[index];
  conversations[index] = {
    ...existing,
    ...conversation,
    productId: conversation.productId || existing.productId,
    hasContext: Boolean(conversation.hasContext || existing.hasContext),
  };
}

async function loadConversations() {
  if (!getToken()) {
    listEl.innerHTML = '<p class="empty-message">Log in to view your messages.</p>';
    threadEl.innerHTML = '<p class="empty-message">Open your account first, then you can message farmers and customers.</p>';
    composerEl.hidden = true;
    return;
  }

  try {
    const response = await apiFetch('/messages', {
      method: 'GET',
      headers: jsonHeaders(),
    });

    (response.data || []).map(normalizeConversation).forEach(upsertConversation);

    if (!activeId && conversations.length) {
      activeId = conversations[0].id;
    }

    renderConversationList();
    renderChat();
    markActiveConversationRead();
  } catch (error) {
    listEl.innerHTML = '<p class="empty-message">Unable to load conversations.</p>';
    threadEl.innerHTML = `<p class="empty-message">${error.message || 'Please try again later.'}</p>`;
    composerEl.hidden = true;
  }
}

function attachmentUrl(value) {
  const raw = String(value || '');
  if (!raw.startsWith('/uploads/')) return '';
  return new URL(raw, API_BASE).href;
}

function appendAttachments(container, attachments = []) {
  if (!attachments.length) return;
  const list = document.createElement('div');
  list.className = 'message-attachments';

  attachments.forEach((attachment) => {
    const url = attachmentUrl(attachment.url);
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = attachment.originalName || attachment.filename || 'Open attachment';

    if (String(attachment.mimeType || '').startsWith('image/')) {
      const image = document.createElement('img');
      image.src = url;
      image.alt = attachment.originalName || 'Message attachment';
      link.prepend(image);
    }
    list.appendChild(link);
  });

  if (list.childElementCount) container.appendChild(list);
}

async function markActiveConversationRead() {
  const conversation = getActiveConversation();
  if (!conversation || !getToken()) return;

  const unread = conversation.messages.filter((message) => (
    message.from === 'them' && !message.isRead && message.id && !markingRead.has(String(message.id))
  ));
  if (!unread.length) return;

  unread.forEach((message) => markingRead.add(String(message.id)));
  await Promise.all(unread.map(async (message) => {
    try {
      await apiFetch(`/messages/${encodeURIComponent(message.id)}/read`, {
        method: 'PUT',
        headers: jsonHeaders(),
      });
      message.isRead = true;
    } catch {
      // Leave unread so a later open can retry.
    } finally {
      markingRead.delete(String(message.id));
    }
  }));
  conversation.unread = conversation.messages.filter((message) => message.from === 'them' && !message.isRead).length;
  renderConversationList();
}

function renderChat() {
  const conversation = getActiveConversation();

  if (!conversation) {
    headerEl.innerHTML = '';
    threadEl.innerHTML = '<p class="empty-message">Choose a conversation to start messaging.</p>';
    composerEl.hidden = true;
    return;
  }

  composerEl.hidden = false;
  headerEl.innerHTML = '';

  const avatar = document.createElement('span');
  avatar.className = 'chat-avatar';
  avatar.textContent = initials(conversation.name);

  const title = document.createElement('span');
  title.className = 'chat-title';

  const heading = document.createElement('h3');
  heading.textContent = conversation.name;

  const role = document.createElement('p');
  role.textContent = conversation.role;

  title.append(heading, role);
  headerEl.append(avatar, title);

  const contextMessage = conversation.messages.find((message) => message.relatedProduct || message.relatedServiceRequest);
  contextEl.querySelector('p').textContent = contextMessage
    ? 'This conversation includes real product or service-request context.'
    : 'No product, order, or service-request context is attached to this conversation.';

  threadEl.innerHTML = '';
  if (!conversation.messages.length) {
    threadEl.innerHTML = '<p class="empty-message">Start the conversation with a message.</p>';
    return;
  }

  conversation.messages.forEach((message) => {
    const row = document.createElement('div');
    row.className = 'message-row' + (message.from === 'me' ? ' mine' : '');

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    if (message.text) {
      const text = document.createElement('p');
      text.textContent = message.text;
      bubble.appendChild(text);
    }

    appendAttachments(bubble, message.attachments);

    const time = document.createElement('time');
    time.textContent = message.time;

    bubble.appendChild(time);
    row.appendChild(bubble);
    threadEl.appendChild(row);
  });
  threadEl.scrollTop = threadEl.scrollHeight;
}

function setActiveConversation(id) {
  activeId = id;
  renderChat();
  renderConversationList();
  markActiveConversationRead();
}

listEl.addEventListener('click', (event) => {
  const card = event.target.closest('.conversation-card');
  if (!card) {
    return;
  }
  setActiveConversation(card.dataset.id);
});

searchEl.addEventListener('input', renderConversationList);

document.querySelector('.conversation-tabs')?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-filter]');
  if (!button) return;
  activeFilter = button.dataset.filter;
  document.querySelectorAll('.conversation-tabs button').forEach((item) => {
    item.classList.toggle('active', item === button);
  });
  renderConversationList();
});

function renderSelectedFiles() {
  selectedAttachmentsEl.textContent = selectedFiles.length
    ? selectedFiles.map((file) => file.name).join(', ')
    : '';
}

attachmentBtn?.addEventListener('click', () => attachmentInput?.click());
attachmentInput?.addEventListener('change', () => {
  selectedFiles = Array.from(attachmentInput.files || []).slice(0, 5);
  if ((attachmentInput.files || []).length > 5) alert('You can attach at most 5 files.');
  renderSelectedFiles();
});

function renderRecipientList() {
  const term = String(recipientSearch?.value || '').trim().toLowerCase();
  recipientList.innerHTML = '';
  const filtered = recipients.filter((user) => (
    `${user.fullName || ''} ${user.role || ''}`.toLowerCase().includes(term)
  ));
  if (!filtered.length) {
    recipientList.innerHTML = '<p class="empty-message">No matching recipients found.</p>';
    return;
  }

  filtered.forEach((user) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'recipient-card';
    button.dataset.id = user.id || user._id;
    const name = document.createElement('strong');
    name.textContent = user.fullName || 'FarmersHub member';
    const role = document.createElement('span');
    role.textContent = user.role || 'Member';
    button.append(name, role);
    recipientList.appendChild(button);
  });
}

async function openRecipientDialog() {
  if (!getToken()) {
    recipientList.innerHTML = '<p class="empty-message">Log in before starting a conversation.</p>';
    recipientDialog.showModal();
    return;
  }

  recipientList.innerHTML = '<p class="empty-message">Loading recipients...</p>';
  recipientDialog.showModal();
  try {
    const role = getStoredUser()?.role;
    const paths = role === 'customer'
      ? ['/users/farmers']
      : role === 'farmer'
        ? ['/users/customers']
        : ['/users/farmers', '/users/customers'];
    const responses = await Promise.all(paths.map((path) => apiFetch(path)));
    const currentId = String(getStoredUser()?.id || getStoredUser()?._id || '');
    recipients = responses.flatMap((response) => response.data || [])
      .filter((user) => String(user.id || user._id) !== currentId);
    renderRecipientList();
  } catch (error) {
    recipientList.innerHTML = '';
    const message = document.createElement('p');
    message.className = 'empty-message';
    message.textContent = error.message || 'Unable to load recipients.';
    recipientList.appendChild(message);
  }
}

newConversationBtn?.addEventListener('click', openRecipientDialog);
recipientSearch?.addEventListener('input', renderRecipientList);
recipientList?.addEventListener('click', (event) => {
  const card = event.target.closest('.recipient-card');
  if (!card) return;
  const user = recipients.find((item) => String(item.id || item._id) === card.dataset.id);
  if (!user) return;
  const conversation = {
    id: `profile-${card.dataset.id}`,
    recipientId: card.dataset.id,
    name: user.fullName || 'FarmersHub member',
    role: user.role || 'Member',
    time: 'New',
    unread: 0,
    hasContext: false,
    messages: [],
  };
  const existing = conversations.find((item) => item.id === conversation.id);
  if (!existing) upsertConversation(conversation);
  activeId = conversation.id;
  recipientDialog.close();
  renderConversationList();
  renderChat();
  inputEl.focus();
});

composerEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = inputEl.value.trim();
  const conversation = getActiveConversation();

  if ((!text && !selectedFiles.length) || !conversation) {
    return;
  }

  inputEl.disabled = true;

  try {
    if (conversation.recipientId) {
      let response;
      if (selectedFiles.length) {
        const body = new FormData();
        body.append('receiverId', conversation.recipientId);
        if (text) body.append('content', text);
        if (conversation.productId) body.append('relatedProduct', conversation.productId);
        selectedFiles.forEach((file) => body.append('attachments', file));
        response = await apiFetch('/messages', {
          method: 'POST',
          headers: authHeader(),
          body,
        });
      } else {
        response = await apiFetch('/messages', {
          method: 'POST',
          headers: jsonHeaders(),
          body: JSON.stringify({
            receiverId: conversation.recipientId,
            content: text,
            ...(conversation.productId ? { relatedProduct: conversation.productId } : {}),
          }),
        });
      }
      const savedMessage = response.data || {};
      conversation.messages.push({
        id: savedMessage._id || savedMessage.id,
        from: 'me',
        text: savedMessage.content || text,
        isRead: Boolean(savedMessage.isRead),
        attachments: Array.isArray(savedMessage.attachments) ? savedMessage.attachments : [],
        time: savedMessage.createdAt
          ? new Date(savedMessage.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
          : new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      });
    } else {
      conversation.messages.push({
        from: 'me',
        text,
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      });
    }

    conversation.time = 'Now';
    inputEl.value = '';
    selectedFiles = [];
    attachmentInput.value = '';
    renderSelectedFiles();
    renderChat();
    renderConversationList();
  } catch (error) {
    alert(error.message || 'Failed to send message.');
  } finally {
    inputEl.disabled = false;
    inputEl.focus();
  }
});

setupSessionNav();
renderConversationList();
renderChat();
loadConversations();
