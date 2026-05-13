const conversations = [
  {
    id: 'maya',
    name: 'Maya Green Farm',
    role: 'Organic vegetables',
    time: '9:42 AM',
    unread: 2,
    messages: [
      {
        from: 'them',
        text: 'Hi, we have fresh spinach, kale, and carrots available this morning.',
        time: '9:32 AM',
      },
      {
        from: 'me',
        text: 'Great. Can you hold two crates of spinach for pickup today?',
        time: '9:36 AM',
      },
      {
        from: 'them',
        text: 'Absolutely. I can have them packed by 2 PM.',
        time: '9:42 AM',
      },
    ],
  },
  {
    id: 'ulsan',
    name: 'Ulsan Berry Co-op',
    role: 'Fruit supplier',
    time: 'Yesterday',
    unread: 0,
    messages: [
      {
        from: 'them',
        text: 'The strawberry batch is ready. The boxes are 5 kg each.',
        time: 'Yesterday',
      },
      {
        from: 'me',
        text: 'Thanks. Please send the pickup window when you know it.',
        time: 'Yesterday',
      },
    ],
  },
  {
    id: 'haneul',
    name: 'Haneul Rice Farm',
    role: 'Rice and grains',
    time: 'Mon',
    unread: 1,
    messages: [
      {
        from: 'them',
        text: 'We added the new brown rice listing. Let me know if the price looks right.',
        time: 'Mon',
      },
    ],
  },
  {
    id: 'market',
    name: 'FarmersHub Support',
    role: 'Marketplace help',
    time: 'Fri',
    unread: 0,
    messages: [
      {
        from: 'them',
        text: 'Your profile is live. Buyers can now message you from your farmer page.',
        time: 'Fri',
      },
    ],
  },
];

const listEl = document.getElementById('conversationList');
const headerEl = document.getElementById('chatHeader');
const threadEl = document.getElementById('messageThread');
const searchEl = document.getElementById('conversationSearch');
const composerEl = document.getElementById('messageComposer');
const inputEl = document.getElementById('messageInput');
const loginBtn = document.getElementById('navLoginBtn');
const logoutBtn = document.getElementById('navLogoutBtn');

let activeId = conversations[0]?.id || null;

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
    listEl.innerHTML = '<p class="empty-message">No conversations match your search.</p>';
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

composerEl.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = inputEl.value.trim();
  const conversation = getActiveConversation();

  if (!text || !conversation) {
    return;
  }

  conversation.messages.push({
    from: 'me',
    text,
    time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
  });
  conversation.time = 'Now';
  inputEl.value = '';
  renderChat();
  renderConversationList();
});

renderConversationList();
renderChat();
setupSessionNav();
