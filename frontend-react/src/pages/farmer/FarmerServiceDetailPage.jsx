import { Link, useParams } from 'react-router-dom';
import { getFarmServiceListingById } from '../../api/farmServiceListingsApi.js';
import { InfoCard, PageHeader } from '../../components/common/Page.jsx';
import { ErrorState, LoadingState } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { formatMoney, getId, humanize } from '../../utils/format.js';

export function FarmerServiceDetailPage() {
  const { listingId } = useParams();
  const { data, loading, error } = useAsyncData(() => getFarmServiceListingById(listingId), [listingId]);
  const listing = data?.data || data || {};

  return (
    <>
      <PageHeader eyebrow="Service detail" title={listing.title || 'Farm service'} text="Request, message or inspect provider details through farmer-approved service routes." />
      {loading ? <LoadingState title="Loading service" /> : null}
      {error ? <ErrorState text={error} /> : null}
      {!loading && !error ? (
        <section className="detail-layout">
          <InfoCard title={listing.title} text={listing.description}>
            <p>{humanize(listing.category)} - {humanize(listing.listingType)}</p>
            <p>{listing.pricingType === 'quote_required' ? 'Quote required' : formatMoney(listing.price)} {listing.unitLabel || ''}</p>
            <p>{listing.serviceArea || listing.provider?.serviceArea || 'Service area pending'}</p>
            <div className="card-actions">
              <Link className="primary-button" to={`/farmer/service-request/${encodeURIComponent(getId(listing))}`}>Request service</Link>
              {listing.provider?.id ? <Link className="secondary-button" to={`/farmer/provider/${encodeURIComponent(listing.provider.id)}`}>Provider profile</Link> : null}
              {listing.provider?.id ? <Link className="secondary-button" to={`/farmer/provider-messages?recipientId=${encodeURIComponent(listing.provider.id)}`}>Message provider</Link> : null}
            </div>
          </InfoCard>
        </section>
      ) : null}
    </>
  );
}
