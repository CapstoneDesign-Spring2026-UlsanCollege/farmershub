import { formatDate } from '../../utils/format.js';

export function MessageBubble({ message, isMine }) {
  return (
    <div className={isMine ? 'message-row is-mine' : 'message-row'}>
      <div className="message-bubble">
        <p>{message.content || message.text || 'Message unavailable'}</p>
        <time>{formatDate(message.createdAt)}</time>
      </div>
    </div>
  );
}
