import { useState } from 'react';
import { Link } from 'react-router-dom';
import { acceptServiceRequestQuote, cancelServiceRequest, getServiceRequests } from '../../api/serviceRequestsApi.js';
import { PageHeader } from '../../components/common/Page.jsx';
import { EmptyState, ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { asArray, formatDate, getId, humanize } from '../../utils/format.js';

function ServiceRequestCard({ request, actions }) {
  const id = getId(request);
  return (
    <article className="line-item">
      <div>
        <strong>{request.listing?.title || 'Service request'}</strong>
        <span>{humanize(request.status)} - {request.provider?.businessName || request.provider?.name || 'Provider'} - {formatDate(request.createdAt)}</span>
        <p>{request.needDescription || request.notes || 'Request details pending.'}</p>
      </div>
      <div className="card-actions">
        <Link className="secondary-button" to={`/farmer/service-request/${encodeURIComponent(request.listing?.id || '')}?requestId=${encodeURIComponent(id)}`}>Open</Link>
        {request.provider?.id ? <Link className="secondary-button" to={`/farmer/provider-messages?recipientId=${encodeURIComponent(request.provider.id)}&requestId=${encodeURIComponent(id)}`}>Message</Link> : null}
        {actions?.(request)}
      </div>
    </article>
  );
}

export function FarmerServiceRequestsPage() {
  const { data, loading, error, reload } = useAsyncData(getServiceRequests, []);
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const requests = asArray(data);

  async function act(action, id, success) {
    try {
      await action(id);
      setStatus({ message: success, tone: 'success' });
      reload();
    } catch (actionError) {
      setStatus({ message: actionError.message || 'Unable to update request.', tone: 'error' });
    }
  }

  return (
    <>
      <PageHeader eyebrow="Service requests" title="Your provider requests" text="Farmers can accept provider quotes or cancel their own requests through real service request endpoints." />
      <StatusMessage message={status.message} tone={status.tone} />
      {loading ? <LoadingState title="Loading requests" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <div className="list-stack">
        {requests.map((request) => (
          <ServiceRequestCard
            key={getId(request)}
            request={request}
            actions={(item) => (
              <>
                {item.status === 'quoted' ? <button className="secondary-button" type="button" onClick={() => act(acceptServiceRequestQuote, getId(item), 'Quote accepted.')}>Accept quote</button> : null}
                {['new', 'quoted', 'accepted'].includes(item.status) ? <button className="secondary-button" type="button" onClick={() => act(cancelServiceRequest, getId(item), 'Request cancelled.')}>Cancel</button> : null}
              </>
            )}
          />
        ))}
      </div>
      {!loading && !requests.length ? <EmptyState title="No service requests yet" text="Request a provider service from the Farm Services marketplace." /> : null}
    </>
  );
}
