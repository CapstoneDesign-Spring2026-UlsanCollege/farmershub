import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { getFarmers } from '../../api/farmersApi.js';
import { getPosts } from '../../api/postsApi.js';
import { getProducts } from '../../api/productsApi.js';
import { getProfile } from '../../api/profileApi.js';
import { getServiceRequests } from '../../api/serviceRequestsApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { InfoCard, MetricCard, PageHeader } from '../../components/common/Page.jsx';
import { ProductCard } from '../../components/common/ProductCard.jsx';
import { EmptyState, ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { asArray, getId } from '../../utils/format.js';

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
