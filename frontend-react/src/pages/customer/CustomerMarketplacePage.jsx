import { useMemo, useState } from 'react';
import { getProducts } from '../../api/productsApi.js';
import { PageHeader } from '../../components/common/Page.jsx';
import { ProductCard } from '../../components/common/ProductCard.jsx';
import { EmptyState, ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { asArray, getId, getProductName } from '../../utils/format.js';

function customerProductPath(id) {
  return `/customer/products/${encodeURIComponent(id)}`;
}

function customerFarmerPath(id) {
  return `/customer/farmers/${encodeURIComponent(id)}`;
}

export function CustomerMarketplacePage() {
  const { data, loading, error } = useAsyncData(getProducts, []);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const products = asArray(data);
  const categories = useMemo(() => Array.from(new Set(products.map((item) => item.category).filter(Boolean))).sort(), [products]);
  const filtered = products.filter((product) => {
    const haystack = `${getProductName(product)} ${product.category || ''} ${product.description || ''}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (!category || product.category === category);
  });

  return (
    <>
      <PageHeader eyebrow="Marketplace" title="Browse farm products" text="Search and filter real product listings. Cart and favorites remain local to this browser." />
      <div className="filter-bar">
        <input type="search" placeholder="Search vegetables, farmers, eggs, dairy..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Category filter">
          <option value="">All categories</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <StatusMessage message={status.message || `${filtered.length} product${filtered.length === 1 ? '' : 's'} shown.`} tone={status.tone} />
      {loading ? <LoadingState title="Loading products" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <div className="card-grid">
        {filtered.map((product) => (
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
      {!loading && !filtered.length ? <EmptyState title="No products found" text="No returned products match this search or category." /> : null}
    </>
  );
}
