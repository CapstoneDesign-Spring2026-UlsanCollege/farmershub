import { Search } from 'lucide-react';
import { EmptyState } from '../common/States.jsx';

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Customers', value: 'customer' },
  { label: 'Farmers', value: 'farmer' },
  { label: 'Providers', value: 'provider' },
];

function initialsFor(name = 'FH') {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'FH';
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  query,
  onQueryChange,
  filter,
  onFilterChange,
  emptyText = 'Conversations will appear here when messages are sent.',
}) {
  return (
    <article className="message-list-panel">
      <div className="message-panel-title">
        <div>
          <h2>Messages</h2>
          <p>{conversations.length} conversation{conversations.length === 1 ? '' : 's'}</p>
        </div>
      </div>
      <div className="message-filter-tabs" role="tablist" aria-label="Conversation filters">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            className={filter === item.value ? 'active' : ''}
            onClick={() => onFilterChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <label className="message-search">
        <Search size={17} />
        <input type="search" placeholder="Search messages..." value={query} onChange={(event) => onQueryChange(event.target.value)} />
      </label>
      <div className="conversation-list">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            className={selectedId === conversation.id ? 'conversation-card is-active' : 'conversation-card'}
            onClick={() => onSelect(conversation.id)}
          >
            <span className="conversation-avatar">{initialsFor(conversation.name)}</span>
            <span className="conversation-copy">
              <strong>{conversation.name}</strong>
              <span>{conversation.lastMessage}</span>
              <small>{conversation.role}</small>
            </span>
            {conversation.unread ? <span className="conversation-unread">{conversation.unread}</span> : null}
          </button>
        ))}
      </div>
      {!conversations.length ? <EmptyState title="No conversations yet" text={emptyText} /> : null}
    </article>
  );
}
