import { apiFetch, jsonHeaders } from './config/api.config.js';
import { requireFarmer, clearElement, createStateCard, setStatus, formatDate } from './farmer-services-shell.js';

function params() {
  return new URLSearchParams(window.location.search);
}

function renderConversation(container, conversation) {
  const other = conversation.user || {};
  const card = document.createElement('article');
  card.className = 'farmer-service-card';
  const title = document.createElement('h3');
  title.textContent = other.fullName || 'Provider conversation';
  const last = conversation.lastMessage || conversation.messages?.[0] || {};
  const copy = document.createElement('p');
  copy.textContent = `${last.content || 'No message text'} - ${formatDate(last.createdAt)}`;
  card.append(title, copy);
  container.appendChild(card);
}

async function sendMessage(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const recipientId = String(data.get('recipientId') || '').trim();
  const content = String(data.get('content') || '').trim();
  const relatedServiceRequest = String(data.get('requestId') || '').trim();
  if (!recipientId || !content) {
    setStatus('farmerProviderMessagesStatus', 'Recipient and message are required.', 'error');
    return;
  }
  await apiFetch('/messages', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ receiverId: recipientId, content, relatedServiceRequest }),
  });
  event.currentTarget.elements.content.value = '';
  setStatus('farmerProviderMessagesStatus', 'Message sent.');
}

async function initialise() {
  await requireFarmer();
  const query = params();
  const form = document.getElementById('farmerProviderMessageForm');
  form.elements.recipientId.value = query.get('recipientId') || '';
  form.elements.requestId.value = query.get('requestId') || '';
  form.addEventListener('submit', async (event) => {
    try {
      await sendMessage(event);
    } catch (error) {
      setStatus('farmerProviderMessagesStatus', error.message || 'Unable to send message.', 'error');
    }
  });

  const list = document.getElementById('farmerProviderMessagesList');
  try {
    const response = await apiFetch('/messages', { headers: jsonHeaders() });
    const conversations = response.data || [];
    clearElement(list);
    const providerConversations = conversations.filter((item) => item.user?.role === 'provider');
    if (!providerConversations.length) {
      list.appendChild(createStateCard('No provider messages yet', 'Messages about service requests will appear here.'));
      return;
    }
    providerConversations.forEach((conversation) => renderConversation(list, conversation));
  } catch (error) {
    setStatus('farmerProviderMessagesStatus', error.message || 'Unable to load messages.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', initialise);
