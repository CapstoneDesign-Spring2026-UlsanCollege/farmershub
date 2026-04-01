/* ============================================
   FarmersHub Messages - messages.js
   Person-to-person chat with notifications
   and Web Audio notification sound.
   ============================================ */

(function () {
  'use strict';

  // ── Current logged-in user (placeholder until auth is wired) ──────────────
  const ME = { id: 'me', name: 'You', initials: 'Y' };

  // ── Seed contacts / conversations ─────────────────────────────────────────
  const conversations = [
    {
      id: 'conv1',
      participant: { id: 'u1', name: 'Alice Kim', initials: 'AK' },
      messages: [
        { from: 'u1', text: 'Hi! Do you sell tomatoes?', time: ago(50) },
        { from: 'me', text: 'Yes, fresh harvest available this week!', time: ago(48) },
        { from: 'u1', text: "Great, I'll place an order.", time: ago(30) }
      ],
      unread: 1
    },
    {
      id: 'conv2',
      participant: { id: 'u2', name: 'Bob Lee', initials: 'BL' },
      messages: [
        { from: 'u2', text: 'Are your potatoes organic?', time: ago(120) },
        { from: 'me', text: 'Absolutely, no pesticides used.', time: ago(110) }
      ],
      unread: 0
    },
    {
      id: 'conv3',
      participant: { id: 'u3', name: 'Carol Park', initials: 'CP' },
      messages: [
        { from: 'u3', text: 'What\'s the price for a box of strawberries?', time: ago(200) }
      ],
      unread: 2
    },
    {
      id: 'conv4',
      participant: { id: 'u4', name: 'David Choi', initials: 'DC' },
      messages: [],
      unread: 0
    }
  ];

  // ── State ──────────────────────────────────────────────────────────────────
  let activeConvId = null;

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const convListEl    = document.getElementById('conv-list');
  const chatMsgsEl    = document.getElementById('chat-messages');
  const chatForm      = document.getElementById('chat-form');
  const chatInput     = document.getElementById('chat-input');
  const sendBtn       = document.getElementById('send-btn');
  const chatWithName  = document.getElementById('chat-with-name');
  const chatStatus    = document.getElementById('chat-status');
  const chatPlaceholder = document.getElementById('chat-placeholder');
  const notifToast    = document.getElementById('notif-toast');

  // ── Helper: minutes-ago timestamps ────────────────────────────────────────
  function ago(minutes) {
    return new Date(Date.now() - minutes * 60 * 1000);
  }

  function formatTime(date) {
    const now = new Date();
    const diff = (now - date) / 1000; // seconds
    if (diff < 60)   return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  // ── Web Audio notification sound ──────────────────────────────────────────
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  // Notification chime tone parameters: [frequency (Hz), start offset (s), duration (s)]
  const CHIME_TONES = [
    { freq: 880,  startOffset: 0,    dur: 0.12 },
    { freq: 1100, startOffset: 0.15, dur: 0.12 }
  ];

  function playNotificationSound() {
    try {
      const ctx = getAudioContext();
      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      // Two-tone chime: high note then slightly lower note
      CHIME_TONES.forEach(({ freq, startOffset, dur }) => {
        const osc    = ctx.createOscillator();
        const gainN  = ctx.createGain();

        osc.type      = 'sine';
        osc.frequency.setValueAtTime(freq, now + startOffset);

        gainN.gain.setValueAtTime(0, now + startOffset);
        gainN.gain.linearRampToValueAtTime(0.35, now + startOffset + 0.02);
        gainN.gain.exponentialRampToValueAtTime(0.001, now + startOffset + dur);

        osc.connect(gainN);
        gainN.connect(ctx.destination);

        osc.start(now + startOffset);
        osc.stop(now + startOffset + dur + 0.05);
      });
    } catch (e) {
      // Audio not available – silently ignore
    }
  }

  // ── Notification toast ────────────────────────────────────────────────────
  let toastTimer = null;

  function showNotification(title, body) {
    notifToast.textContent = '🔔 ' + title + (body ? ': ' + body : '');
    notifToast.classList.add('show');
    playNotificationSound();

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => notifToast.classList.remove('show'), 4000);

    // Also send a browser Notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      const iconUrl = new URL('../../logo.png', document.baseURI).href;
      new Notification('FarmersHub – ' + title, { body, icon: iconUrl });
    }
  }

  // Request browser notification permission once (non-blocking)
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // ── Render conversation list ───────────────────────────────────────────────
  function renderConvList() {
    convListEl.innerHTML = '';
    conversations.forEach(conv => {
      const li = document.createElement('li');
      li.className = 'conv-item' + (conv.id === activeConvId ? ' active' : '');
      li.dataset.convId = conv.id;

      const lastMsg = conv.messages[conv.messages.length - 1];
      const preview = lastMsg
        ? (lastMsg.from === 'me' ? 'You: ' : '') + lastMsg.text
        : 'No messages yet';

      li.innerHTML =
        '<div class="conv-avatar">' + escHtml(conv.participant.initials) + '</div>' +
        '<div class="conv-info">' +
          '<div class="conv-name">' + escHtml(conv.participant.name) + '</div>' +
          '<div class="conv-preview">' + escHtml(truncate(preview, 32)) + '</div>' +
        '</div>' +
        (conv.unread > 0
          ? '<div class="conv-badge">' + conv.unread + '</div>'
          : '');

      li.addEventListener('click', () => openConversation(conv.id));
      convListEl.appendChild(li);
    });
  }

  // ── Open a conversation ───────────────────────────────────────────────────
  function openConversation(convId) {
    const conv = conversations.find(c => c.id === convId);
    if (!conv) return;

    activeConvId = convId;
    conv.unread  = 0;

    chatWithName.textContent = conv.participant.name;
    chatStatus.textContent   = 'online';
    chatInput.disabled       = false;
    sendBtn.disabled         = false;
    chatInput.focus();

    renderMessages(conv);
    renderConvList();
  }

  // ── Render messages for a conversation ────────────────────────────────────
  function renderMessages(conv) {
    // Remove all children except the static placeholder
    Array.from(chatMsgsEl.children).forEach(child => {
      if (child.id !== 'chat-placeholder') chatMsgsEl.removeChild(child);
    });

    if (conv.messages.length === 0) {
      chatPlaceholder.textContent = 'No messages yet. Say hello!';
      chatPlaceholder.style.display = '';
      return;
    }

    chatPlaceholder.style.display = 'none';
    conv.messages.forEach(msg => appendMessageEl(msg, conv));
    scrollToBottom();
  }

  // ── Append a single message element ───────────────────────────────────────
  function appendMessageEl(msg, conv) {
    const isSent = msg.from === ME.id;
    const sender = isSent ? ME : conv.participant;

    const row = document.createElement('div');
    row.className = 'msg-row ' + (isSent ? 'sent' : 'received');

    row.innerHTML =
      '<div class="msg-avatar">' + escHtml(sender.initials) + '</div>' +
      '<div>' +
        '<div class="msg-bubble">' + escHtml(msg.text) + '</div>' +
        '<div class="msg-time">' + formatTime(msg.time) + '</div>' +
      '</div>';

    chatMsgsEl.appendChild(row);
  }

  // ── Send a message ────────────────────────────────────────────────────────
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text || !activeConvId) return;

    const conv = conversations.find(c => c.id === activeConvId);
    if (!conv) return;

    const msg = { from: ME.id, text, time: new Date() };
    conv.messages.push(msg);
    chatInput.value = '';

    appendMessageEl(msg, conv);
    scrollToBottom();
    renderConvList();

    // Simulate a reply after a short delay
    simulateReply(conv);
  });

  // ── Simulate incoming reply ────────────────────────────────────────────────
  function simulateReply(conv) {
    const delay = 1500 + Math.random() * 2500;
    setTimeout(() => {
      const replies = [
        'Thanks for the info!',
        'Sounds great, I\'ll get back to you soon.',
        'Could you send me more details?',
        'Perfect, let\'s do it!',
        'How much does that cost per kilo?',
        'I appreciate your quick response.',
        'Can I pick it up this weekend?'
      ];
      const text = replies[Math.floor(Math.random() * replies.length)];
      const reply = { from: conv.participant.id, text, time: new Date() };
      conv.messages.push(reply);

      if (activeConvId === conv.id) {
        // Chat is open – append message directly
        appendMessageEl(reply, conv);
        scrollToBottom();
      } else {
        // Chat is not open – show notification badge
        conv.unread = (conv.unread || 0) + 1;
        showNotification(conv.participant.name, text);
      }
      renderConvList();
    }, delay);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function scrollToBottom() {
    chatMsgsEl.scrollTop = chatMsgsEl.scrollHeight;
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function truncate(str, len) {
    return str.length > len ? str.slice(0, len) + '…' : str;
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  renderConvList();

  // Demonstrate a notification after 5 seconds on first load
  setTimeout(() => {
    const conv = conversations.find(c => c.id !== activeConvId && c.participant);
    if (conv) {
      const demoMsg = { from: conv.participant.id, text: 'Hey, are you available?', time: new Date() };
      conv.messages.push(demoMsg);
      conv.unread = (conv.unread || 0) + 1;
      showNotification(conv.participant.name, demoMsg.text);
      renderConvList();
    }
  }, 5000);

})();
