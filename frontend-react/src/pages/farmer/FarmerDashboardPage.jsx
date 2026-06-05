import { Link } from 'react-router-dom';
import {
  BarChart3,
  CalendarCheck,
  CloudSun,
  Droplets,
  Leaf,
  Package,
  Plus,
  Receipt,
  ShoppingBag,
  Sprout,
  Tractor,
  Users,
  Wind,
  Wrench,
} from 'lucide-react';
import { getFarmers } from '../../api/farmersApi.js';
import { getPosts } from '../../api/postsApi.js';
import { getProducts } from '../../api/productsApi.js';
import { getProfile } from '../../api/profileApi.js';
import { getServiceRequests } from '../../api/serviceRequestsApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { InfoCard, MetricCard } from '../../components/common/Page.jsx';
import { RoleHero } from '../../components/common/RoleHero.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { EmptyState, ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { asArray, formatDate, formatMoney, getId, getProductName, resolveMediaUrl } from '../../utils/format.js';
import { homeImage } from '../../utils/assets.js';

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

const sampleRequests = [
  { title: 'Tractor Plowing', meta: '2 acres - Service marketplace', amount: 'Awaiting quote', status: 'Preview', icon: Tractor },
  { title: 'Irrigation Installation', meta: 'Farm drip system', amount: 'Awaiting backend', status: 'Preview', icon: Droplets },
  { title: 'Poultry Vet Visit', meta: 'Layer farm support', amount: 'Awaiting backend', status: 'Preview', icon: Wrench },
];

const sampleOrders = [
  { id: '#FH88921', customer: 'GreenField Farms', items: 'Tomatoes (20kg)', amount: 'Pending', status: 'Preview', date: 'Backend pending' },
  { id: '#FH88920', customer: 'Agbado Markets', items: 'Yam (30 tubers)', amount: 'Pending', status: 'Preview', date: 'Backend pending' },
  { id: '#FH88919', customer: 'SunnySide Stores', items: 'Plantain (40 bunches)', amount: 'Pending', status: 'Preview', date: 'Backend pending' },
];

function FarmerProductTile({ product, index }) {
  const image = resolveMediaUrl(product.imageUrl || product.image || product.images?.[0]?.url || '') || [homeImage('product-tomatoes.webp'), homeImage('product-onions.webp'), homeImage('product-compost.webp')][index % 3];
  return (
    <article className="dashboard-product-tile">
      <div className="dashboard-product-image">
        <img src={image} alt={getProductName(product)} />
        <StatusBadge label={product.category || 'Fresh'} tone="green" />
      </div>
      <div>
        <h3>{getProductName(product)}</h3>
        <p>{product.category || product.unit || 'Farm product'}</p>
        <strong>{formatMoney(product.price || product.unitPrice)}</strong>
        <span className="stock-chip">In stock: {product.stock ?? 'Pending'}</span>
      </div>
    </article>
  );
}

function ServiceRequestRow({ request }) {
  const Icon = request.icon || Tractor;
  return (
    <article className="service-request-row">
      <span className="request-icon"><Icon size={20} /></span>
      <div>
        <strong>{request.title || request.serviceTitle || request.listing?.title || 'Service request'}</strong>
        <p>{request.meta || request.location || request.description || 'Request details pending'}</p>
      </div>
      <div>
        <span>{request.amount || formatMoney(request.price || request.quotedPrice, 'Pending')}</span>
        <StatusBadge label={request.status || 'Pending'} tone={request.status === 'Preview' ? 'gold' : 'green'} />
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
  const profile = data?.profile || {};
  const listedValue = products.reduce((sum, product) => sum + Number(product.price || product.unitPrice || 0), 0);

  return (
    <div className="dashboard-page farmer-dashboard-page">
      <RoleHero
        className="farmer-hero"
        eyebrow={`Good morning, ${profile.fullName || user?.fullName || 'Farmer'}`}
        title="Manage your farm. Grow your business."
        text="Track orders, manage products, and connect with customers and service providers."
        actions={(
          <>
            <Link className="primary-button" to="/farmer/products"><Plus size={18} /><span>Add New Product</span></Link>
            <Link className="secondary-button" to="/farmer/orders"><Package size={18} /><span>View Orders</span></Link>
          </>
        )}
        visual={<img src={homeImage('hero-delivery.webp')} alt="Harvest delivery in a field" />}
        aside={(
          <article className="weather-card">
            <CloudSun size={46} />
            <strong>27 C</strong>
            <span>Partly Cloudy</span>
            <p><Droplets size={14} /> Humidity: 68% <Wind size={14} /> Wind: 12km/h</p>
            <StatusBadge label="Weather preview" tone="green" />
          </article>
        )}
      />
      {loading ? <LoadingState title="Loading farmer workspace" /> : null}
      {error ? <ErrorState text={error} /> : null}
      {data?.errors?.length ? <StatusMessage message="Some live farm data is unavailable right now." tone="error" /> : null}
      <section className="metric-grid farmer-metrics">
        <MetricCard label="Total Sales" value="Pending" text="Awaiting order totals" icon={<ShoppingBag size={22} />} tone="green" />
        <MetricCard label="Active Orders" value="Pending" text="Order workflow pending" icon={<CalendarCheck size={22} />} tone="blue" />
        <MetricCard label="Listed Products" value={products.length} text="Owned product listings" icon={<Sprout size={22} />} tone="gold" />
        <MetricCard label="Service Requests" value={requests.length || 'Preview'} text={requests.length ? 'Real requests' : 'Awaiting service data'} icon={<Wrench size={22} />} tone="rose" />
        <MetricCard label="Revenue 30 Days" value={listedValue ? formatMoney(listedValue) : 'Pending'} text="Backend revenue pending" icon={<BarChart3 size={22} />} tone="green" />
      </section>
      <section className="dashboard-panels-grid farmer-panels">
        <InfoCard
          className="my-products-panel"
          title="My Products"
          actions={<Link className="text-link" to="/farmer/products">View all</Link>}
        >
          <div className="dashboard-product-grid">
            {products.slice(0, 4).map((product, index) => <FarmerProductTile key={getId(product)} product={product} index={index} />)}
          </div>
          {!products.length ? <EmptyState title="No products listed yet" text="Use Products to add crops before the product management panel fills in." /> : null}
        </InfoCard>
        <InfoCard className="service-requests-panel" title="Service Requests" actions={<Link className="text-link" to="/farmer/service-requests">View all</Link>}>
          <div className="list-stack">
            {(requests.length ? requests.slice(0, 3) : sampleRequests).map((request) => <ServiceRequestRow key={getId(request) || request.title} request={request} />)}
          </div>
        </InfoCard>
        <InfoCard className="customer-activity-panel" title="Customer Activity" actions={<Link className="text-link" to="/farmer/customers">View all</Link>}>
          <div className="mini-message-list">
            <article>
              <span className="avatar avatar-small"><Users size={17} /></span>
              <div><strong>Customer messages</strong><p>Real conversations load from Messages.</p></div>
            </article>
            <article>
              <span className="avatar avatar-small"><Receipt size={17} /></span>
              <div><strong>Order activity</strong><p>Awaiting full farmer order backend.</p></div>
            </article>
            <article>
              <span className="avatar avatar-small"><Leaf size={17} /></span>
              <div><strong>Product interest</strong><p>{products.length} products available for customers.</p></div>
            </article>
          </div>
        </InfoCard>
        <InfoCard className="recent-orders-panel" title="Recent Orders" actions={<Link className="text-link" to="/farmer/orders">View all</Link>}>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {sampleOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.items}</td>
                    <td>{order.amount}</td>
                    <td><StatusBadge label={order.status} tone="gold" /></td>
                    <td>{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfoCard>
        <InfoCard className="farm-feed-panel" title="Farm Feed and Announcements" actions={<Link className="text-link" to="/farmer/feed">View all</Link>}>
          <div className="announcement-list">
            {posts.slice(0, 3).map((post) => (
              <article key={getId(post) || post.createdAt}>
                <span className="announcement-icon"><Leaf size={18} /></span>
                <div>
                  <strong>{post.title || 'Farm update'}</strong>
                  <p>{post.content || post.body || 'Update details pending.'}</p>
                </div>
                <time>{formatDate(post.createdAt)}</time>
              </article>
            ))}
            {!posts.length ? (
              <>
                <article><span className="announcement-icon"><Leaf size={18} /></span><div><strong>Market Update</strong><p>Market notices will appear when the feed returns posts.</p></div><time>Preview</time></article>
                <article><span className="announcement-icon"><CloudSun size={18} /></span><div><strong>Weather Alert</strong><p>Weather integrations are prepared as a dashboard preview.</p></div><time>Preview</time></article>
                <article><span className="announcement-icon"><Sprout size={18} /></span><div><strong>Training Opportunity</strong><p>Announcements can be published through Farm Feed.</p></div><time>Preview</time></article>
              </>
            ) : null}
          </div>
        </InfoCard>
      </section>
    </div>
  );
}
