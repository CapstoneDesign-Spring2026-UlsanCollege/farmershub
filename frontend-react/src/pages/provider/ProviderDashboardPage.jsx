import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  MessageCircle,
  PackageCheck,
  Plus,
  ShieldCheck,
  Tractor,
  Truck,
  UserRound,
  Wrench,
} from 'lucide-react';
import { InfoCard, MetricCard } from '../../components/common/Page.jsx';
import { RoleHero } from '../../components/common/RoleHero.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { formatMoney, getId, humanize, resolveMediaUrl } from '../../utils/format.js';
import { homeImage } from '../../utils/assets.js';
import { useProviderOverview } from './hooks/useProviderOverview.js';

const previewListings = [
  { title: 'Tractor Rental', category: 'Equipment', price: 45000, unit: 'day', image: homeImage('service-equipment.webp'), status: 'Preview' },
  { title: 'Farm Produce Delivery', category: 'Logistics', price: 120, unit: 'km', image: homeImage('service-delivery.webp'), status: 'Preview' },
  { title: 'NPK Fertilizer Supply', category: 'Inputs', price: 28000, unit: '50kg', image: homeImage('service-fertilizer.webp'), status: 'Preview' },
  { title: 'Agri Loan Facilitation', category: 'Finance', price: 0, unit: 'quote', image: homeImage('service-loan.webp'), status: 'Preview' },
];

const previewRequests = [
  { title: 'Tractor Needed for 5 Acres', location: 'Ogbomosho, Oyo State', status: 'Preview', icon: Tractor },
  { title: 'Fertilizer Delivery', location: 'Abeokuta, Ogun State', status: 'Preview', icon: PackageCheck },
  { title: 'Maize Transport to Market', location: 'Ibadan, Oyo State', status: 'Preview', icon: Truck },
];

function listingImage(listing = {}, index) {
  const resolved = resolveMediaUrl(listing.imageUrl || listing.image || '');
  if (resolved) return resolved;
  const fallback = [homeImage('service-equipment.webp'), homeImage('service-delivery.webp'), homeImage('service-fertilizer.webp'), homeImage('service-loan.webp')];
  return fallback[index % fallback.length];
}

function ProviderListingCard({ listing, index }) {
  const id = getId(listing);
  const price = listing.pricingType === 'quote_required' || listing.unit === 'quote'
    ? 'Quote required'
    : `${formatMoney(listing.price)}${listing.unit ? ` / ${listing.unit}` : ''}`;

  return (
    <article className="provider-listing-card">
      <div className="provider-listing-image">
        <img src={listingImage(listing, index)} alt={listing.title || 'Farm service'} />
        <StatusBadge label={humanize(listing.category || 'Service')} tone="blue" />
      </div>
      <div>
        <h3>{listing.title || listing.name || 'Farm service'}</h3>
        <p>{listing.description || 'Reliable farm support service.'}</p>
        <strong>{price}</strong>
        <span className="availability-dot">Available</span>
      </div>
      <div className="card-actions">
        {id ? <Link className="secondary-button" to={`/provider/listings/${encodeURIComponent(id)}/edit`}>Edit</Link> : <button className="secondary-button" type="button" disabled>Preview</button>}
        <Link className="primary-button" to="/provider/listings">Manage</Link>
      </div>
    </article>
  );
}

function RequestLine({ request }) {
  const Icon = request.icon || Tractor;
  return (
    <article className="incoming-request-row">
      <span className="request-icon"><Icon size={20} /></span>
      <div>
        <strong>{request.title || request.serviceTitle || request.listing?.title || 'Service request'}</strong>
        <p>{request.location || request.farmLocation || request.description || 'Location pending'}</p>
      </div>
      <StatusBadge label={humanize(request.status || 'New')} tone={request.status === 'Preview' ? 'gold' : 'blue'} />
    </article>
  );
}

function OnboardingCard({ profile }) {
  const completion = profile?.completion || profile?.completionPercent || 80;
  const items = [
    ['Business Information', true],
    ['Identity Verification', true],
    ['Service Areas', true],
    ['Bank Details', false],
    ['Tax Information', false],
  ];

  return (
    <InfoCard className="provider-onboarding-card" title="Provider Onboarding" actions={<Link to="/provider/onboarding">View</Link>}>
      <div className="onboarding-progress">
        <div className="progress-ring" style={{ '--progress': `${completion}%` }}>
          <strong>{completion}%</strong>
          <span>Complete</span>
        </div>
        <div className="onboarding-checklist">
          {items.map(([label, done], index) => (
            <span key={label} className={done ? 'done' : ''}>
              {done ? <CheckCircle2 size={17} /> : <span>{index + 1}</span>}
              {label}
            </span>
          ))}
        </div>
      </div>
      <Link className="primary-button full-width-button" to="/provider/onboarding">Complete Now</Link>
    </InfoCard>
  );
}

export function ProviderDashboardPage() {
  const { data, loading, error } = useProviderOverview();
  const listings = data?.listings || [];
  const requests = data?.requests || [];
  const active = listings.filter((listing) => listing.isActive !== false).length;
  const newRequests = requests.filter((request) => request.status === 'new').length;
  const visibleListings = listings.length ? listings.slice(0, 6) : previewListings;
  const visibleRequests = requests.length ? requests.slice(0, 3) : previewRequests;
  const profile = data?.profile || {};

  return (
    <div className="dashboard-page provider-dashboard-page">
      <section className="dashboard-main-grid provider-grid">
        <div className="dashboard-primary">
          <RoleHero
            className="provider-hero"
            eyebrow={profile.businessName || 'Trusted provider'}
            title="Powering Farmers. Delivering Solutions."
            text="Offer reliable services, grow your reputation, and get more jobs from farmers near you."
            actions={(
              <>
                <Link className="primary-button" to="/provider/listings/new"><Plus size={18} /><span>Add New Listing</span></Link>
                <Link className="secondary-button" to="/provider/requests"><ClipboardList size={18} /><span>View Requests</span></Link>
              </>
            )}
            visual={(
              <>
                <img src={homeImage('service-equipment.webp')} alt="Farm tractor service" />
                <span className="trusted-provider-seal"><BadgeCheck size={18} /> Trusted Provider</span>
              </>
            )}
          />
          {loading ? <LoadingState title="Loading provider workspace" /> : null}
          {error ? <ErrorState text={error} /> : null}
          {data?.errors?.length ? <StatusMessage message="Some live provider data is unavailable right now." tone="error" /> : null}
          <section className="metric-grid provider-metrics">
            <MetricCard label="Active Listings" value={active || 'Preview'} text={active ? 'Visible to farmers' : 'Awaiting listings'} icon={<BriefcaseBusiness size={22} />} tone="blue" />
            <MetricCard label="Incoming Requests" value={requests.length || 'Preview'} text={requests.length ? `${newRequests} new requests` : 'Awaiting backend'} icon={<ClipboardList size={22} />} tone="green" />
            <MetricCard label="Unread Messages" value="Pending" text="Messages API connected" icon={<MessageCircle size={22} />} tone="blue" />
            <MetricCard label="Completed Jobs" value="Pending" text="Awaiting job workflow" icon={<CheckCircle2 size={22} />} tone="green" />
            <MetricCard label="Profile Completion" value={`${profile.completion || profile.completionPercent || 80}%`} text="Onboarding progress" icon={<UserRound size={22} />} tone="blue" />
          </section>
          <InfoCard
            className="provider-listings-panel"
            title="My Listings"
            actions={<Link className="text-link" to="/provider/listings">View all <ArrowRight size={16} /></Link>}
          >
            <div className="provider-listings-grid">
              {visibleListings.map((listing, index) => <ProviderListingCard key={getId(listing) || listing.title} listing={listing} index={index} />)}
            </div>
            {!listings.length ? (
              <div className="add-listing-row">
                <span><Plus size={20} /></span>
                <div>
                  <strong>Do not see your service?</strong>
                  <p>Add a new listing and start getting more requests.</p>
                </div>
                <Link className="secondary-button" to="/provider/listings/new">Add New Listing</Link>
              </div>
            ) : null}
          </InfoCard>
        </div>
        <aside className="dashboard-right-rail provider-right-rail">
          <OnboardingCard profile={profile} />
          <InfoCard className="incoming-requests-card" title="Incoming Requests" actions={<Link to="/provider/requests">View all</Link>}>
            <div className="list-stack">
              {visibleRequests.map((request) => <RequestLine key={getId(request) || request.title} request={request} />)}
            </div>
          </InfoCard>
          <InfoCard className="provider-notifications-card" title="Messages and Notifications" actions={<Link to="/provider/messages">View all</Link>}>
            <div className="mini-message-list">
              <article>
                <span className="avatar avatar-small"><MessageCircle size={17} /></span>
                <div><strong>Farmer conversations</strong><p>Open Messages to load real service chats.</p></div>
              </article>
              <article>
                <span className="avatar avatar-small"><ShieldCheck size={17} /></span>
                <div><strong>System Notification</strong><p>Your profile progress is ready for onboarding.</p></div>
              </article>
            </div>
          </InfoCard>
          <InfoCard className="provider-growth-card">
            <Wrench size={34} />
            <h2>Grow Your Business</h2>
            <p>Complete onboarding to unlock stronger visibility and trust signals.</p>
            <Link className="primary-button" to="/provider/onboarding">Upgrade Now</Link>
          </InfoCard>
        </aside>
      </section>
    </div>
  );
}
