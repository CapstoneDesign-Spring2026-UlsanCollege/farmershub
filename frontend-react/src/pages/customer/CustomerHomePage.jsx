import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBasket } from 'lucide-react';
import { getFarmers } from '../../api/farmersApi.js';
import { getPosts } from '../../api/postsApi.js';
import { getProducts } from '../../api/productsApi.js';
import { PageHeader, MetricCard } from '../../components/common/Page.jsx';
import { ProductCard } from '../../components/common/ProductCard.jsx';
import { EmptyState, ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { favoriteIds, getCartItems } from '../../utils/customerStorage.js';
import { asArray, getId, resolveMediaUrl } from '../../utils/format.js';

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
  const image = resolveMediaUrl(farmer.avatarUrl || farmer.imageUrl || '');
  return (
    <article className="person-card">
      <div className="avatar">{image ? <img src={image} alt={farmer.fullName || farmer.name || 'Farmer'} /> : <span>{(farmer.fullName || farmer.name || 'FH').slice(0, 2)}</span>}</div>
      <div>
        <h2>{farmer.farmName || farmer.fullName || farmer.name || 'Local farmer'}</h2>
        <p>{farmer.location || farmer.address || 'Location pending'}</p>
        <span>{farmer.farmType || farmer.productsLabel || farmer.bio || 'Fresh farm products'}</span>
      </div>
      <div className="card-actions">
        {farmerId ? <Link className="secondary-button" to={customerFarmerPath(farmerId)}>View profile</Link> : null}
        {farmerId ? <Link className="secondary-button" to={`/customer/messages?recipientId=${encodeURIComponent(farmerId)}&recipientName=${encodeURIComponent(farmer.fullName || farmer.name || 'Farmer')}&recipientRole=farmer`}>Message</Link> : null}
      </div>
    </article>
  );
}

export function CustomerHomePage() {
  const { data, loading, error } = useCustomerOverview();
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const products = data?.products || [];
  const farmers = data?.farmers || [];
  const posts = data?.posts || [];
  const cartQuantity = getCartItems().reduce((sum, item) => sum + Number(item.quantity || 1), 0);

  return (
    <>
      <PageHeader
        eyebrow="Customer application"
        title="Fresh local products and farmer conversations"
        text="Browse real product listings, view public farmer profiles, message sellers, and keep cart and favorites honestly stored on this browser."
        actions={(
          <>
            <Link className="primary-button" to="/customer/marketplace"><ShoppingBasket size={18} /><span>Marketplace</span></Link>
            <Link className="secondary-button" to="/customer/favorites"><Heart size={18} /><span>{favoriteIds().length} saved</span></Link>
          </>
        )}
      />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState text={error} /> : null}
      {data?.errors?.length ? <StatusMessage message={data.errors.join(' ')} tone="error" /> : null}
      <section className="metric-grid">
        <MetricCard label="Products" value={products.length} text="Returned by Products API" />
        <MetricCard label="Farmers" value={farmers.length} text="Public farmer profiles" />
        <MetricCard label="Local cart" value={cartQuantity} text="Stored in this browser" />
        <MetricCard label="Updates" value={posts.length} text="Public feed items" />
      </section>
      <StatusMessage message={status.message} tone={status.tone} />
      <section className="section-heading">
        <div>
          <h2>Featured products</h2>
          <p>Real listings from the current backend.</p>
        </div>
        <Link className="secondary-button" to="/customer/marketplace">View all</Link>
      </section>
      <div className="card-grid">
        {products.slice(0, 6).map((product) => (
          <ProductCard
            key={getId(product)}
            product={product}
            detailPath={customerProductPath}
            farmerPath={customerFarmerPath}
            allowCustomerActions
            onStatus={(message, tone) => setStatus({ message, tone })}
          />
        ))}
      </div>
      {!loading && !products.length ? <EmptyState title="No products yet" text="Products from farmers will appear when the Products API returns listings." /> : null}
      <section className="section-heading">
        <div>
          <h2>Farmers and providers nearby</h2>
          <p>Customer-safe public profile cards, without farmer management controls.</p>
        </div>
      </section>
      <div className="card-grid">
        {farmers.slice(0, 4).map((farmer) => <FarmerCard key={getId(farmer)} farmer={farmer} />)}
      </div>
    </>
  );
}
