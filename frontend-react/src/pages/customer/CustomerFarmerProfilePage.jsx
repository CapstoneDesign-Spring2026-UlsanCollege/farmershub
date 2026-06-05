import { Link, useParams } from 'react-router-dom';
import { getFarmerById } from '../../api/farmersApi.js';
import { PageHeader, MetricCard } from '../../components/common/Page.jsx';
import { ProductCard } from '../../components/common/ProductCard.jsx';
import { ErrorState, LoadingState } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getId } from '../../utils/format.js';

function customerProductPath(id) {
  return `/customer/products/${encodeURIComponent(id)}`;
}

export function CustomerFarmerProfilePage() {
  const { farmerId } = useParams();
  const { data, loading, error } = useAsyncData(() => getFarmerById(farmerId), [farmerId]);
  const farmer = data?.data || data || {};
  const products = Array.isArray(farmer.products) ? farmer.products : [];
  const posts = Array.isArray(farmer.posts) ? farmer.posts : [];

  return (
    <>
      <PageHeader eyebrow="Public farmer profile" title={farmer.farmName || farmer.fullName || farmer.name || 'Farmer profile'} text="Customer view shows public profile, products and message entry points only." />
      {loading ? <LoadingState title="Loading farmer profile" /> : null}
      {error ? <ErrorState text={error} /> : null}
      {!loading && !error ? (
        <>
          <section className="metric-grid">
            <MetricCard label="Location" value={farmer.location || farmer.address || 'Not listed'} text={farmer.bio || 'Public farmer profile'} />
            <MetricCard label="Products" value={products.length} text={farmer.productsLabel || 'Returned products'} />
            <MetricCard label="Posts" value={posts.length} text="Public updates returned by Farmers API" />
          </section>
          <Link className="primary-button" to={`/customer/messages?recipientId=${encodeURIComponent(farmerId)}&recipientName=${encodeURIComponent(farmer.fullName || farmer.name || 'Farmer')}&recipientRole=farmer`}>Message farmer</Link>
          <section className="section-heading"><div><h2>Products from this farmer</h2><p>Returned by the public farmer profile endpoint.</p></div></section>
          <div className="card-grid">
            {products.map((product) => (
              <ProductCard key={getId(product)} product={product} detailPath={customerProductPath} allowCustomerActions />
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}
