export function LoadingState({ title = 'Loading', text = 'Fetching the latest FarmersHub data.' }) {
  return (
    <div className="state-panel" role="status">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

export function EmptyState({ title = 'Nothing to show yet', text = 'New activity will appear here when it is available.' }) {
  return (
    <div className="state-panel">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

export function ErrorState({ title = 'Unable to load', text = 'Please try again later.' }) {
  return (
    <div className="state-panel state-error" role="alert">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

export function StatusMessage({ message, tone = 'info' }) {
  if (!message) return null;
  return <p className={`status-message status-${tone}`} role="status">{message}</p>;
}
