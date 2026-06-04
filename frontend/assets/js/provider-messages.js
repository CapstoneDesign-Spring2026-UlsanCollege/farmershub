import { apiFetch, jsonHeaders } from './config/api.config.js';
import { requireProvider, clearElement, createStateCard, setStatus, formatDate } from './provider-shell.js';

function params() {
  return new URLSearchParams(window.location.search);
}

function renderConversation(container, conversation) {
  const other = conversation.user || {};
  const card = document.createElement('article');
  card.className = 'provider-card';
  const title = document.createElement('h3');
  title.textContent = other.fullName || 'Farmer conversation';
  const last = conversation.lastMessage || conversation.messages?.[0] || {};
  const copy = document.createElement('p');
  copy.textContent = `${last.content || 'No message text'} - ${formatDate(last.createdAt)}`;
  card.append(title, copy);
  container.appendChild(card);
}

async function loadMessages() {
  const response = await apiFetch('/messages', { headers: jsonHeaders() });
  return response.data || [];
}

async function sendMessage(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const recipientId = String(data.get('recipientId') || '').trim();
  const content = String(data.get('content') || '').trim();
  const relatedServiceRequest = String(data.get('requestId') || '').trim();
  if (!recipientId || !content) {
    setStatus('providerMessagesStatus', 'Recipient and message are required.', 'error');
    return;
  }
  await apiFetch('/messages', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ receiverId: recipientId, content, relatedServiceRequest }),
  });
  event.currentTarget.elements.content.value = '';
  setStatus('providerMessagesStatus', 'Message sent.');
}

async function initialise() {
  await requireProvider();
  const query = params();
  const form = document.getElementById('providerMessageForm');
  form.elements.recipientId.value = query.get('recipientId') || '';
  form.elements.requestId.value = query.get('requestId') || '';
  form.addEventListener('submit', async (event) => {
    try {
      await sendMessage(event);
    } catch (error) {
      setStatus('providerMessagesStatus', error.message || 'Unable to send message.', 'error');
    }
  });

  const list = document.getElementById('providerMessagesList');
  try {
    const conversations = await loadMessages();
    clearElement(list);
    const farmerConversations = conversations.filter((item) => item.user?.role === 'farmer');
    if (!farmerConversations.length) {
      list.appendChild(createStateCard('No farmer messages yet', 'Service conversations with farmers will appear here.'));
      return;
    }
    farmerConversations.forEach((conversation) => renderConversation(list, conversation));
  } catch (error) {
    setStatus('providerMessagesStatus', error.message || 'Unable to load messages.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', initialise);
