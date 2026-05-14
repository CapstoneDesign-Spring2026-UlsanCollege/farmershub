import { apiFetch, jsonHeaders } from '../config/api.config.js';

async function getConversations() {
  return apiFetch('/messages/conversations', {
    method: 'GET',
    headers: jsonHeaders(),
  });
}

async function getMessages(conversationId) {
  return apiFetch(`/messages/${encodeURIComponent(conversationId)}`, {
    method: 'GET',
    headers: jsonHeaders(),
  });
}

async function startConversation(receiverId, content) {
  return apiFetch('/messages/start', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ receiverId, content }),
  });
}

async function sendMessage(conversationId, content) {
  return apiFetch(`/messages/${encodeURIComponent(conversationId)}`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ content }),
  });
}

export { getConversations, getMessages, startConversation, sendMessage };
