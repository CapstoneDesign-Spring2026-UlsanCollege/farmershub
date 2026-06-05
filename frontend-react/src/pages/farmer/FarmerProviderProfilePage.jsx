import { Link, useParams } from 'react-router-dom';
import { MessageCircle, ShieldCheck, Wrench } from 'lucide-react';
import { getProviderPublicProfile } from '../../api/providerApi.js';
import { InfoCard } from '../../components/common/Page.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { ErrorState, LoadingState } from '../../components/common/States.jsx';
import { ProfileAbout } from '../../components/profile/ProfileAbout.jsx';
import { ProfileHeader } from '../../components/profile/ProfileHeader.jsx';
import { ProfileServices } from '../../components/profile/ProfileServices.jsx';
import { ProfileStats } from '../../components/profile/ProfileStats.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { humanize, resolveMediaUrl } from '../../utils/format.js';
import { homeImage } from '../../utils/assets.js';

export function FarmerProviderProfilePage() {
  const { providerId } = useParams();
  const { data, loading, error } = useAsyncData(() => getProviderPublicProfile(providerId), [providerId]);
  const profile = data?.data?.profile || data?.profile || {};
  const listings = data?.data?.listings || data?.listings || [];
  const businessName = profile.businessName || 'Provider profile';

  return (
    <div className="profile-page farmer-facing-provider-profile">
      {loading ? <LoadingState title="Loading provider" /> : null}
      {error ? <ErrorState text={error} /> : null}
      {!loading && !error ? (
        <>
          <ProfileHeader
            role="provider"
            name={businessName}
            subtitle={profile.bio || 'Farmer-facing provider profile for service details, contact, and requests.'}
            location={profile.serviceArea || 'Service area pending'}
            avatarUrl={resolveMediaUrl(profile.avatarUrl || profile.logoUrl || '')}
            coverUrl={homeImage('service-equipment.webp')}
            badge="Verified Provider"
            actions={(
              <>
                <Link className="primary-button" to={`/farmer/provider-messages?recipientId=${encodeURIComponent(providerId)}&recipientName=${encodeURIComponent(businessName)}&recipientRole=provider`}><MessageCircle size={18} /> Contact provider</Link>
                <Link className="secondary-button" to="/farmer/services"><Wrench size={18} /> Browse services</Link>
              </>
            )}
          />
          <ProfileStats
            stats={[
              { label: 'Services', value: listings.length, text: 'Active listings' },
              { label: 'Bookings', value: 'Pending', text: 'Booking workflow pending' },
              { label: 'Rating', value: profile.rating || '4.9', text: 'Provider trust preview' },
              { label: 'Reviews', value: profile.reviews || 'Pending', text: 'Reviews backend pending' },
            ]}
          />
          <section className="profile-layout">
            <div className="profile-main-column">
              <ProfileAbout
                title="About Provider"
                text={profile.bio || 'This provider profile shows farmer-safe service details and request actions.'}
                details={[
                  { label: 'Business type', value: profile.businessType || 'Farm services' },
                  { label: 'Service area', value: profile.serviceArea || 'Pending' },
                  { label: 'Verification', value: humanize(profile.verificationStatus || 'pending') },
                ]}
              />
              <ProfileServices
                services={listings}
                emptyText="Provider public services will appear when listings are returned."
                detailPath={(id) => `/farmer/services/${encodeURIComponent(id)}`}
                requestPath={(id) => `/farmer/service-request/${encodeURIComponent(id)}`}
              />
            </div>
            <aside className="profile-side-column">
              <InfoCard className="profile-action-card" title="Provider Actions">
                <div className="profile-mini-list">
                  <article><MessageCircle size={18} /><div><strong>Message provider</strong><p>Start a service conversation.</p></div><Link className="secondary-button" to={`/farmer/provider-messages?recipientId=${encodeURIComponent(providerId)}&recipientName=${encodeURIComponent(businessName)}&recipientRole=provider`}>Message</Link></article>
                  <article><Wrench size={18} /><div><strong>Request service</strong><p>Choose a listing to send a request.</p></div><Link className="secondary-button" to="/farmer/services">Browse</Link></article>
                  <article><ShieldCheck size={18} /><div><strong>Verification</strong><p>Backend verification status is shown when available.</p></div><StatusBadge label={humanize(profile.verificationStatus || 'pending')} tone="blue" /></article>
                </div>
              </InfoCard>
            </aside>
          </section>
        </>
      ) : null}
    </div>
  );
}
