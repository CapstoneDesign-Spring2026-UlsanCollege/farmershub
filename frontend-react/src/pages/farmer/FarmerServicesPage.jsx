import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getFarmServiceListings } from '../../api/farmServiceListingsApi.js';
import { PageHeader } from '../../components/common/Page.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { asArray, formatMoney, getId, humanize } from '../../utils/format.js';

const SERVICE_CATEGORIES = [
  'tractor',
  'tiller',
  'irrigation_pump',
  'delivery_truck',
  'fertilizer',
  'cold_storage',
  'soil_testing',
  'specialist_services',
];

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

export function FarmerServicesPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const { data, loading, error } = useAsyncData(() => getFarmServiceListings({ search: query, category }), [query, category]);
  const listings = asArray(data);

  return (
    <>
      <PageHeader eyebrow="Farm services" title="Browse provider services" text="This is the intentional farmer-to-provider public service flow backed by service listing APIs." />
      <div className="filter-bar">
        <input type="search" placeholder="Search services, locations, providers..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Service category">
          <option value="">All categories</option>
          {SERVICE_CATEGORIES.map((item) => <option key={item} value={item}>{humanize(item)}</option>)}
        </select>
      </div>
      {loading ? <LoadingState title="Loading services" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <div className="card-grid">
        {listings.map((listing) => <ServiceListingCard key={getId(listing)} listing={listing} />)}
      </div>
      {!loading && !listings.length ? <EmptyState title="No active services found" text="Try a different category or search. Providers publish listings from the Provider Portal." /> : null}
    </>
  );
}
