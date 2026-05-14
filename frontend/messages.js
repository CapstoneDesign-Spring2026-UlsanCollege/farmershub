import { getToken } from './assets/js/config/api.config.js';
import { getConversations, getMessages, startConversation, sendMessage } from './assets/js/services/messageService.js';
import { getFarmerById } from './js/farmerService.js';

const listEl = document.getElementById('conversationList');
const headerEl = document.getElementById('chatHeader');
const threadEl = document.getElementById('messageThread');
const searchEl = document.getElementById('conversationSearch');
const composerEl = document.getElementById('messageComposer');
const inputEl = document.getElementById('messageInput');
const loginBtn = document.getElementById('navLoginBtn');
const logoutBtn = document.getElementById('navLogoutBtn');

let conversations = [];
let activeId = null;
let activeThread = null;
let pendingReceiver = null;
let isLoading = false;

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
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    return;
  }

  if (loginBtn) loginBtn.style.display = 'none';

  if (logoutBtn) {
    logoutBtn.style.display = 'inline-block';
    if (user?.fullName) {
      logoutBtn.textContent = 'Logout (' + user.fullName.split(' ')[0] + ')';
    }

    logoutBtn.addEventListener('click', () => {
      [
        'fh_token',
        'farmershub_token',
        'fh_user',
        'farmershub_user',
        'fh_loggedIn',
        'fh_role',
        'currentUser',
      ].forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      window.location.href = 'index.html';
    });
  }
}

function initials(name = '') {
  return String(name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();

  if (sameDay) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getParticipantName(conversation) {
  return conversation?.participant?.farmName
    || conversation?.participant?.fullName
    || 'Unknown user';
}

function getParticipantRole(conversation) {
  const participant = conversation?.participant;
  if (!participant) return 'Direct message';
  if (participant.role === 'farmer') {
    return participant.location || 'Farmer';
  }
  if (participant.role === 'customer') {
    return 'Customer';
  }
  return participant.role || 'Direct message';
}

function getLastMessage(conversation) {
  return conversation?.lastMessage?.content || 'No messages yet';
}

function showAuthRequired() {
  headerEl.innerHTML = '';
  listEl.innerHTML = '<p class="empty-message">Please login to view your messages.</p>';
  threadEl.innerHTML = '<p class="empty-message">Login first, then you can message farmers and customers.</p>';
  composerEl.hidden = true;
}

function renderConversationList() {
  const term = (searchEl.value || '').trim().toLowerCase();

  const filtered = conversations.filter((conversation) => {
    const name = getParticipantName(conversation).toLowerCase();
    const role = getParticipantRole(conversation).toLowerCase();
    const preview = getLastMessage(conversation).toLowerCase();
    return name.includes(term) || role.includes(term) || preview.includes(term);
  });

  if (pendingReceiver && !term) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'conversation-card' + (!activeId ? ' active' : '');
    button.dataset.pending = 'true';

    const avatar = document.createElement('span');
    avatar.className = 'conversation-avatar';
    avatar.textContent = initials(pendingReceiver.fullName);

    const main = document.createElement('span');
    main.className = 'conversation-main';

    const name = document.createElement('span');
    name.className = 'conversation-name';
    name.textContent = pendingReceiver.farmName || pendingReceiver.fullName || 'New conversation';

    const preview = document.createElement('span');
    preview.className = 'conversation-preview';
    preview.textContent = 'Write your first message';

    const time = document.createElement('span');
    time.className = 'conversation-time';
    time.textContent = 'New';

    main.append(name, preview);
    button.append(avatar, main, time);

    listEl.innerHTML = '';
    listEl.appendChild(button);
  } else {
    listEl.innerHTML = '';
  }

  if (!filtered.length && !pendingReceiver) {
    listEl.innerHTML = '<p class="empty-message">No conversations yet.</p>';
    return;
  }

  filtered.forEach((conversation) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'conversation-card' + (conversation.id === activeId ? ' active' : '');
    button.dataset.id = conversation.id;

    const avatar = document.createElement('span');
    avatar.className = 'conversation-avatar';
    avatar.textContent = initials(getParticipantName(conversation));

    const main = document.createElement('span');
    main.className = 'conversation-main';

    const name = document.createElement('span');
    name.className = 'conversation-name';
    name.textContent = getParticipantName(conversation);

    const preview = document.createElement('span');
    preview.className = 'conversation-preview';
    preview.textContent = getLastMessage(conversation);

    const time = document.createElement('span');
    time.className = 'conversation-time';
    time.textContent = formatTime(conversation.updatedAt || conversation.lastMessage?.createdAt);

    main.append(name, preview);
    button.append(avatar, main, time);

    if (conversation.unreadCount) {
      const badge = document.createElement('span');
      badge.className = 'unread-badge';
      badge.textContent = conversation.unreadCount;
      button.appendChild(badge);
    }

    listEl.appendChild(button);
  });
}

function renderChat() {
  if (pendingReceiver && !activeThread) {
    composerEl.hidden = false;
    headerEl.innerHTML = '';

    const avatar = document.createElement('span');
    avatar.className = 'chat-avatar';
    avatar.textContent = initials(pendingReceiver.fullName);

    const title = document.createElement('span');
    title.className = 'chat-title';

    const heading = document.createElement('h3');
    heading.textContent = pendingReceiver.farmName || pendingReceiver.fullName || 'New conversation';

    const role = document.createElement('p');
    role.textContent = pendingReceiver.location || 'Write your first message';

    title.append(heading, role);
    headerEl.append(avatar, title);

    threadEl.innerHTML = '<p class="empty-message">Send your first message to start this conversation.</p>';
    return;
  }

  if (!activeThread) {
    headerEl.innerHTML = '';
    threadEl.innerHTML = '<p class="empty-message">Choose a conversation to start messaging.</p>';
    composerEl.hidden = true;
    return;
  }

  composerEl.hidden = false;
  headerEl.innerHTML = '';

  const participant = activeThread.participant || {};
  const displayName = participant.farmName || participant.fullName || 'Conversation';

  const avatar = document.createElement('span');
  avatar.className = 'chat-avatar';
  avatar.textContent = initials(displayName);

  const title = document.createElement('span');
  title.className = 'chat-title';

  const heading = document.createElement('h3');
  heading.textContent = displayName;

  const role = document.createElement('p');
  role.textContent = participant.location || participant.role || 'Direct message';

  title.append(heading, role);
  headerEl.append(avatar, title);

  const messages = activeThread.messages || [];

  if (!messages.length) {
    threadEl.innerHTML = '<p class="empty-message">No messages yet. Say hello.</p>';
    return;
  }

  threadEl.innerHTML = '';
  messages.forEach((message) => {
    const row = document.createElement('div');
    row.className = 'message-row' + (message.isMine ? ' mine' : '');

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    const text = document.createElement('p');
    text.textContent = message.content;

    const time = document.createElement('time');
    time.textContent = formatTime(message.createdAt);

    bubble.append(text, time);
    row.appendChild(bubble);
    threadEl.appendChild(row);
  });

  threadEl.scrollTop = threadEl.scrollHeight;
}

async function openConversation(conversationId) {
  activeId = conversationId;
  pendingReceiver = null;
  activeThread = null;
  renderConversationList();
  threadEl.innerHTML = '<p class="empty-message">Loading messages...</p>';

  const response = await getMessages(conversationId);
  activeThread = response.data;
  renderChat();
  await loadConversations(false);
}

async function loadConversations(openFirst = true) {
  if (!getToken()) {
    showAuthRequired();
    return;
  }

  const response = await getConversations();
  conversations = response.data || [];
  renderConversationList();

  if (openFirst && !pendingReceiver && conversations.length) {
    await openConversation(conversations[0].id);
  } else if (!activeThread && !pendingReceiver) {
    renderChat();
  }
}

async function setupPendingReceiverFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const receiverId = params.get('receiverId') || params.get('farmer') || params.get('to');

  if (!receiverId || !getToken()) {
    return;
  }

  try {
    const response = await getFarmerById(receiverId);
    pendingReceiver = response.data;
  } catch {
    pendingReceiver = {
      id: receiverId,
      fullName: 'Selected user',
      role: 'farmer',
      location: '',
    };
  }

  activeId = null;
  activeThread = null;
  renderConversationList();
  renderChat();
}

listEl.addEventListener('click', async (event) => {
  const card = event.target.closest('.conversation-card');
  if (!card || isLoading) return;

  try {
    isLoading = true;
    if (card.dataset.pending) {
      activeId = null;
      activeThread = null;
      renderConversationList();
      renderChat();
      return;
    }

    await openConversation(card.dataset.id);
  } catch (error) {
    threadEl.innerHTML = `<p class="empty-message">${error.message || 'Failed to load conversation.'}</p>`;
  } finally {
    isLoading = false;
  }
});

searchEl.addEventListener('input', renderConversationList);

composerEl.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (isLoading) return;

  const text = inputEl.value.trim();
  if (!text) return;

  try {
    isLoading = true;
    inputEl.disabled = true;

    if (pendingReceiver && !activeThread) {
      const response = await startConversation(pendingReceiver.id, text);
      inputEl.value = '';
      pendingReceiver = null;
      activeId = response.data.conversationId;
      await loadConversations(false);
      await openConversation(activeId);
      return;
    }

    if (!activeId) return;

    await sendMessage(activeId, text);
    inputEl.value = '';
    await openConversation(activeId);
  } catch (error) {
    alert(error.message || 'Failed to send message.');
  } finally {
    inputEl.disabled = false;
    isLoading = false;
    inputEl.focus();
  }
});

async function init() {
  setupSessionNav();

  if (!getToken()) {
    showAuthRequired();
    return;
  }

  listEl.innerHTML = '<p class="empty-message">Loading conversations...</p>';
  threadEl.innerHTML = '<p class="empty-message">Loading messages...</p>';

  try {
    await setupPendingReceiverFromUrl();
    await loadConversations(!pendingReceiver);
  } catch (error) {
    listEl.innerHTML = '<p class="empty-message">Unable to load conversations.</p>';
    threadEl.innerHTML = `<p class="empty-message">${error.message || 'Please try again later.'}</p>`;
    composerEl.hidden = true;
  }
}

init();
