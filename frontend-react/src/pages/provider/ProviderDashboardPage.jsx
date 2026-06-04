import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { InfoCard, MetricCard, PageHeader } from '../../components/common/Page.jsx';
import { ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { getId } from '../../utils/format.js';
import { ListingLine } from './components/ListingLine.jsx';
import { ProviderRequestCard } from './components/ProviderRequestCard.jsx';
import { useProviderOverview } from './hooks/useProviderOverview.js';

export function ProviderDashboardPage() {
  const { data, loading, error } = useProviderOverview();
  const listings = data?.listings || [];
  const requests = data?.requests || [];
  const active = listings.filter((listing) => listing.isActive).length;
  const newRequests = requests.filter((request) => request.status === 'new').length;
  const quoted = requests.filter((request) => request.status === 'quoted').length;

  return (
    <>
      <PageHeader
        eyebrow="Provider application"
        title={data?.profile?.businessName || 'Provider workspace'}
        text="Manage active farm support listings, respond to real farmer requests and keep provider conversations organized."
        actions={<Link className="primary-button" to="/provider/listings/new"><Plus size={18} /><span>Create listing</span></Link>}
      />
      {loading ? <LoadingState title="Loading provider workspace" /> : null}
      {error ? <ErrorState text={error} /> : null}
      {data?.errors?.length ? <StatusMessage message={data.errors.join(' ')} tone="error" /> : null}
      <section className="metric-grid">
        <MetricCard label="Listings" value={listings.length} text="Total service listings" />
        <MetricCard label="Active" value={active} text="Visible to farmers" />
        <MetricCard label="New requests" value={newRequests} text="Waiting for review" />
        <MetricCard label="Quoted" value={quoted} text="Awaiting farmer decision" />
      </section>
      <section className="two-column">
        <InfoCard title="Recent listings">
          <div className="list-stack">{listings.slice(0, 4).map((listing) => <ListingLine key={getId(listing)} listing={listing} />)}</div>
        </InfoCard>
        <InfoCard title="Recent requests">
          <div className="list-stack">{requests.slice(0, 4).map((request) => <ProviderRequestCard key={getId(request)} request={request} />)}</div>
        </InfoCard>
      </section>
    </>
  );
}
