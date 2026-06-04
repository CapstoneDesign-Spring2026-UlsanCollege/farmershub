import { Link } from 'react-router-dom';
import { formatDate, getId, humanize } from '../../../utils/format.js';

export function ProviderRequestCard({ request }) {
  return (
    <article className="line-item">
      <div>
        <strong>{request.listing?.title || 'Service request'}</strong>
        <span>{humanize(request.status)} - {request.farmer?.name || 'Farmer'} - {formatDate(request.createdAt)}</span>
        <p>{request.needDescription || 'No need description returned.'}</p>
      </div>
      <div className="card-actions">
        <Link className="secondary-button" to={`/provider/requests/${encodeURIComponent(getId(request))}`}>Open</Link>
        {request.farmer?.id ? <Link className="secondary-button" to={`/provider/messages?recipientId=${encodeURIComponent(request.farmer.id)}&requestId=${encodeURIComponent(getId(request))}`}>Message</Link> : null}
      </div>
    </article>
  );
}
