import { useNavigate, useParams } from 'react-router-dom';
import { getFarmServiceListingById } from '../../api/farmServiceListingsApi.js';
import { PageHeader } from '../../components/common/Page.jsx';
import { ErrorState, LoadingState } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { ListingForm } from './components/ListingForm.jsx';

export function ProviderListingFormPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useAsyncData(() => (listingId ? getFarmServiceListingById(listingId) : Promise.resolve({ data: {} })), [listingId]);
  const listing = data?.data || data || {};

  return (
    <>
      <PageHeader eyebrow="Listing" title={listingId ? 'Edit service listing' : 'Create service listing'} text="Listings require real provider onboarding and are saved to the Farm Service Listings API." />
      {loading ? <LoadingState title="Loading listing" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <ListingForm listing={listing} onSaved={() => navigate('/provider/listings')} />
    </>
  );
}
