import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Heart,
  Leaf,
  MapPin,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  ShoppingBasket,
  Star,
  Truck,
  Users,
} from 'lucide-react';
import { getFarmers } from '../../api/farmersApi.js';
import { getPosts } from '../../api/postsApi.js';
import { getProducts } from '../../api/productsApi.js';
import { InfoCard, MetricCard } from '../../components/common/Page.jsx';
import { ProductCard } from '../../components/common/ProductCard.jsx';
import { RoleHero } from '../../components/common/RoleHero.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { EmptyState, ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { favoriteIds } from '../../utils/customerStorage.js';
import { asArray, getId, resolveMediaUrl } from '../../utils/format.js';
import { homeImage } from '../../utils/assets.js';

function useCustomerOverview() {
  return useAsyncData(async () => {
    const [productsResult, farmersResult, postsResult] = await Promise.allSettled([
      getProducts(),
      getFarmers(),
      getPosts(),
    ]);
    return {
      products: productsResult.status === 'fulfilled' ? asArray(productsResult.value) : [],
      farmers: farmersResult.status === 'fulfilled' ? asArray(farmersResult.value) : [],
      posts: postsResult.status === 'fulfilled' ? asArray(postsResult.value) : [],
      errors: [productsResult, farmersResult, postsResult].filter((result) => result.status === 'rejected').map((result) => result.reason?.message),
    };
  }, []);
}

function customerProductPath(id) {
  return `/customer/products/${encodeURIComponent(id)}`;
}

function customerFarmerPath(id) {
  return `/customer/farmers/${encodeURIComponent(id)}`;
}

function FarmerCard({ farmer }) {
  const farmerId = getId(farmer);
  const image = resolveMediaUrl(farmer.avatarUrl || farmer.imageUrl || '') || homeImage('farmer-fallback-1.webp');
  return (
    <article className="person-card nearby-farmer-card">
      <div className="avatar">{image ? <img src={image} alt={farmer.fullName || farmer.name || 'Farmer'} /> : <span>{(farmer.fullName || farmer.name || 'FH').slice(0, 2)}</span>}</div>
      <div>
        <h2>{farmer.farmName || farmer.fullName || farmer.name || 'Local farmer'}</h2>
        <p>{farmer.location || farmer.address || 'Location pending'}</p>
        <span><Star size={14} fill="currentColor" /> {farmer.rating || '4.8'} ({farmer.reviews || '120'})</span>
      </div>
      <div className="card-actions">
        {farmerId ? <Link className="secondary-button" to={customerFarmerPath(farmerId)}>View profile</Link> : null}
        {farmerId ? <Link className="secondary-button" to={`/customer/messages?recipientId=${encodeURIComponent(farmerId)}&recipientName=${encodeURIComponent(farmer.fullName || farmer.name || 'Farmer')}&recipientRole=farmer`}>Message</Link> : null}
      </div>
    </article>
  );
}

const previewProducts = [
  { name: 'Fresh Tomatoes', farmer: 'GreenField Farms', price: 'Awaiting price', image: homeImage('product-tomatoes.webp'), badge: 'Preview' },
  { name: 'Red Onions', farmer: 'Agbado Farms', price: 'Awaiting price', image: homeImage('product-onions.webp'), badge: 'Preview' },
  { name: 'Organic Compost', farmer: 'Root Harvesters', price: 'Awaiting price', image: homeImage('product-compost.webp'), badge: 'Preview' },
];

function PreviewProductCard({ product }) {
  return (
    <article className="product-card preview-product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        <span className="product-badge">{product.badge}</span>
      </div>
      <div className="product-card-body">
        <h2>{product.name}</h2>
        <p>Marketplace layout preview while waiting for backend listings.</p>
        <div className="product-meta-row">
          <strong>{product.price}</strong>
          <small>{product.farmer}</small>
        </div>
      </div>
      <div className="card-actions">
        <button className="secondary-button" type="button" disabled>Awaiting backend</button>
      </div>
    </article>
  );
}

function OrderStatusCard() {
  return (
    <InfoCard className="order-status-card" title="My Order Status" actions={<Link to="/customer/orders">View all</Link>}>
      <div className="order-status-box">
        <div>
          <strong>Order checkout</strong>
          <StatusBadge label="Coming soon" tone="gold" />
        </div>
        <p>Customer checkout and delivery tracking are prepared visually while the synced order backend is pending.</p>
        <div className="order-steps" aria-label="Order progress preview">
          <span className="active"><PackageCheck size={15} /></span>
          <span><ShoppingBasket size={15} /></span>
          <span><Truck size={15} /></span>
          <span><ShieldCheck size={15} /></span>
        </div>
      </div>
    </InfoCard>
  );
}

export function CustomerHomePage() {
  const { data, loading, error } = useCustomerOverview();
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const products = data?.products || [];
  const farmers = data?.farmers || [];
  const productImages = [homeImage('product-tomatoes.webp'), homeImage('product-onions.webp'), homeImage('product-compost.webp')];
  const featuredProducts = products.slice(0, 5).map((product, index) => ({
    ...product,
    imageUrl: product.imageUrl || product.image || product.images?.[0]?.url || productImages[index % productImages.length],
  }));

  return (
    <div className="dashboard-page customer-dashboard-page">
      <section className="dashboard-main-grid">
        <div className="dashboard-primary">
          <RoleHero
            className="customer-hero"
            eyebrow="Fresh marketplace"
            title="Fresh from Farms. Delivered to You."
            text="Buy fresh, healthy, and locally sourced produce directly from trusted farmers near you."
            actions={(
              <>
                <Link className="primary-button" to="/customer/marketplace">
                  <span>Shop Now</span>
                  <ShoppingBasket size={18} />
                </Link>
                <Link className="secondary-button" to="/customer/marketplace">
                  <span>Explore Farmers</span>
                  <Users size={18} />
                </Link>
              </>
            )}
            visual={(
              <>
                <img src={homeImage('hero-delivery.webp')} alt="Basket of fresh vegetables" />
                <span className="fresh-seal">100% Local</span>
              </>
            )}
          />
          {loading ? <LoadingState /> : null}
          {error ? <ErrorState text={error} /> : null}
          {data?.errors?.length ? <StatusMessage message="Some live marketplace data is unavailable right now." tone="error" /> : null}
          <section className="metric-grid customer-metrics">
            <MetricCard label="My Orders" value="Pending" text="Checkout backend pending" icon={<PackageCheck size={22} />} tone="green" />
            <MetricCard label="Saved Items" value={favoriteIds().length} text="Local browser favorites" icon={<Heart size={22} />} tone="rose" />
            <MetricCard label="Fresh Picks" value={products.length || 'Preview'} text={products.length ? 'Backend products' : 'Awaiting Products API'} icon={<Leaf size={22} />} tone="green" />
            <MetricCard label="Nearby Farmers" value={farmers.length || 'Pending'} text={farmers.length ? 'Public profiles' : 'Awaiting Farmers API'} icon={<MapPin size={22} />} tone="gold" />
          </section>
          <StatusMessage message={status.message} tone={status.tone} />
          <section className="section-heading">
            <div>
              <h2>Fresh from Local Farms</h2>
              <p>{products.length ? 'Real listings from the current backend.' : 'Preview cards show the intended marketplace layout until listings are returned.'}</p>
            </div>
            <Link className="text-link" to="/customer/marketplace">View all <ArrowRight size={16} /></Link>
          </section>
          <div className="card-grid product-showcase-grid">
            {featuredProducts.length ? featuredProducts.map((product) => (
              <ProductCard
                key={getId(product)}
                product={product}
                detailPath={customerProductPath}
                farmerPath={customerFarmerPath}
                allowCustomerActions
                onStatus={(message, tone) => setStatus({ message, tone })}
              />
            )) : previewProducts.map((product) => <PreviewProductCard key={product.name} product={product} />)}
          </div>
          {!loading && !products.length ? <EmptyState title="Products awaiting backend data" text="Real products will replace the preview cards when the Products API returns listings." /> : null}
          <section className="section-heading">
            <div>
              <h2>Nearby Farmers</h2>
              <p>Customer-safe public profiles and message entry points.</p>
            </div>
            <Link className="text-link" to="/customer/marketplace">View all <ArrowRight size={16} /></Link>
          </section>
          <div className="nearby-farmers-row">
            {farmers.slice(0, 4).map((farmer) => <FarmerCard key={getId(farmer)} farmer={farmer} />)}
            {!loading && !farmers.length ? <EmptyState title="No farmers returned yet" text="Public farmer profiles will appear here when the Farmers API returns them." /> : null}
          </div>
        </div>
        <aside className="dashboard-right-rail customer-right-rail">
          <OrderStatusCard />
          <InfoCard className="recent-messages-card" title="Recent Messages" actions={<Link to="/customer/messages">View all</Link>}>
            <div className="mini-message-list">
              <article>
                <span className="avatar avatar-small">GF</span>
                <div>
                  <strong>GreenField Farms</strong>
                  <p>Your order updates will appear here.</p>
                </div>
              </article>
              <article>
                <span className="avatar avatar-small">FH</span>
                <div>
                  <strong>Support Team</strong>
                  <p>Open Messages to load real conversations.</p>
                </div>
              </article>
            </div>
          </InfoCard>
          <InfoCard className="delivery-card">
            <Truck size={34} />
            <h2>Fast and Reliable Delivery</h2>
            <p>Delivery tracking is prepared for the customer flow and will connect when checkout is available.</p>
            <Link className="primary-button" to="/customer/help">Learn More</Link>
          </InfoCard>
          <div className="trust-badge-row">
            <span><ShieldCheck size={18} /> Secure Payments</span>
            <span><Leaf size={18} /> Quality Guaranteed</span>
            <span><MessageCircle size={18} /> Local Support</span>
          </div>
        </aside>
      </section>
    </div>
  );
}
