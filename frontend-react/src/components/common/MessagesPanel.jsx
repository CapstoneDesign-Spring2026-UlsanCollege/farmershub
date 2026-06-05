import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { getMessages, sendMessage } from '../../api/messagesApi.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { asArray, formatDate } from '../../utils/format.js';
import { EmptyState, ErrorState, LoadingState, StatusMessage } from './States.jsx';

function normalizeConversation(item = {}) {
  const messages = Array.isArray(item.messages) ? item.messages : [];
  const other = item.otherUser || item.participant || {};
  return {
    id: String(item.otherUserId || item.id || item._id || other.id || other._id || 'conversation'),
    name: item.otherUserName || item.name || other.fullName || other.name || 'Conversation',
    role: item.otherUserRole || item.role || other.role || 'member',
    lastMessage: item.lastMessage?.content || item.lastMessage?.text || messages[messages.length - 1]?.content || messages[messages.length - 1]?.text || 'No messages yet',
    messages,
  };
}

export function MessagesPanel({ title = 'Messages', emptyText = 'Conversations will appear here when messages are sent.' }) {
  const [params] = useSearchParams();
  const { data, loading, error, reload } = useAsyncData(getMessages, []);
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const conversations = useMemo(() => asArray(data).map(normalizeConversation), [data]);
  const selected = conversations.find((item) => item.id === selectedId) || conversations[0];

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const receiverId = String(formData.get('receiverId') || '').trim();
    const content = String(formData.get('content') || '').trim();
    if (!receiverId || !content) {
      setStatus({ message: 'Receiver id and message are required.', tone: 'error' });
      return;
    }
    setBusy(true);
    setStatus({ message: 'Sending message...', tone: 'info' });
    try {
      await sendMessage({
        receiverId,
        content,
        relatedProduct: formData.get('relatedProduct') || undefined,
        relatedServiceRequest: formData.get('relatedServiceRequest') || undefined,
      });
      event.currentTarget.reset();
      setStatus({ message: 'Message sent through the real Messages API.', tone: 'success' });
      reload();
    } catch (sendError) {
      setStatus({ message: sendError.message || 'Unable to send message.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="two-column">
      <article className="info-card">
        <h2>{title}</h2>
        {loading ? <LoadingState title="Loading conversations" /> : null}
        {error ? <ErrorState text={error} /> : null}
        {!loading && !error && !conversations.length ? <EmptyState title="No conversations yet" text={emptyText} /> : null}
        <div className="conversation-list">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              className={selected?.id === conversation.id ? 'conversation-item active' : 'conversation-item'}
              onClick={() => setSelectedId(conversation.id)}
            >
              <strong>{conversation.name}</strong>
              <span>{conversation.role}</span>
              <small>{conversation.lastMessage}</small>
            </button>
          ))}
        </div>
      </article>
      <article className="info-card">
        <h2>{selected?.name || 'Send message'}</h2>
        {selected?.messages?.length ? (
          <div className="message-thread">
            {selected.messages.map((message) => (
              <div key={message.id || message._id || message.createdAt} className="message-bubble">
                <p>{message.content || message.text}</p>
                <span>{formatDate(message.createdAt)}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No messages selected" text="Use the form below to start or continue a conversation." />
        )}
        <form className="compact-form" onSubmit={handleSubmit}>
          <label>
            Receiver ID
            <input name="receiverId" defaultValue={params.get('recipientId') || selected?.id || ''} required />
          </label>
          <label>
            Product ID
            <input name="relatedProduct" defaultValue={params.get('productId') || ''} />
          </label>
          <label>
            Service request ID
            <input name="relatedServiceRequest" defaultValue={params.get('requestId') || ''} />
          </label>
          <label className="wide-field">
            Message
            <textarea name="content" rows="4" required />
          </label>
          <button className="primary-button" type="submit" disabled={busy}>
            <Send size={17} />
            <span>{busy ? 'Sending' : 'Send'}</span>
          </button>
        </form>
        <StatusMessage message={status.message} tone={status.tone} />
      </article>
    </section>
  );
}
