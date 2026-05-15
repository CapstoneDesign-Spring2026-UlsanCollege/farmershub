import './assets/js/notification-float.js';
import { apiFetch, getToken, jsonHeaders } from './assets/js/config/api.config.js';

const conversations = [];

const listEl = document.getElementById('conversationList');
const headerEl = document.getElementById('chatHeader');
const threadEl = document.getElementById('messageThread');
const searchEl = document.getElementById('conversationSearch');
const composerEl = document.getElementById('messageComposer');
const inputEl = document.getElementById('messageInput');
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
    time: 'New',
    unread: 0,
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
  return conversation.messages[conversation.messages.length - 1]?.text || 'No messages yet';
}

function renderConversationList() {
  const term = searchEl.value.trim().toLowerCase();
  const filtered = conversations.filter((conversation) => {
    return conversation.name.toLowerCase().includes(term)
      || conversation.role.toLowerCase().includes(term)
      || lastMessage(conversation).toLowerCase().includes(term);
  });

  if (!filtered.length) {
    listEl.innerHTML = term
      ? '<p class="empty-message">No conversations match your search.</p>'
      : '<p class="empty-message">No conversations yet.</p>';
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

  conversations[index] = {
    ...conversations[index],
    ...conversation,
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
  } catch (error) {
    listEl.innerHTML = '<p class="empty-message">Unable to load conversations.</p>';
    threadEl.innerHTML = `<p class="empty-message">${error.message || 'Please try again later.'}</p>`;
    composerEl.hidden = true;
  }
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
  conversation.unread = 0;
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

function setActiveConversation(id) {
  activeId = id;
  renderChat();
  renderConversationList();
}

listEl.addEventListener('click', (event) => {
  const card = event.target.closest('.conversation-card');
  if (!card) {
    return;
  }
  setActiveConversation(card.dataset.id);
});

searchEl.addEventListener('input', renderConversationList);

composerEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = inputEl.value.trim();
  const conversation = getActiveConversation();

  if (!text || !conversation) {
    return;
  }

  inputEl.disabled = true;

  try {
    if (conversation.recipientId) {
      const response = await apiFetch('/messages', {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({
          receiverId: conversation.recipientId,
          content: text,
        }),
      });
      const savedMessage = response.data || {};
      conversation.messages.push({
        from: 'me',
        text: savedMessage.content || text,
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
