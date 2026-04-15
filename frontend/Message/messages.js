const currentUser = {
  name: 'You',
  role: 'customer'
};

const defaultChats = [
  {
    id: 'farmer-john',
    name: 'Farmer John',
    role: 'farmer',
    online: true,
    unread: 2,
    messages: [
      { sender: 'Farmer John', text: 'Hi! Your order is ready for pickup tomorrow.', time: '09:14 AM' },
      { sender: 'You', text: 'Great, thank you. What time should I come?', time: '09:16 AM' }
    ]
  },
  {
    id: 'customer-rita',
    name: 'Customer Rita',
    role: 'customer',
    online: false,
    unread: 1,
    messages: [
      { sender: 'Customer Rita', text: 'Do you have organic spinach available this week?', time: 'Yesterday' }
    ]
  },
  {
    id: 'farmer-maya',
    name: 'Farmer Maya',
    role: 'farmer',
    online: true,
    unread: 0,
    messages: [
      { sender: 'Farmer Maya', text: 'I just added new produce to the marketplace.', time: 'Today 08:23 AM' }
    ]
  }
];

const contactList = document.getElementById('contactList');
const chatWindow = document.getElementById('chatWindow');
const chatTitle = document.getElementById('chatTitle');
const chatSubtitle = document.getElementById('chatSubtitle');
const chatRole = document.getElementById('chatRole');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const searchContacts = document.getElementById('searchContacts');
const announcement = document.getElementById('announcement');

let chats = loadChats();
let activeChatId = null;
let auditTrail = loadAuditTrail();

function loadChats() {
  const stored = window.localStorage.getItem('farmershubChats');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.warn('Unable to load previous chats:', error);
    }
  }
  window.localStorage.setItem('farmershubChats', JSON.stringify(defaultChats));
  return JSON.parse(JSON.stringify(defaultChats));
}

function loadAuditTrail() {
  const stored = window.localStorage.getItem('farmershubAudit');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.warn('Unable to load audit trail:', error);
    }
  }
  return [];
}

function saveChats() {
  window.localStorage.setItem('farmershubChats', JSON.stringify(chats));
}

function saveAuditTrail() {
  window.localStorage.setItem('farmershubAudit', JSON.stringify(auditTrail));
}

function logEvent(action, details) {
  const entry = {
    action,
    details,
    timestamp: new Date().toISOString()
  };
  auditTrail.push(entry);
  saveAuditTrail();
  announcement.textContent = details;
}

function formatTimestamp() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getInitials(name) {
  return name.split(' ').map(part => part[0]).join('').slice(0, 2);
}

function renderContacts(filter = '') {
  contactList.innerHTML = '';
  const normalizedFilter = filter.trim().toLowerCase();
  const filteredChats = chats.filter(chat => chat.name.toLowerCase().includes(normalizedFilter));

  if (!filteredChats.length) {
    contactList.innerHTML = '<div class="chat-empty">No contacts found. Try another name.</div>';
    return;
  }

  filteredChats.forEach(chat => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'contact-card' + (chat.id === activeChatId ? ' active' : '');
    card.setAttribute('aria-pressed', chat.id === activeChatId ? 'true' : 'false');
    card.addEventListener('click', () => selectChat(chat.id));

    card.innerHTML = `
      <div class="avatar">${getInitials(chat.name)}</div>
      <div class="contact-card-details">
        <strong>${chat.name}</strong>
        <small>${chat.role === 'farmer' ? 'Farmer' : 'Customer'} • ${chat.online ? 'Online' : 'Offline'}</small>
      </div>
      ${chat.unread > 0 ? `<span class="unread-pill" aria-label="${chat.unread} unread messages">${chat.unread}</span>` : ''}
    `;

    contactList.appendChild(card);
  });
}

function selectChat(id) {
  activeChatId = id;
  chats = chats.map(chat => ({ ...chat, unread: chat.id === id ? 0 : chat.unread }));
  saveChats();
  renderContacts(searchContacts.value);
  renderChatPanel();
  messageInput.disabled = false;
  sendButton.disabled = false;
  messageInput.focus();
  logEvent('chat_selected', `Opened conversation with ${chats.find(chat => chat.id === id).name}`);
}

function renderChatPanel() {
  const chat = chats.find(c => c.id === activeChatId);

  if (!chat) {
    chatTitle.textContent = 'Select a conversation';
    chatSubtitle.textContent = 'Farmer and customer chat support for your marketplace.';
    chatRole.textContent = '';
    chatWindow.innerHTML = '<div class="chat-empty">Pick a contact on the left to see the conversation.</div>';
    messageInput.value = '';
    messageInput.disabled = true;
    sendButton.disabled = true;
    return;
  }

  chatTitle.textContent = chat.name;
  chatSubtitle.textContent = `Last message: ${chat.messages.length ? chat.messages[chat.messages.length - 1].text : 'Send the first message.'}`;
  chatRole.textContent = `${chat.role === 'farmer' ? 'Farmer' : 'Customer'} Chat`;

  if (!chat.messages.length) {
    chatWindow.innerHTML = '<div class="chat-empty">No messages yet. Send the first message to begin.</div>';
    return;
  }

  chatWindow.innerHTML = '';
  chat.messages.forEach(message => {
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${message.sender === currentUser.name ? 'message-outgoing' : 'message-incoming'}`;
    bubble.innerHTML = `
      <div>${message.text}</div>
      <div class="message-meta">${message.sender} • ${message.time}</div>
    `;
    chatWindow.appendChild(bubble);
  });

  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !activeChatId) return;

  const chatIndex = chats.findIndex(c => c.id === activeChatId);
  if (chatIndex === -1) return;

  const newMessage = {
    sender: currentUser.name,
    text,
    time: formatTimestamp()
  };

  chats[chatIndex].messages.push(newMessage);
  saveChats();
  messageInput.value = '';
  renderChatPanel();
  logEvent('message_sent', `Sent a message to ${chats[chatIndex].name}`);
}

messageInput.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

searchContacts.addEventListener('input', () => renderContacts(searchContacts.value));

renderContacts();
renderChatPanel();
