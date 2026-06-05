import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMessages, sendMessage } from '../../api/messagesApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { asArray } from '../../utils/format.js';
import { ChatWindow } from '../messaging/ChatWindow.jsx';
import { ConversationList } from '../messaging/ConversationList.jsx';
import { EmptyState, ErrorState, LoadingState, StatusMessage } from './States.jsx';

function normalizeConversation(item = {}) {
  const messages = Array.isArray(item.messages) ? item.messages : [];
  const other = item.otherUser || item.participant || item.user || {};
  return {
    id: String(item.otherUserId || item.id || item._id || other.id || other._id || 'conversation'),
    name: item.otherUserName || item.name || other.fullName || other.name || 'Conversation',
    role: item.otherUserRole || item.role || other.role || 'member',
    lastMessage: item.lastMessage?.content || item.lastMessage?.text || messages[messages.length - 1]?.content || messages[messages.length - 1]?.text || 'No messages yet',
    unread: item.unreadCount || item.unread || 0,
    online: Boolean(item.online || other.online),
    messages,
  };
}

export function MessagesPanel({ title = 'Messages', emptyText = 'Conversations will appear here when messages are sent.' }) {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsyncData(getMessages, []);
  const recipientId = params.get('recipientId') || '';
  const recipientName = params.get('recipientName') || title;
  const recipientRole = params.get('recipientRole') || 'member';
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState(() => recipientId);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [draft, setDraft] = useState('');
  const conversations = useMemo(() => {
    const apiConversations = asArray(data).map(normalizeConversation);
    const routeConversation = recipientId ? {
      id: String(recipientId),
      name: recipientName,
      role: recipientRole,
      lastMessage: 'Ready to start a conversation',
      messages: [],
      online: true,
    } : null;
    if (routeConversation && !apiConversations.some((item) => item.id === routeConversation.id)) {
      return [routeConversation, ...apiConversations];
    }
    return apiConversations;
  }, [data, recipientId, recipientName, recipientRole]);
  const filteredConversations = conversations.filter((conversation) => {
    const matchesRole = filter === 'all' || conversation.role?.toLowerCase() === filter;
    const haystack = `${conversation.name} ${conversation.role} ${conversation.lastMessage}`.toLowerCase();
    return matchesRole && (!query || haystack.includes(query.toLowerCase()));
  });
  const selected = conversations.find((item) => item.id === selectedId) || filteredConversations[0] || conversations[0] || null;
  const currentUserId = String(user?.id || user?._id || '');

  async function handleSubmit(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!selected?.id || !content) {
      setStatus({ message: 'Choose a conversation and enter a message.', tone: 'error' });
      return;
    }
    setBusy(true);
    setStatus({ message: 'Sending message...', tone: 'info' });
    try {
      await sendMessage({
        receiverId: selected.id,
        content,
        relatedProduct: params.get('productId') || undefined,
        relatedServiceRequest: params.get('requestId') || undefined,
      });
      setDraft('');
      setStatus({ message: 'Message sent.', tone: 'success' });
      reload();
    } catch (sendError) {
      setStatus({ message: sendError.message || 'Unable to send message.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="messages-layout" aria-label={title}>
      {loading ? <LoadingState title="Loading conversations" /> : null}
      {error ? <ErrorState text={error} /> : null}
      {!loading && !error && !conversations.length ? <EmptyState title="No conversations yet" text={emptyText} /> : null}
      <ConversationList
        conversations={filteredConversations}
        selectedId={selected?.id}
        onSelect={setSelectedId}
        query={query}
        onQueryChange={setQuery}
        filter={filter}
        onFilterChange={setFilter}
        emptyText={emptyText}
      />
      <ChatWindow
        conversation={selected}
        currentUserId={currentUserId}
        draft={draft}
        onDraftChange={setDraft}
        onSubmit={handleSubmit}
        busy={busy}
        status={status}
      />
    </section>
  );
}
