import { Link, useParams } from 'react-router-dom';
import { getProviderPublicProfile } from '../../api/providerApi.js';
import { MetricCard, PageHeader } from '../../components/common/Page.jsx';
import { ErrorState, LoadingState } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { formatMoney, getId, humanize } from '../../utils/format.js';

function ServiceListingCard({ listing }) {
  const id = getId(listing);
  return (
    <article className="service-card">
      <span className="eyebrow">{humanize(listing.category)}</span>
      <h2>{listing.title || 'Farm service'}</h2>
      <p>{listing.description || 'Service description pending.'}</p>
      <strong>{listing.pricingType === 'quote_required' ? 'Quote required' : formatMoney(listing.price)}</strong>
      <small>{listing.provider?.businessName || listing.provider?.name || 'Provider'} - {listing.serviceArea || listing.provider?.serviceArea || 'Area pending'}</small>
      <div className="card-actions">
        <Link className="secondary-button" to={`/farmer/services/${encodeURIComponent(id)}`}>Details</Link>
        <Link className="primary-button" to={`/farmer/service-request/${encodeURIComponent(id)}`}>Request</Link>
        {listing.provider?.id ? <Link className="secondary-button" to={`/farmer/provider/${encodeURIComponent(listing.provider.id)}`}>Provider</Link> : null}
      </div>
    </article>
  );
}

export function FarmerProviderProfilePage() {
  const { providerId } = useParams();
  const { data, loading, error } = useAsyncData(() => getProviderPublicProfile(providerId), [providerId]);
  const profile = data?.data?.profile || data?.profile || {};
  const listings = data?.data?.listings || data?.listings || [];

  return (
    <>
      <PageHeader eyebrow="Provider profile" title={profile.businessName || 'Provider profile'} text="Farmer-facing provider profile, not the private Provider Portal." />
      {loading ? <LoadingState title="Loading provider" /> : null}
      {error ? <ErrorState text={error} /> : null}
      {!loading && !error ? (
        <>
          <section className="metric-grid">
            <MetricCard label="Service area" value={profile.serviceArea || 'Not listed'} text={profile.businessType || 'Provider'} />
            <MetricCard label="Verification" value={humanize(profile.verificationStatus || 'pending')} text="Backend stored status" />
            <MetricCard label="Active listings" value={listings.length} text="Provider public services" />
          </section>
          <div className="card-grid">
            {listings.map((listing) => <ServiceListingCard key={getId(listing)} listing={listing} />)}
          </div>
        </>
      ) : null}
    </>
  );
}
