import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Check, Heart, MessageCircle, ShoppingBasket } from 'lucide-react';
import { CartToast } from '../cart/CartToast.jsx';
import { FlyingCartItem } from '../cart/FlyingCartItem.jsx';
import { formatMoney, getId, getProductName, getSeller, getSellerId, resolveMediaUrl } from '../../utils/format.js';
import { addProductToCart, isFavorite, toggleFavorite } from '../../utils/customerStorage.js';
import { homeImage } from '../../utils/assets.js';

function fallbackProductImage(product = {}) {
  const haystack = `${getProductName(product)} ${product.category || ''}`.toLowerCase();
  if (haystack.includes('onion')) return homeImage('product-onions.webp');
  if (haystack.includes('compost') || haystack.includes('fertilizer')) return homeImage('product-compost.webp');
  return homeImage('product-tomatoes.webp');
}

export function ProductCard({ product, detailPath, farmerPath, onStatus, allowCustomerActions = false }) {
  const [added, setAdded] = useState(false);
  const [favorite, setFavorite] = useState(() => isFavorite(getId(product)));
  const [toastVisible, setToastVisible] = useState(false);
  const [flying, setFlying] = useState(false);
  const timers = useRef([]);
  const productId = getId(product);
  const seller = getSeller(product);
  const sellerId = getSellerId(product);
  const imageUrl = resolveMediaUrl(product.imageUrl || product.image || product.images?.[0]?.url || '') || fallbackProductImage(product);
  const productName = getProductName(product);

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  function handleCart() {
    const result = addProductToCart(product);
    if (result.ok) {
      setAdded(true);
      setToastVisible(true);
      setFlying(true);
      timers.current.push(window.setTimeout(() => setAdded(false), 1300));
      timers.current.push(window.setTimeout(() => setToastVisible(false), 2600));
      timers.current.push(window.setTimeout(() => setFlying(false), 850));
      onStatus?.('Added to cart', 'success');
    } else {
      onStatus?.(result.message, 'error');
    }
  }

  function handleFavorite() {
    const result = toggleFavorite(product);
    if (result.ok) setFavorite(isFavorite(productId));
    onStatus?.(result.message, result.ok ? 'success' : 'error');
  }

  return (
    <article className={`product-card ${added ? 'product-card-added' : ''}`}>
      <div className="product-image">
        <img src={imageUrl} alt={productName} />
        <span className="product-badge">{product.category || product.unit || 'Fresh'}</span>
        {allowCustomerActions ? (
          <button className="favorite-button" type="button" onClick={handleFavorite} aria-label="Toggle favorite" title="Toggle favorite">
            <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
          </button>
        ) : null}
        <FlyingCartItem imageUrl={imageUrl} active={flying} />
      </div>
      <div className="product-card-body">
        <h2>{productName}</h2>
        <p>{product.description || product.notes || 'Fresh farm listing from FarmersHub.'}</p>
        <div className="product-meta-row">
          <strong>{formatMoney(product.price || product.unitPrice)}</strong>
          <small>{seller.fullName || seller.name || product.farmerName || 'Local farmer'}</small>
        </div>
      </div>
      <div className="card-actions">
        {detailPath ? <Link className="secondary-button" to={detailPath(productId)}>Details</Link> : null}
        {sellerId && farmerPath ? <Link className="secondary-button" to={farmerPath(sellerId)}>Farmer</Link> : null}
        {allowCustomerActions ? (
          <>
            <button className={`primary-button add-cart-button ${added ? 'is-added' : ''}`} type="button" onClick={handleCart} aria-label={`Add ${productName} to cart`}>
              {added ? <Check size={17} /> : <ShoppingBasket size={17} />}
              <span>{added ? 'Added!' : 'Add to Cart'}</span>
            </button>
            {sellerId ? <Link className="icon-button" to={`/customer/messages?recipientId=${encodeURIComponent(sellerId)}&recipientName=${encodeURIComponent(seller.fullName || seller.name || 'Farmer')}&recipientRole=farmer`} aria-label="Message farmer" title="Message farmer">
              <MessageCircle size={17} />
            </Link> : null}
          </>
        ) : null}
      </div>
      <CartToast productName={productName} visible={toastVisible} />
    </article>
  );
}
