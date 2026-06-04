import { useState } from 'react';
import { getProducts } from '../../api/productsApi.js';
import { PageHeader } from '../../components/common/Page.jsx';
import { ProductCard } from '../../components/common/ProductCard.jsx';
import { EmptyState, ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { favoriteIds, saveFavoriteIds } from '../../utils/customerStorage.js';
import { asArray, getId } from '../../utils/format.js';

function customerProductPath(id) {
  return `/customer/products/${encodeURIComponent(id)}`;
}

function customerFarmerPath(id) {
  return `/customer/farmers/${encodeURIComponent(id)}`;
}

export function CustomerFavoritesPage() {
  const { data, loading, error } = useAsyncData(getProducts, []);
  const [ids, setIds] = useState(favoriteIds);
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const saved = asArray(data).filter((product) => ids.includes(getId(product)));

  function clearFavorites() {
    saveFavoriteIds([]);
    setIds([]);
    setStatus({ message: 'All favorites cleared from this device.', tone: 'success' });
  }

  return (
    <>
      <PageHeader eyebrow="Favorites" title="Saved products on this device" text="Favorites are intentionally local until a real account-sync backend exists." actions={<button className="secondary-button" type="button" onClick={clearFavorites}>Clear favorites</button>} />
      <StatusMessage message={status.message} tone={status.tone} />
      {loading ? <LoadingState title="Loading saved products" /> : null}
      {error ? <ErrorState text={error} /> : null}
      {!ids.length ? <EmptyState title="No favorites saved yet" text="Tap Save on marketplace product cards to store product ids in this browser." /> : null}
      {ids.length && !saved.length && !loading ? <EmptyState title="Saved ids are unavailable" text="This browser has saved ids, but current products did not return matching listings." /> : null}
      <div className="card-grid">
        {saved.map((product) => (
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
    </>
  );
}
