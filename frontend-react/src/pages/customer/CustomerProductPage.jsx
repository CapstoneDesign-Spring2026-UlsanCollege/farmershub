import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProductById } from '../../api/productsApi.js';
import { PageHeader } from '../../components/common/Page.jsx';
import { ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { addProductToCart, toggleFavorite } from '../../utils/customerStorage.js';
import { formatMoney, getId, getProductName, getSeller, getSellerId, resolveMediaUrl } from '../../utils/format.js';

function customerFarmerPath(id) {
  return `/customer/farmers/${encodeURIComponent(id)}`;
}

export function CustomerProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useAsyncData(() => getProductById(productId), [productId]);
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const product = data?.data || data || {};
  const seller = getSeller(product);
  const sellerId = getSellerId(product);
  const image = resolveMediaUrl(product.imageUrl || product.image || product.images?.[0]?.url || '');

  function addCart() {
    const result = addProductToCart(product);
    setStatus({ message: result.message, tone: result.ok ? 'success' : 'error' });
  }

  function saveFavorite() {
    const result = toggleFavorite(product);
    setStatus({ message: result.message, tone: result.ok ? 'success' : 'error' });
  }

  return (
    <>
      <PageHeader eyebrow="Product detail" title={loading ? 'Loading product' : getProductName(product)} text="Selected product detail uses the real Products API." />
      {loading ? <LoadingState title="Loading product" /> : null}
      {error ? <ErrorState text={error} /> : null}
      {!loading && !error ? (
        <section className="detail-layout">
          <div className="detail-media">{image ? <img src={image} alt={getProductName(product)} /> : <span>{getProductName(product).slice(0, 2)}</span>}</div>
          <article className="info-card">
            <span className="eyebrow">{product.category || 'Farm product'}</span>
            <h2>{getProductName(product)}</h2>
            <p>{product.description || 'No product description has been added yet.'}</p>
            <strong>{formatMoney(product.price || product.unitPrice)}</strong>
            <p>Seller: {seller.fullName || seller.name || product.farmerName || 'Local farmer'}</p>
            <div className="card-actions">
              <button className="primary-button" type="button" onClick={addCart}>Add to local cart</button>
              <button className="secondary-button" type="button" onClick={saveFavorite}>Save on this device</button>
              {sellerId ? <button className="secondary-button" type="button" onClick={() => navigate(`/customer/messages?recipientId=${encodeURIComponent(sellerId)}&productId=${encodeURIComponent(getId(product))}`)}>Message farmer</button> : null}
              {sellerId ? <Link className="secondary-button" to={customerFarmerPath(sellerId)}>View farmer</Link> : null}
            </div>
            <StatusMessage message={status.message} tone={status.tone} />
          </article>
        </section>
      ) : null}
    </>
  );
}
