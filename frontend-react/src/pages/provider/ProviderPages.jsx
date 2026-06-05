import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Power, Send, UserPlus } from 'lucide-react';
import { getFarmServiceListingById, getFarmServiceListings, createFarmServiceListing, setFarmServiceListingActive, updateFarmServiceListing } from '../../api/farmServiceListingsApi.js';
import { getProviderProfile, updateProviderProfile } from '../../api/providerApi.js';
import { completeServiceRequest, declineServiceRequest, getServiceRequestById, getServiceRequests, quoteServiceRequest } from '../../api/serviceRequestsApi.js';
import { roleHomePath } from '../../auth/roleRedirect.js';
import { useAuth } from '../../auth/useAuth.js';
import { MessagesPanel } from '../../components/common/MessagesPanel.jsx';
import { NotificationsPanel } from '../../components/common/NotificationsPanel.jsx';
import { InfoCard, MetricCard, PageHeader } from '../../components/common/Page.jsx';
import { EmptyState, ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { asArray, formatDate, formatMoney, getId, humanize } from '../../utils/format.js';

const LISTING_CATEGORIES = [
  'tractor',
  'tiller',
  'irrigation_pump',
  'delivery_truck',
  'fertilizer',
  'cold_storage',
  'soil_testing',
  'specialist_services',
];

const LISTING_TYPES = ['rental', 'service', 'transport', 'storage', 'input_supply', 'consultation', 'repair'];
const PRICING_TYPES = ['quote_required', 'fixed', 'per_hour', 'per_day', 'per_acre', 'per_kg', 'per_trip'];

function useProviderOverview() {
  return useAsyncData(async () => {
    const [profileResult, listingsResult, requestsResult] = await Promise.allSettled([
      getProviderProfile(),
      getFarmServiceListings({ mine: 'true' }),
      getServiceRequests(),
    ]);
    return {
      profile: profileResult.status === 'fulfilled' ? profileResult.value?.data || profileResult.value : null,
      listings: listingsResult.status === 'fulfilled' ? asArray(listingsResult.value) : [],
      requests: requestsResult.status === 'fulfilled' ? asArray(requestsResult.value) : [],
      errors: [profileResult, listingsResult, requestsResult].filter((result) => result.status === 'rejected').map((result) => result.reason?.message),
    };
  }, []);
}

function ProviderProfileForm({ profile = {}, onSaved }) {
  const [status, setStatus] = useState({ message: '', tone: 'info' });

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      await updateProviderProfile({
        businessName: formData.get('businessName'),
        businessType: formData.get('businessType'),
        serviceArea: formData.get('serviceArea'),
        location: formData.get('location'),
        publicEmail: formData.get('publicEmail'),
        publicPhone: formData.get('publicPhone'),
        website: formData.get('website'),
        contactPreference: formData.get('contactPreference'),
        serviceCategories: formData.get('serviceCategories'),
        operatingHours: formData.get('operatingHours'),
        bio: formData.get('bio'),
      });
      setStatus({ message: 'Provider profile saved.', tone: 'success' });
      onSaved?.();
    } catch (saveError) {
      setStatus({ message: saveError.message || 'Unable to save provider profile.', tone: 'error' });
    }
  }

  return (
    <form className="info-card compact-form" onSubmit={handleSubmit}>
      <h2>Business profile</h2>
      <label>Business name<input name="businessName" defaultValue={profile.businessName || ''} required /></label>
      <label>Business type<input name="businessType" defaultValue={profile.businessType || ''} /></label>
      <label>Service area<input name="serviceArea" defaultValue={profile.serviceArea || ''} required /></label>
      <label>Location<input name="location" defaultValue={profile.location || ''} /></label>
      <label>Public email<input type="email" name="publicEmail" defaultValue={profile.publicEmail || ''} /></label>
      <label>Public phone<input name="publicPhone" defaultValue={profile.publicPhone || ''} /></label>
      <label>Website<input type="url" name="website" defaultValue={profile.website || ''} /></label>
      <label>Contact preference<select name="contactPreference" defaultValue={profile.contactPreference || 'message'}><option value="message">Message</option><option value="phone">Phone</option><option value="email">Email</option><option value="message_or_phone">Message or phone</option></select></label>
      <label className="wide-field">Service categories<input name="serviceCategories" defaultValue={Array.isArray(profile.serviceCategories) ? profile.serviceCategories.join(', ') : ''} placeholder="tractor, delivery_truck" /></label>
      <label className="wide-field">Operating hours<input name="operatingHours" defaultValue={profile.operatingHours || ''} /></label>
      <label className="wide-field">Bio<textarea name="bio" rows="4" defaultValue={profile.bio || ''} /></label>
      <button className="primary-button" type="submit">Save provider profile</button>
      <StatusMessage message={status.message} tone={status.tone} />
    </form>
  );
}

function ListingForm({ listing = {}, onSaved }) {
  const [status, setStatus] = useState({ message: '', tone: 'info' });

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      title: formData.get('title'),
      category: formData.get('category'),
      listingType: formData.get('listingType'),
      pricingType: formData.get('pricingType'),
      price: formData.get('price'),
      unitLabel: formData.get('unitLabel'),
      serviceArea: formData.get('serviceArea'),
      availability: formData.get('availability'),
      description: formData.get('description'),
      equipmentDetails: formData.get('equipmentDetails'),
      termsSummary: formData.get('termsSummary'),
    };
    try {
      if (getId(listing)) {
        await updateFarmServiceListing(getId(listing), payload);
      } else {
        await createFarmServiceListing(payload);
      }
      setStatus({ message: 'Listing saved through the Farm Service Listings API.', tone: 'success' });
      onSaved?.();
    } catch (saveError) {
      setStatus({ message: saveError.message || 'Unable to save listing.', tone: 'error' });
    }
  }

  return (
    <form className="info-card compact-form" onSubmit={handleSubmit}>
      <h2>{getId(listing) ? 'Edit listing' : 'Create listing'}</h2>
      <label>Title<input name="title" defaultValue={listing.title || ''} required /></label>
      <label>Category<select name="category" defaultValue={listing.category || 'tractor'}>{LISTING_CATEGORIES.map((item) => <option key={item} value={item}>{humanize(item)}</option>)}</select></label>
      <label>Listing type<select name="listingType" defaultValue={listing.listingType || 'service'}>{LISTING_TYPES.map((item) => <option key={item} value={item}>{humanize(item)}</option>)}</select></label>
      <label>Pricing<select name="pricingType" defaultValue={listing.pricingType || 'quote_required'}>{PRICING_TYPES.map((item) => <option key={item} value={item}>{humanize(item)}</option>)}</select></label>
      <label>Price<input type="number" min="0" step="1" name="price" defaultValue={listing.price || 0} /></label>
      <label>Unit label<input name="unitLabel" defaultValue={listing.unitLabel || ''} /></label>
      <label>Service area<input name="serviceArea" defaultValue={listing.serviceArea || listing.provider?.serviceArea || ''} required /></label>
      <label>Availability<input name="availability" defaultValue={listing.availability || ''} /></label>
      <label className="wide-field">Description<textarea name="description" rows="4" defaultValue={listing.description || ''} required /></label>
      <label className="wide-field">Equipment details<textarea name="equipmentDetails" rows="3" defaultValue={listing.equipmentDetails || ''} /></label>
      <label className="wide-field">Terms summary<textarea name="termsSummary" rows="3" defaultValue={listing.termsSummary || ''} /></label>
      <button className="primary-button" type="submit">Save listing</button>
      <StatusMessage message={status.message} tone={status.tone} />
    </form>
  );
}

function ProviderRequestCard({ request }) {
  return (
    <article className="line-item">
      <div>
        <strong>{request.listing?.title || 'Service request'}</strong>
        <span>{humanize(request.status)} - {request.farmer?.name || 'Farmer'} - {formatDate(request.createdAt)}</span>
        <p>{request.needDescription || 'No need description returned.'}</p>
      </div>
      <div className="card-actions">
        <Link className="secondary-button" to={`/provider/requests/${encodeURIComponent(getId(request))}`}>Open</Link>
        {request.farmer?.id ? <Link className="secondary-button" to={`/provider/messages?recipientId=${encodeURIComponent(request.farmer.id)}&requestId=${encodeURIComponent(getId(request))}`}>Message</Link> : null}
      </div>
    </article>
  );
}

export function ProviderLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setBusy(true);
    setStatus({ message: 'Signing into Provider Portal...', tone: 'info' });
    try {
      const response = await login({ email: formData.get('email'), password: formData.get('password'), role: 'provider' });
      const user = response.user || response.data?.user || response.data;
      if (user?.role !== 'provider') {
        setStatus({ message: `Provider Portal access requires a provider account. This account is ${user?.role || 'unknown'}.`, tone: 'error' });
        return;
      }
      navigate(roleHomePath('provider'), { replace: true });
    } catch (error) {
      setStatus({ message: error.message || 'Unable to sign in.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-panel provider-auth-panel">
      <div className="auth-copy">
        <span className="eyebrow">Provider Portal</span>
        <h1>Sign in as a farm service provider</h1>
        <p>Provider accounts manage service listings, farmer requests and provider-to-farmer messages only.</p>
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <label>Email address<input type="email" name="email" autoComplete="email" required /></label>
        <label>Password<input type="password" name="password" autoComplete="current-password" required /></label>
        <button className="primary-button" type="submit" disabled={busy}><Power size={18} /><span>{busy ? 'Signing in' : 'Sign in'}</span></button>
        <StatusMessage message={status.message} tone={status.tone} />
        <div className="auth-links">
          <Link to="/provider/register">Create provider account</Link>
          <Link to="/login">Customer or farmer login</Link>
        </div>
      </form>
    </section>
  );
}

export function ProviderRegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [status, setStatus] = useState({ message: '', tone: 'info' });

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      await register({
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        role: 'provider',
      });
      setStatus({ message: 'Provider account created. Sign in to complete onboarding.', tone: 'success' });
      window.setTimeout(() => navigate('/provider/login'), 800);
    } catch (error) {
      setStatus({ message: error.message || 'Unable to create provider account.', tone: 'error' });
    }
  }

  return (
    <section className="auth-panel provider-auth-panel">
      <div className="auth-copy">
        <span className="eyebrow">Provider registration</span>
        <h1>Create provider account</h1>
        <p>Provider registration creates a provider role, separate from farmers and customers.</p>
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <label>Full name<input name="fullName" required /></label>
        <label>Email<input type="email" name="email" required /></label>
        <label>Phone<input name="phone" /></label>
        <label>Address<input name="address" /></label>
        <label>Password<input type="password" name="password" minLength={6} required /></label>
        <button className="primary-button" type="submit"><UserPlus size={18} /><span>Create provider account</span></button>
        <StatusMessage message={status.message} tone={status.tone} />
      </form>
    </section>
  );
}

export function ProviderDashboardPage() {
  const { data, loading, error } = useProviderOverview();
  const listings = data?.listings || [];
  const requests = data?.requests || [];
  const active = listings.filter((listing) => listing.isActive).length;
  const newRequests = requests.filter((request) => ['new', 'pending'].includes(request.status)).length;
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

function ListingLine({ listing, onToggle }) {
  return (
    <article className="line-item">
      <div>
        <strong>{listing.title}</strong>
        <span>{humanize(listing.category)} - {listing.pricingType === 'quote_required' ? 'Quote required' : formatMoney(listing.price)}</span>
      </div>
      <div className="card-actions">
        <span className={listing.isActive ? 'status-chip' : 'status-chip warn'}>{listing.isActive ? 'Active' : 'Inactive'}</span>
        <Link className="secondary-button" to={`/provider/listings/${encodeURIComponent(getId(listing))}/edit`}>Edit</Link>
        {onToggle ? (
          <button className="secondary-button" type="button" onClick={() => onToggle(listing)}>
            {listing.isActive ? 'Deactivate' : 'Activate'}
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function ProviderOnboardingPage() {
  const { data, loading, error, reload } = useAsyncData(getProviderProfile, []);
  const profile = data?.data || data || {};
  return (
    <>
      <PageHeader eyebrow="Onboarding" title="Set up provider business profile" text="Complete a real provider profile before publishing service listings." />
      {loading ? <LoadingState title="Loading provider profile" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <ProviderProfileForm profile={profile} onSaved={reload} />
    </>
  );
}

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

export function ProviderRequestsPage() {
  const { data, loading, error } = useAsyncData(getServiceRequests, []);
  const requests = asArray(data);

  return (
    <>
      <PageHeader eyebrow="Requests" title="Farmer service requests" text="Open real submitted requests, review field context, quote, decline or message the farmer." />
      {loading ? <LoadingState title="Loading requests" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <div className="list-stack">
        {requests.map((request) => <ProviderRequestCard key={getId(request)} request={request} />)}
      </div>
      {!loading && !requests.length ? <EmptyState title="No requests yet" text="Farmer requests for your listings will appear here." /> : null}
    </>
  );
}

export function ProviderRequestDetailPage() {
  const { requestId } = useParams();
  const { data, loading, error, reload } = useAsyncData(() => getServiceRequestById(requestId), [requestId]);
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const request = data?.data || data || {};

  async function quote(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      await quoteServiceRequest(requestId, {
        amount: formData.get('amount'),
        pricingType: formData.get('pricingType'),
        validUntil: formData.get('validUntil'),
        notes: formData.get('notes'),
      });
      setStatus({ message: 'Quote sent to farmer.', tone: 'success' });
      reload();
    } catch (quoteError) {
      setStatus({ message: quoteError.message || 'Unable to send quote.', tone: 'error' });
    }
  }

  async function act(action, success) {
    try {
      await action(requestId);
      setStatus({ message: success, tone: 'success' });
      reload();
    } catch (actionError) {
      setStatus({ message: actionError.message || 'Unable to update request.', tone: 'error' });
    }
  }

  return (
    <>
      <PageHeader eyebrow="Request detail" title={request.listing?.title || 'Review farmer request'} text="Provider request actions are limited to provider-owned service requests." />
      {loading ? <LoadingState title="Loading request" /> : null}
      {error ? <ErrorState text={error} /> : null}
      {!loading && !error ? (
        <section className="two-column">
          <InfoCard title="Request summary" text={request.needDescription}>
            <p>Status: {humanize(request.status)}</p>
            <p>Farmer: {request.farmer?.name || 'Farmer'}</p>
            <p>Farm location: {request.farmLocation || 'Not listed'}</p>
            <p>Budget: {formatMoney(request.budget, 'Budget pending')}</p>
            {request.quote ? <p>Current quote: {formatMoney(request.quote.amount)} - {humanize(request.quote.pricingType)}</p> : null}
            {request.farmer?.id ? <Link className="secondary-button" to={`/provider/messages?recipientId=${encodeURIComponent(request.farmer.id)}&requestId=${encodeURIComponent(requestId)}`}>Message farmer</Link> : null}
          </InfoCard>
          <form className="info-card compact-form" onSubmit={quote}>
            <h2>Send quote</h2>
            <label>Amount<input type="number" name="amount" min="1" step="1" required /></label>
            <label>Pricing<select name="pricingType" defaultValue="fixed"><option value="fixed">Fixed</option><option value="per_hour">Per hour</option><option value="per_day">Per day</option><option value="per_acre">Per acre</option></select></label>
            <label>Valid until<input type="date" name="validUntil" /></label>
            <label className="wide-field">Notes<textarea name="notes" rows="4" /></label>
            <div className="card-actions">
              <button className="primary-button" type="submit">Send quote</button>
              <button className="secondary-button" type="button" onClick={() => act(declineServiceRequest, 'Request declined.')}>Decline</button>
              <button className="secondary-button" type="button" onClick={() => act(completeServiceRequest, 'Request marked complete.')}>Mark complete</button>
            </div>
          </form>
        </section>
      ) : null}
      <StatusMessage message={status.message} tone={status.tone} />
    </>
  );
}

export function ProviderMessagesPage() {
  return (
    <>
      <PageHeader eyebrow="Messages" title="Farmer conversations" text="Provider messages use the real Messages API and can include related service request context." />
      <MessagesPanel title="Provider conversations" emptyText="Provider conversations with farmers will appear here." />
    </>
  );
}

export function ProviderNotificationsPage() {
  return (
    <>
      <PageHeader eyebrow="Notifications" title="Provider updates" text="Request workflow and message notifications load from the Notifications API." />
      <NotificationsPanel emptyText="Provider request and message notifications will appear here." />
    </>
  );
}

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

export function ProviderSettingsPage() {
  const { data, loading, error } = useAsyncData(getProviderProfile, []);
  const profile = data?.data || data || {};

  return (
    <>
      <PageHeader eyebrow="Settings" title="Account and platform status" text="Provider settings keep account facts separate from unconnected platform capabilities." />
      {loading ? <LoadingState title="Loading settings" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <section className="card-grid">
        <InfoCard title="Account role" text="This route requires role === provider." />
        <InfoCard title="Onboarding" text={profile.isOnboarded ? 'Provider profile is onboarded.' : 'Complete business name and service area before publishing listings.'} />
        <InfoCard title="Pending features" text="Payments, payouts, ratings, reviews and service media uploads are not connected yet." />
      </section>
    </>
  );
}

export function ProviderHelpPage() {
  return (
    <>
      <PageHeader eyebrow="Help" title="Provider workflow guide" text="Use the portal to publish farm support services and manage real farmer requests." />
      <section className="card-grid">
        <InfoCard title="Listings" text="Create listings for rentals, transport, storage, inputs, consultation or repair." />
        <InfoCard title="Requests" text="Review farmer requests, quote or decline, and mark accepted work complete after service delivery." />
        <InfoCard title="Pending platform features" text="Payments, verification review, ratings and media uploads are still pending." />
      </section>
    </>
  );
}
