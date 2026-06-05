import { BellRing, CheckCheck, MessageCircle, PackageCheck, Sprout } from 'lucide-react';
import { useState } from 'react';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../api/notificationsApi.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { asArray, formatDate } from '../../utils/format.js';
import { EmptyState, ErrorState, LoadingState, StatusMessage } from './States.jsx';

export function NotificationsPanel({ emptyText = 'Notifications will appear when the backend sends them.' }) {
  const { data, loading, error, reload } = useAsyncData(() => getNotifications({ limit: 50 }), []);
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const notifications = asArray(data);

  function iconFor(item = {}) {
    const haystack = `${item.type || ''} ${item.title || ''}`.toLowerCase();
    if (haystack.includes('message')) return <MessageCircle size={18} />;
    if (haystack.includes('order') || haystack.includes('request')) return <PackageCheck size={18} />;
    if (haystack.includes('farm') || haystack.includes('product')) return <Sprout size={18} />;
    return <BellRing size={18} />;
  }

  async function markOne(id) {
    try {
      await markNotificationRead(id);
      setStatus({ message: 'Notification marked read.', tone: 'success' });
      reload();
    } catch (markError) {
      setStatus({ message: markError.message || 'Unable to update notification.', tone: 'error' });
    }
  }

  async function markAll() {
    try {
      await markAllNotificationsRead();
      setStatus({ message: 'All notifications marked read.', tone: 'success' });
      reload();
    } catch (markError) {
      setStatus({ message: markError.message || 'Unable to update notifications.', tone: 'error' });
    }
  }

  if (loading) return <LoadingState title="Loading notifications" />;
  if (error) return <ErrorState text={error} />;

  return (
    <section className="info-card notifications-panel">
      <div className="section-heading">
        <div>
          <h2>Notifications</h2>
          <p>{notifications.filter((item) => !item.read).length} unread notifications.</p>
        </div>
        <button className="secondary-button" type="button" onClick={markAll}>
          <CheckCheck size={17} />
          <span>Mark all read</span>
        </button>
      </div>
      {!notifications.length ? <EmptyState title="No notifications yet" text={emptyText} /> : null}
      <div className="notification-list">
        {notifications.map((item) => (
          <article key={item.id || item._id} className={item.read ? 'notification-item' : 'notification-item unread'}>
            <span className="notification-icon">{iconFor(item)}</span>
            <div>
              <strong>{item.title || item.type || 'Notification'}</strong>
              <p>{item.message || item.body || 'FarmersHub update'}</p>
              <span>{formatDate(item.createdAt)}</span>
            </div>
            {!item.read ? <span className="notification-unread-dot" aria-label="Unread notification" /> : null}
            {!item.read ? (
              <button className="icon-button" type="button" onClick={() => markOne(item.id || item._id)} aria-label="Mark read" title="Mark read">
                <CheckCheck size={17} />
              </button>
            ) : null}
          </article>
        ))}
      </div>
      <StatusMessage message={status.message} tone={status.tone} />
    </section>
  );
}
