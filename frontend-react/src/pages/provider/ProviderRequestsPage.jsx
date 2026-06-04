import { getServiceRequests } from '../../api/serviceRequestsApi.js';
import { PageHeader } from '../../components/common/Page.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { asArray, getId } from '../../utils/format.js';
import { ProviderRequestCard } from './components/ProviderRequestCard.jsx';

export function ProviderRequestsPage() {
  const { data, loading, error } = useAsyncData(getServiceRequests, []);
  const requests = asArray(data);

  return (
    <>
      <PageHeader eyebrow="Requests" title="Farmer service requests" text="Open real submitted requests, review field context, quote, decline or message the farmer." />
      {loading ? <LoadingState title="Loading requests" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <div className="list-stack">
        {requests.map((request) => <ProviderRequestCard key={getId(request)} request={request} />)}
      </div>
      {!loading && !requests.length ? <EmptyState title="No requests yet" text="Farmer requests for your listings will appear here." /> : null}
    </>
  );
}
