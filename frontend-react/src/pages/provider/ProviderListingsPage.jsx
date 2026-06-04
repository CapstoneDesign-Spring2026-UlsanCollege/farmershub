import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getFarmServiceListings, setFarmServiceListingActive } from '../../api/farmServiceListingsApi.js';
import { PageHeader } from '../../components/common/Page.jsx';
import { EmptyState, ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { asArray, getId } from '../../utils/format.js';
import { ListingLine } from './components/ListingLine.jsx';

export function ProviderListingsPage() {
  const { data, loading, error, reload } = useAsyncData(() => getFarmServiceListings({ mine: 'true' }), []);
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const listings = asArray(data);

  async function handleToggle(listing) {
    try {
      await setFarmServiceListingActive(getId(listing), !listing.isActive);
      setStatus({ message: listing.isActive ? 'Listing deactivated.' : 'Listing activated.', tone: 'success' });
      reload();
    } catch (toggleError) {
      setStatus({ message: toggleError.message || 'Unable to update listing.', tone: 'error' });
    }
  }

  return (
    <>
      <PageHeader eyebrow="Listings" title="My service listings" text="Create, edit, activate and deactivate real farm service listings." actions={<Link className="primary-button" to="/provider/listings/new">Create listing</Link>} />
      <StatusMessage message={status.message} tone={status.tone} />
      {loading ? <LoadingState title="Loading listings" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <div className="list-stack">
        {listings.map((listing) => <ListingLine key={getId(listing)} listing={listing} onToggle={handleToggle} />)}
      </div>
      {!loading && !listings.length ? <EmptyState title="No listings yet" text="Complete onboarding and create a listing to appear in farmer services." /> : null}
    </>
  );
}
