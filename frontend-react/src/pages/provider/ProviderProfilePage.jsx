import { getFarmServiceListings } from '../../api/farmServiceListingsApi.js';
import { getProviderProfile } from '../../api/providerApi.js';
import { InfoCard, PageHeader } from '../../components/common/Page.jsx';
import { ErrorState, LoadingState } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { asArray, getId, humanize } from '../../utils/format.js';
import { ListingLine } from './components/ListingLine.jsx';
import { ProviderProfileForm } from './components/ProviderProfileForm.jsx';

export function ProviderProfilePage() {
  const { data, loading, error, reload } = useAsyncData(getProviderProfile, []);
  const listingsState = useAsyncData(() => getFarmServiceListings({ mine: 'true', status: 'active' }), []);
  const profile = data?.data || data || {};
  const listings = asArray(listingsState.data);

  return (
    <>
      <PageHeader eyebrow="Profile" title="Business profile" text="Manage farmer-visible business details. Verification is only displayed from backend state." />
      {loading ? <LoadingState title="Loading profile" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <section className="two-column">
        <ProviderProfileForm profile={profile} onSaved={reload} />
        <InfoCard title="Public preview" text={profile.bio || 'Provider bio not added yet.'}>
          <p>{profile.businessName || 'Business name pending'}</p>
          <p>{profile.serviceArea || 'Service area pending'}</p>
          <p>{humanize(profile.verificationStatus || 'pending')}</p>
          <h3>Active listings</h3>
          <div className="list-stack">
            {listings.map((listing) => <ListingLine key={getId(listing)} listing={listing} />)}
          </div>
        </InfoCard>
      </section>
    </>
  );
}
