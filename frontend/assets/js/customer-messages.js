import { API_BASE, apiFetch, authHeader, jsonHeaders } from './config/api.config.js';
import {
  getInitials,
  getStoredUser,
  getToken,
  getUserId,
  hydrateCustomerShell,
  setStatus,
} from './customer-shell.js';

const conversations = [];
let activeFilter = 'all';
let selectedFiles = [];
let recipients = [];
const markingRead = new Set();
const listEl = document.getElementById('conversationList');
const headerEl = document.getElementById('chatHeader');
const contextEl = document.getElementById('messageContext');
const threadEl = document.getElementById('messageThread');
const searchForm = document.getElementById('messageSearchForm');
const searchEl = document.getElementById('conversationSearch');
const composerEl = document.getElementById('messageComposer');
const inputEl = document.getElementById('messageInput');
const statusEl = document.getElementById('messageStatus');
const attachmentBtn = document.getElementById('attachmentBtn');
const attachmentInput = document.getElementById('attachmentInput');
const selectedAttachmentsEl = document.getElementById('selectedAttachments');
const newConversationBtn = document.getElementById('newConversationBtn');
const recipientDialog = document.getElementById('recipientDialog');
const recipientSearch = document.getElementById('recipientSearch');
const recipientList = document.getElementById('recipientList');

const params = new URLSearchParams(window.location.search);
let activeId = null;

function formatMessageTime(value) {
  if (!value) return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function getRequestedConversation() {
  const recipientId = params.get('recipientId');
  if (!recipientId) return null;

  return {
    id: `customer-${recipientId}`,
    recipientId,
    name: params.get('recipientName') || 'FarmersHub seller',
    role: params.get('recipientRole') || 'Farmer',
    productId: params.get('productId') || '',
    productName: params.get('productName') || '',
    messages: [],
    lastTime: 'New',
    unread: 0,
    hasContext: Boolean(params.get('productId')),
  };
}

function upsertConversation(conversation, prepend = false) {
  const index = conversations.findIndex((item) => item.id === conversation.id);
  if (index === -1) {
    if (prepend) {
      conversations.unshift(conversation);
    } else {
      conversations.push(conversation);
    }
    return;
  }
  const existing = conversations[index];
  conversations[index] = {
    ...existing,
    ...conversation,
    productId: conversation.productId || existing.productId,
    productName: conversation.productName || existing.productName,
    hasContext: Boolean(conversation.hasContext || existing.hasContext),
  };
}

function normalizeConversation(item) {
  const currentUserId = String(getUserId(getStoredUser()));
  const user = item.user || {};
  const recipientId = String(user._id || user.id || '');
  const messages = Array.isArray(item.messages) ? item.messages : [];

  return {
    id: `customer-${recipientId || item.id}`,
    recipientId,
    name: user.fullName || 'FarmersHub member',
    role: user.role || 'Direct message',
    productId: '',
    productName: '',
    lastTime: formatMessageTime(item.lastMessage?.createdAt || messages[0]?.createdAt),
    unread: Number(item.unreadCount || 0),
    hasContext: messages.some((message) => message.relatedProduct || message.relatedServiceRequest),
    messages: messages
      .slice()
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
      .map((message) => {
        const senderId = String(message.sender?._id || message.sender || '');
        return {
          id: message._id || message.id || `${senderId}-${message.createdAt}`,
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

function getActiveConversation() {
  return conversations.find((conversation) => conversation.id === activeId) || null;
}

function lastPreview(conversation) {
  const last = conversation.messages[conversation.messages.length - 1];
  return last?.text
    || (last?.attachments?.length ? `${last.attachments.length} attachment${last.attachments.length === 1 ? '' : 's'}` : '')
    || (conversation.productName ? `Product context: ${conversation.productName}` : 'No messages yet');
}

function renderList() {
  const term = String(searchEl?.value || '').trim().toLowerCase();
  const filtered = conversations.filter((conversation) => {
    const matchesFilter = activeFilter === 'all'
      || (activeFilter === 'unread' && conversation.unread > 0)
      || (activeFilter === 'context' && conversation.hasContext);
    return matchesFilter && [
      conversation.name,
      conversation.role,
      conversation.productName,
      lastPreview(conversation),
    ].join(' ').toLowerCase().includes(term);
  });

  listEl.innerHTML = '';
  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'customer-state customer-empty';
    const title = document.createElement('strong');
    title.textContent = term
      ? 'No conversations match your search'
      : activeFilter === 'unread'
        ? 'No unread conversations'
        : activeFilter === 'context'
          ? 'No conversations with real context'
          : 'No conversations yet';
    const copy = document.createElement('p');
    copy.textContent = getToken()
      ? 'Open a product or farmer profile to start a customer message.'
      : 'Log in to view real FarmersHub conversations.';
    empty.append(title, copy);
    listEl.appendChild(empty);
    return;
  }

  filtered.forEach((conversation) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `conversation-card${conversation.id === activeId ? ' is-active' : ''}`;
    button.dataset.id = conversation.id;

    const avatar = document.createElement('span');
    avatar.className = 'conversation-avatar';
    avatar.textContent = getInitials(conversation.name);

    const copy = document.createElement('span');
    const name = document.createElement('strong');
    name.textContent = conversation.name;
    const preview = document.createElement('span');
    preview.textContent = lastPreview(conversation);
    copy.append(name, preview);

    button.append(avatar, copy);
    listEl.appendChild(button);
  });
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
  renderList();
}

function renderThread() {
  const conversation = getActiveConversation();
  headerEl.innerHTML = '';
  contextEl.textContent = '';
  threadEl.innerHTML = '';

  if (!conversation) {
    composerEl.hidden = true;
    const state = document.createElement('div');
    state.className = 'customer-state customer-empty';
    const title = document.createElement('strong');
    title.textContent = 'Choose a conversation';
    const copy = document.createElement('p');
    copy.textContent = 'Select a farmer conversation or open a product to start messaging.';
    state.append(title, copy);
    threadEl.appendChild(state);
    return;
  }

  const avatar = document.createElement('span');
  avatar.className = 'message-avatar';
  avatar.textContent = getInitials(conversation.name);
  const copy = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = conversation.name;
  const role = document.createElement('p');
  role.textContent = conversation.role;
  copy.append(title, role);
  headerEl.append(avatar, copy);

  const hasStoredContext = conversation.messages.some((message) => message.relatedProduct || message.relatedServiceRequest);
  if (conversation.productName || conversation.productId) {
    contextEl.textContent = conversation.productName
      ? `Product context: ${conversation.productName}`
      : `Product context id: ${conversation.productId}`;
  } else if (hasStoredContext) {
    contextEl.textContent = 'This conversation includes real product or service-request context.';
  } else {
    contextEl.textContent = 'No product, order, or service-request context is attached to this conversation.';
  }

  composerEl.hidden = !getToken() || !conversation.recipientId;
  inputEl.disabled = composerEl.hidden;
  composerEl.querySelector('button[type="submit"]').disabled = composerEl.hidden;

  if (!conversation.messages.length) {
    const empty = document.createElement('div');
    empty.className = 'customer-state customer-empty';
    const titleEmpty = document.createElement('strong');
    titleEmpty.textContent = 'No messages in this conversation yet';
    const copyEmpty = document.createElement('p');
    copyEmpty.textContent = getToken()
      ? 'Send a real message to start the conversation.'
      : 'Log in before sending a message.';
    empty.append(titleEmpty, copyEmpty);
    threadEl.appendChild(empty);
    return;
  }

  conversation.messages.forEach((message) => {
    const row = document.createElement('div');
    row.className = `message-row${message.from === 'me' ? ' is-mine' : ''}`;
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

async function loadConversations() {
  hydrateCustomerShell();
  const requested = getRequestedConversation();
  if (requested) {
    upsertConversation(requested, true);
    activeId = requested.id;
  }

  renderList();
  renderThread();

  if (!getToken()) {
    setStatus(statusEl, 'Log in to load or send real customer messages.');
    return;
  }

  setStatus(statusEl, 'Loading real conversations...');
  try {
    const response = await apiFetch('/messages', {
      method: 'GET',
      headers: jsonHeaders(),
    });
    (response.data || []).map(normalizeConversation).forEach((conversation) => upsertConversation(conversation));
    if (!activeId && conversations.length) {
      activeId = conversations[0].id;
    }
    renderList();
    renderThread();
    markActiveConversationRead();
    setStatus(statusEl, conversations.length ? 'Conversations loaded.' : 'No real conversations returned yet.');
  } catch (error) {
    setStatus(statusEl, error.message || 'Unable to load messages.', 'error');
  }
}

listEl.addEventListener('click', (event) => {
  const card = event.target.closest('.conversation-card');
  if (!card) return;
  activeId = card.dataset.id;
  renderList();
  renderThread();
  markActiveConversationRead();
});

searchEl?.addEventListener('input', renderList);
searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  renderList();
});

document.querySelector('.message-filters')?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-filter]');
  if (!button) return;
  activeFilter = button.dataset.filter;
  document.querySelectorAll('.message-filters button').forEach((item) => {
    item.classList.toggle('is-active', item === button);
  });
  renderList();
});

function renderSelectedFiles() {
  selectedAttachmentsEl.textContent = selectedFiles.length
    ? selectedFiles.map((file) => file.name).join(', ')
    : '';
}

attachmentBtn?.addEventListener('click', () => attachmentInput?.click());
attachmentInput?.addEventListener('change', () => {
  selectedFiles = Array.from(attachmentInput.files || []).slice(0, 5);
  if ((attachmentInput.files || []).length > 5) {
    setStatus(statusEl, 'You can attach at most 5 files.', 'error');
  }
  renderSelectedFiles();
});

function renderRecipientList() {
  const term = String(recipientSearch?.value || '').trim().toLowerCase();
  const filtered = recipients.filter((user) => String(user.fullName || '').toLowerCase().includes(term));
  recipientList.innerHTML = '';
  if (!filtered.length) {
    const state = document.createElement('p');
    state.className = 'customer-status';
    state.textContent = 'No matching farmers found.';
    recipientList.appendChild(state);
    return;
  }

  filtered.forEach((user) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'recipient-card';
    button.dataset.id = user.id || user._id;
    const name = document.createElement('strong');
    name.textContent = user.fullName || 'FarmersHub farmer';
    const role = document.createElement('span');
    role.textContent = user.role || 'farmer';
    button.append(name, role);
    recipientList.appendChild(button);
  });
}

async function openRecipientDialog() {
  recipientDialog.showModal();
  recipientList.innerHTML = '';
  if (!getToken()) {
    const message = document.createElement('p');
    message.className = 'customer-status is-error';
    message.textContent = 'Log in before starting a conversation.';
    recipientList.appendChild(message);
    return;
  }

  setStatus(statusEl, 'Loading farmers...');
  try {
    const response = await apiFetch('/users/farmers');
    const currentId = String(getUserId(getStoredUser()));
    recipients = (response.data || []).filter((user) => String(user.id || user._id) !== currentId);
    renderRecipientList();
    setStatus(statusEl, '');
  } catch (error) {
    const message = document.createElement('p');
    message.className = 'customer-status is-error';
    message.textContent = error.message || 'Unable to load farmers.';
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
    id: `customer-${card.dataset.id}`,
    recipientId: card.dataset.id,
    name: user.fullName || 'FarmersHub farmer',
    role: user.role || 'farmer',
    productId: '',
    productName: '',
    messages: [],
    lastTime: 'New',
    unread: 0,
    hasContext: false,
  };
  const existing = conversations.find((item) => item.id === conversation.id);
  if (!existing) upsertConversation(conversation, true);
  activeId = conversation.id;
  recipientDialog.close();
  renderList();
  renderThread();
  inputEl.focus();
});

composerEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  const conversation = getActiveConversation();
  const text = String(inputEl.value || '').trim();
  if (!conversation || (!text && !selectedFiles.length)) return;

  if (!getToken()) {
    setStatus(statusEl, 'Log in before sending a real message.', 'error');
    return;
  }

  if (!conversation.recipientId) {
    setStatus(statusEl, 'This conversation has no recipient id from the backend.', 'error');
    return;
  }

  inputEl.disabled = true;
  setStatus(statusEl, 'Sending message...');
  try {
    const body = {
      receiverId: conversation.recipientId,
      content: text,
    };
    if (conversation.productId) {
      body.relatedProduct = conversation.productId;
    }

    let response;
    if (selectedFiles.length) {
      const form = new FormData();
      Object.entries(body).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });
      selectedFiles.forEach((file) => form.append('attachments', file));
      response = await apiFetch('/messages', {
        method: 'POST',
        headers: authHeader(),
        body: form,
      });
    } else {
      response = await apiFetch('/messages', {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify(body),
      });
    }
    const saved = response.data || {};
    conversation.messages.push({
      id: saved._id || saved.id || Date.now(),
      from: 'me',
      text: saved.content || text,
      time: formatMessageTime(saved.createdAt),
      isRead: Boolean(saved.isRead),
      attachments: Array.isArray(saved.attachments) ? saved.attachments : [],
      relatedProduct: saved.relatedProduct || '',
      relatedServiceRequest: saved.relatedServiceRequest || '',
    });
    conversation.lastTime = 'Now';
    inputEl.value = '';
    selectedFiles = [];
    attachmentInput.value = '';
    renderSelectedFiles();
    renderList();
    renderThread();
    setStatus(statusEl, 'Message sent.', 'success');
  } catch (error) {
    setStatus(statusEl, error.message || 'Failed to send message.', 'error');
  } finally {
    inputEl.disabled = false;
    inputEl.focus();
  }
});

loadConversations();
