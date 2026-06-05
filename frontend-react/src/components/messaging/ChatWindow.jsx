import { LockKeyhole, MoreVertical, Search } from 'lucide-react';
import { EmptyState, StatusMessage } from '../common/States.jsx';
import { MessageBubble } from './MessageBubble.jsx';
import { MessageComposer } from './MessageComposer.jsx';

function initialsFor(name = 'FH') {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'FH';
}

export function ChatWindow({
  conversation,
  currentUserId,
  draft,
  onDraftChange,
  onSubmit,
  busy,
  status,
}) {
  const messages = conversation?.messages || [];

  return (
    <article className="message-thread-panel">
      {conversation ? (
        <>
          <header className="message-thread-header">
            <span className="conversation-avatar">{initialsFor(conversation.name)}</span>
            <div>
              <h2>{conversation.name}</h2>
              <p>{conversation.role} {conversation.online ? 'Online' : 'Conversation'}</p>
            </div>
            <div className="message-thread-tools">
              <button className="icon-button" type="button" aria-label="Search conversation" title="Search conversation">
                <Search size={17} />
              </button>
              <button className="icon-button" type="button" aria-label="Conversation options" title="Conversation options">
                <MoreVertical size={17} />
              </button>
            </div>
          </header>
          <div className="message-context">
            <LockKeyhole size={15} />
            <span>Secure FarmersHub conversation</span>
          </div>
          <div className="message-thread" aria-live="polite">
            {messages.length ? messages.map((message) => {
              const senderId = String(message.senderId || message.sender?._id || message.sender?.id || '');
              const isMine = Boolean(message.isMine || message.fromMe || (currentUserId && senderId === currentUserId));
              return <MessageBubble key={message.id || message._id || message.createdAt || message.content} message={message} isMine={isMine} />;
            }) : <EmptyState title="No messages yet" text="This conversation is ready when the first message is sent." />}
          </div>
        </>
      ) : (
        <EmptyState title="No conversation selected" text="Choose a conversation from the list to open the chat window." />
      )}
      <MessageComposer
        value={draft}
        onChange={onDraftChange}
        onSubmit={onSubmit}
        busy={busy}
        disabled={!conversation}
      />
      <StatusMessage message={status.message} tone={status.tone} />
    </article>
  );
}
