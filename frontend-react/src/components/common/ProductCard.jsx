import { Link } from 'react-router-dom';
import { Heart, MessageCircle, ShoppingBasket } from 'lucide-react';
import { formatMoney, getId, getProductName, getSeller, getSellerId, resolveMediaUrl } from '../../utils/format.js';
import { addProductToCart, isFavorite, toggleFavorite } from '../../utils/customerStorage.js';

export function ProductCard({ product, detailPath, farmerPath, onStatus, allowCustomerActions = false }) {
  const productId = getId(product);
  const seller = getSeller(product);
  const sellerId = getSellerId(product);
  const imageUrl = resolveMediaUrl(product.imageUrl || product.image || product.images?.[0]?.url || '');
  const favorite = isFavorite(productId);

  function handleCart() {
    const result = addProductToCart(product);
    onStatus?.(result.message, result.ok ? 'success' : 'error');
  }

  function handleFavorite() {
    const result = toggleFavorite(product);
    onStatus?.(result.message, result.ok ? 'success' : 'error');
  }

  return (
    <article className="product-card">
      <div className="product-image">
        {imageUrl ? <img src={imageUrl} alt={getProductName(product)} /> : <span>{getProductName(product).slice(0, 2)}</span>}
      </div>
      <div className="product-card-body">
        <span className="eyebrow">{product.category || product.unit || 'Farm product'}</span>
        <h2>{getProductName(product)}</h2>
        <p>{product.description || product.notes || 'Fresh farm listing from FarmersHub.'}</p>
        <strong>{formatMoney(product.price || product.unitPrice)}</strong>
        <small>{seller.fullName || seller.name || product.farmerName || 'Local farmer'}</small>
      </div>
      <div className="card-actions">
        {detailPath ? <Link className="secondary-button" to={detailPath(productId)}>Details</Link> : null}
        {sellerId && farmerPath ? <Link className="secondary-button" to={farmerPath(sellerId)}>Farmer</Link> : null}
        {allowCustomerActions ? (
          <>
            <button className="icon-button" type="button" onClick={handleCart} aria-label="Add to cart" title="Add to cart">
              <ShoppingBasket size={17} />
            </button>
            <button className="icon-button" type="button" onClick={handleFavorite} aria-label="Toggle favorite" title="Toggle favorite">
              <Heart size={17} fill={favorite ? 'currentColor' : 'none'} />
            </button>
            <Link className="icon-button" to={`/customer/messages?recipientId=${encodeURIComponent(sellerId)}&recipientName=${encodeURIComponent(seller.fullName || seller.name || 'Farmer')}&recipientRole=farmer`} aria-label="Message farmer" title="Message farmer">
              <MessageCircle size={17} />
            </Link>
          </>
        ) : null}
      </div>
    </article>
  );
}
