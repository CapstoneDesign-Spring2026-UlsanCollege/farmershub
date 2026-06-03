import { apiFetch, jsonHeaders } from './config/api.config.js';
import {
  getInitials,
  getStoredUser,
  getToken,
  getUserId,
  hydrateCustomerShell,
  setStatus,
} from './customer-shell.js';

const conversations = [];
const listEl = document.getElementById('conversationList');
const headerEl = document.getElementById('chatHeader');
const contextEl = document.getElementById('messageContext');
const threadEl = document.getElementById('messageThread');
const searchForm = document.getElementById('messageSearchForm');
const searchEl = document.getElementById('conversationSearch');
const composerEl = document.getElementById('messageComposer');
const inputEl = document.getElementById('messageInput');
const statusEl = document.getElementById('messageStatus');

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
  conversations[index] = { ...conversations[index], ...conversation };
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
        };
      }),
  };
}

function getActiveConversation() {
  return conversations.find((conversation) => conversation.id === activeId) || null;
}

function lastPreview(conversation) {
  const last = conversation.messages[conversation.messages.length - 1];
  return last?.text || (conversation.productName ? `Product context: ${conversation.productName}` : 'No messages yet');
}

function renderList() {
  const term = String(searchEl?.value || '').trim().toLowerCase();
  const filtered = conversations.filter((conversation) => [
    conversation.name,
    conversation.role,
    conversation.productName,
    lastPreview(conversation),
  ].join(' ').toLowerCase().includes(term));

  listEl.innerHTML = '';
  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'customer-state customer-empty';
    const title = document.createElement('strong');
    title.textContent = term ? 'No conversations match your search' : 'No conversations yet';
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

  if (conversation.productName || conversation.productId) {
    contextEl.textContent = conversation.productName
      ? `Product context: ${conversation.productName}`
      : `Product context id: ${conversation.productId}`;
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
    const text = document.createElement('p');
    text.textContent = message.text;
    const time = document.createElement('time');
    time.textContent = message.time;
    bubble.append(text, time);
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
});

searchEl?.addEventListener('input', renderList);
searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  renderList();
});

composerEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  const conversation = getActiveConversation();
  const text = String(inputEl.value || '').trim();
  if (!conversation || !text) return;

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

    const response = await apiFetch('/messages', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(body),
    });
    const saved = response.data || {};
    conversation.messages.push({
      id: saved._id || saved.id || Date.now(),
      from: 'me',
      text: saved.content || text,
      time: formatMessageTime(saved.createdAt),
    });
    conversation.lastTime = 'Now';
    inputEl.value = '';
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
