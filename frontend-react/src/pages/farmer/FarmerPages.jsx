import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, Power, Send } from 'lucide-react';
import { getFarmers } from '../../api/farmersApi.js';
import { getFarmServiceListingById, getFarmServiceListings } from '../../api/farmServiceListingsApi.js';
import { getMessages } from '../../api/messagesApi.js';
import { createPost, getPosts } from '../../api/postsApi.js';
import { createProduct, deleteProduct, getProducts } from '../../api/productsApi.js';
import { getProfile, updateProfile } from '../../api/profileApi.js';
import { getProviderPublicProfile } from '../../api/providerApi.js';
import {
  acceptServiceRequestQuote,
  cancelServiceRequest,
  createServiceRequest,
  getServiceRequests,
} from '../../api/serviceRequestsApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { MessagesPanel } from '../../components/common/MessagesPanel.jsx';
import { NotificationsPanel } from '../../components/common/NotificationsPanel.jsx';
import { InfoCard, MetricCard, PageHeader } from '../../components/common/Page.jsx';
import { ProductCard } from '../../components/common/ProductCard.jsx';
import { EmptyState, ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { asArray, formatDate, formatMoney, getId, humanize } from '../../utils/format.js';

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

function useFarmerOverview(userId) {
  return useAsyncData(async () => {
    const [profileResult, productsResult, farmersResult, postsResult, requestsResult] = await Promise.allSettled([
      getProfile(),
      getProducts(userId ? { farmerId: userId } : {}),
      getFarmers(),
      getPosts(),
      getServiceRequests(),
    ]);
    return {
      profile: profileResult.status === 'fulfilled' ? profileResult.value?.data || profileResult.value : null,
      products: productsResult.status === 'fulfilled' ? asArray(productsResult.value) : [],
      farmers: farmersResult.status === 'fulfilled' ? asArray(farmersResult.value) : [],
      posts: postsResult.status === 'fulfilled' ? asArray(postsResult.value) : [],
      requests: requestsResult.status === 'fulfilled' ? asArray(requestsResult.value) : [],
      errors: [profileResult, productsResult, farmersResult, postsResult, requestsResult].filter((result) => result.status === 'rejected').map((result) => result.reason?.message),
    };
  }, [userId]);
}

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

function ServiceRequestCard({ request, actions }) {
  const id = getId(request);
  return (
    <article className="line-item">
      <div>
        <strong>{request.listing?.title || 'Service request'}</strong>
        <span>{humanize(request.status)} - {request.provider?.businessName || request.provider?.name || 'Provider'} - {formatDate(request.createdAt)}</span>
        <p>{request.needDescription || request.notes || 'Request details pending.'}</p>
      </div>
      <div className="card-actions">
        <Link className="secondary-button" to={`/farmer/service-request/${encodeURIComponent(request.listing?.id || '')}?requestId=${encodeURIComponent(id)}`}>Open</Link>
        {request.provider?.id ? <Link className="secondary-button" to={`/farmer/provider-messages?recipientId=${encodeURIComponent(request.provider.id)}&requestId=${encodeURIComponent(id)}`}>Message</Link> : null}
        {actions?.(request)}
      </div>
    </article>
  );
}

export function FarmerDashboardPage() {
  const { user } = useAuth();
  const userId = user?.id || user?._id;
  const { data, loading, error } = useFarmerOverview(userId);
  const products = data?.products || [];
  const posts = data?.posts || [];
  const requests = data?.requests || [];
  const lowStock = products.filter((product) => Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 5).length;

  return (
    <>
      <PageHeader
        eyebrow="Farmer application"
        title={`Welcome${data?.profile?.farmName ? ` to ${data.profile.farmName}` : ''}`}
        text="Manage farm products, buyer messages and provider service requests without entering customer shopping UI."
        actions={<Link className="primary-button" to="/farmer/products"><Plus size={18} /><span>Manage products</span></Link>}
      />
      {loading ? <LoadingState title="Loading farmer workspace" /> : null}
      {error ? <ErrorState text={error} /> : null}
      {data?.errors?.length ? <StatusMessage message={data.errors.join(' ')} tone="error" /> : null}
      <section className="metric-grid">
        <MetricCard label="Products" value={products.length} text="Owned product listings" />
        <MetricCard label="Low stock" value={lowStock} text="Listing stock of 5 or less" />
        <MetricCard label="Service requests" value={requests.length} text="Farmer-provider requests" />
        <MetricCard label="Farm updates" value={posts.length} text="Public posts returned by API" />
      </section>
      <section className="section-heading"><div><h2>Your products</h2><p>Real product listings attached to your farmer account.</p></div><Link className="secondary-button" to="/farmer/inventory">Inventory</Link></section>
      <div className="card-grid">
        {products.slice(0, 4).map((product) => <ProductCard key={getId(product)} product={product} />)}
      </div>
      {!loading && !products.length ? <EmptyState title="No products listed yet" text="Use Products to add crops before inventory and dashboard cards can summarize them." /> : null}
      <section className="card-grid">
        <InfoCard title="Orders status" text="Order fulfillment remains pending because the backend does not expose a full farmer order workflow yet." />
        <InfoCard title="Provider services" text="Farm services use real provider listings and service request APIs." />
        <InfoCard title="Farm feed" text="Farmers have a farmer-only feed route in React, avoiding the old customer social-feed route leak." />
      </section>
    </>
  );
}

export function FarmerProductsPage() {
  const { user } = useAuth();
  const userId = user?.id || user?._id;
  const { data, loading, error, reload } = useAsyncData(() => getProducts(userId ? { farmerId: userId } : {}), [userId]);
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const products = asArray(data);

  async function handleCreate(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get('image');
    if (file?.size) {
      formData.set('images', file);
    }
    formData.delete('image');
    try {
      await createProduct(formData);
      form.reset();
      setStatus({ message: 'Product created through the Products API.', tone: 'success' });
      reload();
    } catch (createError) {
      setStatus({ message: createError.message || 'Unable to create product.', tone: 'error' });
    }
  }

  async function handleDelete(id) {
    try {
      await deleteProduct(id);
      setStatus({ message: 'Product deleted.', tone: 'success' });
      reload();
    } catch (deleteError) {
      setStatus({ message: deleteError.message || 'Unable to delete product.', tone: 'error' });
    }
  }

  return (
    <>
      <PageHeader eyebrow="Products" title="Manage farm product listings" text="This page uses the real Products API and does not render customer cart or provider controls." />
      <StatusMessage message={status.message} tone={status.tone} />
      <section className="two-column">
        <form className="info-card compact-form" onSubmit={handleCreate}>
          <h2>Add product</h2>
          <label>Name<input name="name" required /></label>
          <label>Category<input name="category" placeholder="vegetables" required /></label>
          <label>Selling price<input name="sellingPrice" type="number" min="0" step="1" required /></label>
          <label>Stock<input name="stock" type="number" min="0" step="1" defaultValue="0" /></label>
          <label>Unit<input name="unit" defaultValue="kg" /></label>
          <label className="wide-field">Description<textarea name="description" rows="4" /></label>
          <label className="wide-field">Image<input name="image" type="file" accept="image/*" /></label>
          <button className="primary-button" type="submit"><Plus size={17} /><span>Create product</span></button>
        </form>
        <article className="info-card">
          <h2>Listing truth</h2>
          <p>Inventory, dashboard stock and marketplace availability are currently derived from these product records. Full order-based stock history is pending.</p>
        </article>
      </section>
      {loading ? <LoadingState title="Loading products" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <div className="list-stack">
        {products.map((product) => (
          <article className="line-item" key={getId(product)}>
            <div>
              <strong>{product.name}</strong>
              <span>{formatMoney(product.price || product.sellingPrice)} - Stock {product.stock ?? 'not listed'} {product.unit || ''}</span>
              <p>{product.description || 'No description.'}</p>
            </div>
            <button className="secondary-button" type="button" onClick={() => handleDelete(getId(product))}>Delete</button>
          </article>
        ))}
      </div>
      {!loading && !products.length ? <EmptyState title="No products listed yet" text="Create a product to publish it to the marketplace." /> : null}
    </>
  );
}

export function FarmerInventoryPage() {
  const { user } = useAuth();
  const userId = user?.id || user?._id;
  const { data, loading, error } = useAsyncData(() => getProducts(userId ? { farmerId: userId } : {}), [userId]);
  const products = asArray(data);
  const totalStock = products.reduce((sum, item) => sum + Number(item.stock || 0), 0);

  return (
    <>
      <PageHeader eyebrow="Inventory" title="Inventory from current listings" text="Stock is summarized from product listing records. Full inventory history and automatic order-based stock changes remain pending." />
      <section className="metric-grid">
        <MetricCard label="Listings checked" value={products.length} text="Products API" />
        <MetricCard label="Total listed stock" value={totalStock} text="Across returned listings" />
      </section>
      {loading ? <LoadingState title="Loading inventory" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <div className="list-stack">
        {products.map((product) => (
          <article className="line-item" key={getId(product)}>
            <div><strong>{product.name}</strong><span>{product.stock ?? 'Stock not listed'} {product.unit || ''}</span></div>
            <span className={Number(product.stock || 0) <= 5 ? 'status-chip warn' : 'status-chip'}>{Number(product.stock || 0) <= 5 ? 'Low stock' : 'Listed'}</span>
          </article>
        ))}
      </div>
    </>
  );
}

export function FarmerMessagesPage() {
  return (
    <>
      <PageHeader eyebrow="Messages" title="Buyer and farm conversations" text="Messages use the real shared Messages API inside the farmer workspace." />
      <MessagesPanel title="Farmer conversations" emptyText="Buyer and farmer messages will appear here when conversations exist." />
    </>
  );
}

export function FarmerCustomersPage() {
  const { data, loading, error } = useAsyncData(getMessages, []);
  const conversations = asArray(data);
  return (
    <>
      <PageHeader eyebrow="Customers" title="Customer visibility is message-based for now" text="There is no complete customer order model yet, so this page summarizes message conversations without inventing a customer CRM." />
      {loading ? <LoadingState title="Loading conversations" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <section className="metric-grid">
        <MetricCard label="Conversations" value={conversations.length} text="From Messages API" />
        <MetricCard label="Order-backed customers" value="Pending" text="Requires real orders backend" />
      </section>
    </>
  );
}

export function FarmerOrdersPage() {
  return (
    <>
      <PageHeader eyebrow="Orders" title="Order fulfillment is pending backend support" text="The current backend has product order request notification behavior, but no full farmer order inbox, status workflow, or payment settlement." />
      <EmptyState title="No farmer order list shown" text="React keeps this honest until a real Order model and farmer order API exist." />
    </>
  );
}

export function FarmerAnalyticsPage() {
  return (
    <>
      <PageHeader eyebrow="Analytics" title="Analytics pending real order and payment data" text="Product counts can be summarized, but revenue, conversion and fulfillment charts require connected order/payment APIs." />
      <section className="card-grid">
        <InfoCard title="Available now" text="Product listing counts, stock summaries and message counts." />
        <InfoCard title="Deferred" text="Revenue, repeat customers, checkout conversion and settlement analytics." />
      </section>
    </>
  );
}

export function FarmerPaymentsPage() {
  return (
    <>
      <PageHeader eyebrow="Payments" title="Payments are not connected" text="The React migration does not claim payouts, checkout or payment history until backend support exists." />
      <EmptyState title="Payment workflow pending" text="Provider and farmer service payments are also not connected yet." />
    </>
  );
}

export function FarmerSettingsPage() {
  const { data, loading, error, reload } = useAsyncData(getProfile, []);
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const profile = data?.data || data || {};

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      await updateProfile({
        fullName: formData.get('fullName'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        bio: formData.get('bio'),
        location: formData.get('location'),
        farmName: formData.get('farmName'),
        products: formData.get('products'),
        cropTypes: String(formData.get('cropTypes') || '').split(',').map((item) => item.trim()).filter(Boolean),
      });
      setStatus({ message: 'Farmer settings saved.', tone: 'success' });
      reload();
    } catch (saveError) {
      setStatus({ message: saveError.message || 'Unable to save settings.', tone: 'error' });
    }
  }

  return (
    <>
      <PageHeader eyebrow="Settings" title="Farmer account and farm settings" text="These settings update farmer-safe profile fields only." />
      {loading ? <LoadingState title="Loading settings" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <form className="info-card compact-form" onSubmit={handleSubmit}>
        <label>Full name<input name="fullName" defaultValue={profile.fullName || profile.name || ''} /></label>
        <label>Phone<input name="phone" defaultValue={profile.phone || ''} /></label>
        <label>Address<input name="address" defaultValue={profile.address || ''} /></label>
        <label>Farm name<input name="farmName" defaultValue={profile.farmName || ''} /></label>
        <label>Location<input name="location" defaultValue={profile.location || profile.farmLocation || ''} /></label>
        <label>Products grown<input name="products" defaultValue={profile.products || ''} /></label>
        <label>Crop types<input name="cropTypes" defaultValue={Array.isArray(profile.cropTypes) ? profile.cropTypes.join(', ') : ''} /></label>
        <label className="wide-field">Bio<textarea name="bio" rows="4" defaultValue={profile.bio || ''} /></label>
        <button className="primary-button" type="submit">Save farmer settings</button>
      </form>
      <StatusMessage message={status.message} tone={status.tone} />
    </>
  );
}

export function FarmerProfilePage() {
  const { data, loading, error, reload } = useAsyncData(getProfile, []);
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const profile = data?.data || data || {};

  async function handlePost(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get('image');
    if (file?.size) formData.set('images', file);
    formData.delete('image');
    try {
      await createPost(formData);
      form.reset();
      setStatus({ message: 'Farm update published through the Posts API.', tone: 'success' });
      reload();
    } catch (postError) {
      setStatus({ message: postError.message || 'Unable to publish post.', tone: 'error' });
    }
  }

  return (
    <>
      <PageHeader eyebrow="Farm profile" title={profile.farmName || profile.fullName || 'Farmer profile'} text="Manage public farmer identity and publish farmer-owned updates." />
      {loading ? <LoadingState title="Loading profile" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <section className="metric-grid">
        <MetricCard label="Role" value={profile.role || 'farmer'} text="Farmer private workspace" />
        <MetricCard label="Products" value={profile.products || 'Not listed'} text="Profile products label" />
        <MetricCard label="Location" value={profile.location || profile.address || 'Not set'} text="Public profile context" />
      </section>
      <form className="info-card compact-form" onSubmit={handlePost}>
        <h2>Publish farm update</h2>
        <label className="wide-field">Update<textarea name="content" rows="4" placeholder="Share a farm update, harvest note or product announcement..." /></label>
        <label className="wide-field">Image<input type="file" name="image" accept="image/*" /></label>
        <button className="primary-button" type="submit"><Send size={17} /><span>Publish update</span></button>
      </form>
      <StatusMessage message={status.message} tone={status.tone} />
    </>
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

export function FarmerServiceRequestPage() {
  const { listingId } = useParams();
  const { data, loading, error } = useAsyncData(() => getFarmServiceListingById(listingId), [listingId]);
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const listing = data?.data || data || {};

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      await createServiceRequest({
        listingId,
        farmLocation: formData.get('farmLocation'),
        needDescription: formData.get('needDescription'),
        preferredStartDate: formData.get('preferredStartDate'),
        preferredEndDate: formData.get('preferredEndDate'),
        acreageOrQuantity: formData.get('acreageOrQuantity'),
        budget: formData.get('budget'),
        contactPreference: formData.get('contactPreference'),
        notes: formData.get('notes'),
      });
      event.currentTarget.reset();
      setStatus({ message: 'Service request submitted to the provider.', tone: 'success' });
    } catch (requestError) {
      setStatus({ message: requestError.message || 'Unable to submit request.', tone: 'error' });
    }
  }

  return (
    <>
      <PageHeader eyebrow="Service request" title={`Request ${listing.title || 'provider service'}`} text="This form uses the real farmer-to-provider service request API." />
      {loading ? <LoadingState title="Loading listing" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <form className="info-card compact-form" onSubmit={handleSubmit}>
        <label>Farm location<input name="farmLocation" required /></label>
        <label>Preferred start<input type="date" name="preferredStartDate" /></label>
        <label>Preferred end<input type="date" name="preferredEndDate" /></label>
        <label>Acreage or quantity<input name="acreageOrQuantity" /></label>
        <label>Budget<input type="number" name="budget" min="0" step="1" /></label>
        <label>Contact preference<select name="contactPreference"><option value="message">Message</option><option value="phone">Phone</option><option value="message_or_phone">Message or phone</option></select></label>
        <label className="wide-field">Description<textarea name="needDescription" rows="4" required /></label>
        <label className="wide-field">Notes<textarea name="notes" rows="3" /></label>
        <button className="primary-button" type="submit">Submit request</button>
      </form>
      <StatusMessage message={status.message} tone={status.tone} />
    </>
  );
}

export function FarmerServiceRequestsPage() {
  const { data, loading, error, reload } = useAsyncData(getServiceRequests, []);
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const requests = asArray(data);

  async function act(action, id, success) {
    try {
      await action(id);
      setStatus({ message: success, tone: 'success' });
      reload();
    } catch (actionError) {
      setStatus({ message: actionError.message || 'Unable to update request.', tone: 'error' });
    }
  }

  return (
    <>
      <PageHeader eyebrow="Service requests" title="Your provider requests" text="Farmers can accept provider quotes or cancel their own requests through real service request endpoints." />
      <StatusMessage message={status.message} tone={status.tone} />
      {loading ? <LoadingState title="Loading requests" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <div className="list-stack">
        {requests.map((request) => (
          <ServiceRequestCard
            key={getId(request)}
            request={request}
            actions={(item) => (
              <>
                {item.status === 'quoted' ? <button className="secondary-button" type="button" onClick={() => act(acceptServiceRequestQuote, getId(item), 'Quote accepted.')}>Accept quote</button> : null}
                {['pending', 'quoted'].includes(item.status) ? <button className="secondary-button" type="button" onClick={() => act(cancelServiceRequest, getId(item), 'Request cancelled.')}>Cancel</button> : null}
              </>
            )}
          />
        ))}
      </div>
      {!loading && !requests.length ? <EmptyState title="No service requests yet" text="Request a provider service from the Farm Services marketplace." /> : null}
    </>
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

export function FarmerProviderMessagesPage() {
  return (
    <>
      <PageHeader eyebrow="Provider messages" title="Service conversations" text="Farmer-to-provider messages use the shared Messages API and can carry service request context." />
      <MessagesPanel title="Provider conversations" emptyText="Provider service messages will appear after service conversations start." />
    </>
  );
}

export function FarmerServiceNotificationsPage() {
  return (
    <>
      <PageHeader eyebrow="Service alerts" title="Provider service notifications" text="Quotes, request updates and service messages use the real Notifications API." />
      <NotificationsPanel emptyText="Service request notifications will appear when providers respond." />
    </>
  );
}

export function FarmerSocialFeedPage() {
  const { data, loading, error } = useAsyncData(getPosts, []);
  const posts = asArray(data);
  const farmerPosts = useMemo(() => posts.filter((post) => post.author?.role === 'farmer' || post.authorRole === 'farmer'), [posts]);

  return (
    <>
      <PageHeader eyebrow="Farm feed" title="Farmer-owned feed surface" text="This replaces the static farmer link to customer-facing social-feed.html. Publishing is handled from Farmer Profile." />
      {loading ? <LoadingState title="Loading farmer updates" /> : null}
      {error ? <ErrorState text={error} /> : null}
      {!loading && !farmerPosts.length ? <EmptyState title="No farmer updates yet" text="Publish a farm update from your profile, or wait for farmer posts to appear in the public feed." /> : null}
      <div className="list-stack">
        {farmerPosts.map((post) => (
          <article className="feed-item" key={post.id || post._id || post.createdAt}>
            <strong>{post.author?.name || post.author?.fullName || 'Farmer'}</strong>
            <p>{post.content || post.text || post.caption || 'Farm update'}</p>
            <span>{formatDate(post.createdAt)}</span>
          </article>
        ))}
      </div>
    </>
  );
}

export function FarmerHelpPage() {
  return (
    <>
      <PageHeader eyebrow="Help" title="Farmer workflow guide" text="Farmer help covers products, inventory, messages, profile updates and provider services." />
      <section className="card-grid">
        <InfoCard title="Products and inventory" text="Create products from Products. Inventory currently summarizes listing stock." />
        <InfoCard title="Provider services" text="Browse active provider listings, submit service requests and manage quotes from Service Requests." />
        <InfoCard title="Pending platform features" text="Orders, payments and analytics are clearly marked pending until backend support exists." />
      </section>
    </>
  );
}
