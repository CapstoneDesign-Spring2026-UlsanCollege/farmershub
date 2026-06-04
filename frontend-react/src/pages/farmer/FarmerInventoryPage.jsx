import { getProducts } from '../../api/productsApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { MetricCard, PageHeader } from '../../components/common/Page.jsx';
import { ErrorState, LoadingState } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { asArray, getId } from '../../utils/format.js';

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
