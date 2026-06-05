import { Link } from 'react-router-dom';
import { BadgeCheck, BriefcaseBusiness, ClipboardList, Settings, ShieldCheck } from 'lucide-react';
import { getFarmServiceListings } from '../../api/farmServiceListingsApi.js';
import { getProviderProfile } from '../../api/providerApi.js';
import { InfoCard } from '../../components/common/Page.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { ErrorState, LoadingState } from '../../components/common/States.jsx';
import { ProfileAbout } from '../../components/profile/ProfileAbout.jsx';
import { ProfileHeader } from '../../components/profile/ProfileHeader.jsx';
import { ProfileServices } from '../../components/profile/ProfileServices.jsx';
import { ProfileStats } from '../../components/profile/ProfileStats.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { asArray, humanize, resolveMediaUrl } from '../../utils/format.js';
import { homeImage } from '../../utils/assets.js';
import { ProviderProfileForm } from './components/ProviderProfileForm.jsx';

function useProviderProfile() {
  return useAsyncData(async () => {
    const [profileResult, listingsResult] = await Promise.allSettled([
      getProviderProfile(),
      getFarmServiceListings({ mine: 'true', status: 'active' }),
    ]);
    return {
      profile: profileResult.status === 'fulfilled' ? profileResult.value?.data || profileResult.value : {},
      listings: listingsResult.status === 'fulfilled' ? asArray(listingsResult.value) : [],
      errors: [profileResult, listingsResult].filter((result) => result.status === 'rejected').map((result) => result.reason?.message),
    };
  }, []);
}

export function ProviderProfilePage() {
  const { data, loading, error, reload } = useProviderProfile();
  const profile = data?.profile || {};
  const listings = data?.listings || [];
  const businessName = profile.businessName || 'Provider profile';

  return (
    <div className="profile-page provider-profile-page">
      {loading ? <LoadingState title="Loading profile" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <ProfileHeader
        role="provider"
        name={businessName}
        subtitle={profile.bio || 'Professional farm service provider profile for farmer requests and service listings.'}
        location={profile.serviceArea || profile.location || 'Service area pending'}
        avatarUrl={resolveMediaUrl(profile.avatarUrl || profile.logoUrl || '')}
        coverUrl={homeImage('service-equipment.webp')}
        badge="Verified Provider"
        actions={(
          <>
            <Link className="primary-button" to="/provider/listings/new"><BriefcaseBusiness size={18} /> Add listing</Link>
            <Link className="secondary-button" to="/provider/settings"><Settings size={18} /> Settings</Link>
          </>
        )}
      />
      <ProfileStats
        stats={[
          { label: 'Services', value: listings.length, text: 'Active listings' },
          { label: 'Bookings', value: 'Pending', text: 'Job workflow pending' },
          { label: 'Rating', value: profile.rating || '4.9', text: 'Public trust preview' },
          { label: 'Reviews', value: profile.reviews || 'Pending', text: 'Reviews backend pending' },
        ]}
      />
      <section className="profile-layout">
        <div className="profile-main-column">
          <ProfileAbout
            title="Business Details"
            text={profile.bio || 'Provider business details help farmers understand service coverage, verification, and availability.'}
            details={[
              { label: 'Business type', value: profile.businessType || 'Farm services' },
              { label: 'Service area', value: profile.serviceArea || 'Pending' },
              { label: 'Verification', value: humanize(profile.verificationStatus || 'pending') },
            ]}
          />
          <ProfileServices
            services={listings}
            emptyText="Active provider services will appear after listings are created."
            detailPath={(id) => `/provider/listings/${encodeURIComponent(id)}/edit`}
            action={{ to: '/provider/listings', label: 'Manage listings' }}
          />
        </div>
        <aside className="profile-side-column">
          <ProviderProfileForm profile={profile} onSaved={reload} />
          <InfoCard className="profile-action-card provider-completion-card" title="Profile Completion">
            <div className="profile-mini-list">
              <article><BadgeCheck size={18} /><div><strong>Business Information</strong><p>Core details are used in public provider cards.</p></div><StatusBadge label="Ready" tone="blue" /></article>
              <article><ShieldCheck size={18} /><div><strong>Identity Verification</strong><p>{humanize(profile.verificationStatus || 'pending')}</p></div><StatusBadge label={humanize(profile.verificationStatus || 'pending')} tone="gold" /></article>
              <article><ClipboardList size={18} /><div><strong>Service Areas</strong><p>{profile.serviceArea || 'Add service area during onboarding.'}</p></div><Link className="secondary-button" to="/provider/onboarding">Open</Link></article>
            </div>
          </InfoCard>
        </aside>
      </section>
    </div>
  );
}
