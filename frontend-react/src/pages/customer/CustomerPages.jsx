import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, ShoppingBasket } from 'lucide-react';
import { getFarmers, getFarmerById } from '../../api/farmersApi.js';
import { getPosts } from '../../api/postsApi.js';
import { getProductById, getProducts } from '../../api/productsApi.js';
import { getProfile, updateProfile } from '../../api/profileApi.js';
import { MessagesPanel } from '../../components/common/MessagesPanel.jsx';
import { NotificationsPanel } from '../../components/common/NotificationsPanel.jsx';
import { PageHeader, InfoCard, MetricCard } from '../../components/common/Page.jsx';
import { ProductCard } from '../../components/common/ProductCard.jsx';
import { EmptyState, ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { addProductToCart, favoriteIds, getCartItems, saveCartItems, saveFavoriteIds, toggleFavorite } from '../../utils/customerStorage.js';
import { asArray, formatDate, formatMoney, getId, getProductName, getSeller, getSellerId, resolveMediaUrl } from '../../utils/format.js';

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

export function CustomerCartPage() {
  const [items, setItems] = useState(getCartItems);
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);

  function update(next) {
    saveCartItems(next);
    setItems(next);
  }

  return (
    <>
      <PageHeader eyebrow="Local cart" title="Cart stored in this browser" text="FarmersHub does not yet have a real customer checkout or synced cart API, so this page keeps the static frontend honesty intact." />
      <section className="metric-grid">
        <MetricCard label="Items" value={items.reduce((sum, item) => sum + Number(item.quantity || 1), 0)} text="Browser-local quantity" />
        <MetricCard label="Estimated subtotal" value={formatMoney(subtotal, 'KRW 0')} text="Before checkout, delivery and payment rules" />
      </section>
      {!items.length ? <EmptyState title="Your cart is empty" text="Add products from the marketplace. They will be stored in this browser only." /> : null}
      <div className="list-stack">
        {items.map((item) => (
          <article className="line-item" key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <span>{item.sellerName || 'Local farmer'} - {item.priceLabel || formatMoney(item.price)}</span>
            </div>
            <div className="quantity-controls">
              <button type="button" onClick={() => update(items.map((cartItem) => cartItem.id === item.id ? { ...cartItem, quantity: Math.max(1, Number(cartItem.quantity || 1) - 1) } : cartItem))}>-</button>
              <span>{item.quantity || 1}</span>
              <button type="button" onClick={() => update(items.map((cartItem) => cartItem.id === item.id ? { ...cartItem, quantity: Number(cartItem.quantity || 1) + 1 } : cartItem))}>+</button>
              <button type="button" onClick={() => update(items.filter((cartItem) => cartItem.id !== item.id))}>Remove</button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
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

export function CustomerOrdersPage() {
  const items = getCartItems();
  const quantity = items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);

  return (
    <>
      <PageHeader eyebrow="Orders" title="Order history is pending backend support" text="The backend has a product order request endpoint, but no full persisted customer order history, payment or tracking workflow." />
      <InfoCard title="Local cart context" text={quantity ? `${quantity} local cart item${quantity === 1 ? '' : 's'} with estimated subtotal ${formatMoney(subtotal, 'KRW 0')}. These are not completed orders.` : 'Your local cart is empty.'} />
      <EmptyState title="No completed orders shown" text="React does not claim synced orders until a real Order model and customer order API exist." />
    </>
  );
}

export function CustomerMessagesPage() {
  return (
    <>
      <PageHeader eyebrow="Messages" title="Message farmers" text="Customer messages use the real Messages API and can include product context." />
      <MessagesPanel title="Customer conversations" emptyText="Message a farmer from a product card to start a customer conversation." />
    </>
  );
}

export function CustomerNotificationsPage() {
  return (
    <>
      <PageHeader eyebrow="Notifications" title="Customer notifications" text="Message, market and system notifications are loaded from the backend." />
      <NotificationsPanel emptyText="Customer notifications will appear when the backend creates them." />
    </>
  );
}

export function CustomerProfilePage() {
  const { data, loading, error } = useAsyncData(getProfile, []);
  const profile = data?.data || data || {};

  return (
    <>
      <PageHeader eyebrow="Profile" title="Customer account" text="This customer-safe profile view does not expose farmer product or provider management controls." />
      {loading ? <LoadingState title="Loading profile" /> : null}
      {error ? <ErrorState text={error} /> : null}
      {!loading && !error ? (
        <section className="metric-grid">
          <MetricCard label="Name" value={profile.fullName || profile.name || 'Not set'} text={profile.email || 'Email unavailable'} />
          <MetricCard label="Role" value={profile.role || 'customer'} text="Customer-only shopping workspace" />
          <MetricCard label="Location" value={profile.location || profile.address || 'Not set'} text="Used only as account context here" />
        </section>
      ) : null}
    </>
  );
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

export function CustomerSettingsPage() {
  const { data, loading, error, reload } = useAsyncData(getProfile, []);
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const profile = data?.data || data || {};

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      await updateProfile({
        fullName: formData.get('fullName'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        paymentMethod: formData.get('paymentMethod'),
      });
      setStatus({ message: 'Customer account settings saved.', tone: 'success' });
      reload();
    } catch (saveError) {
      setStatus({ message: saveError.message || 'Unable to save settings.', tone: 'error' });
    }
  }

  return (
    <>
      <PageHeader eyebrow="Settings" title="Customer settings" text="Customer settings are limited to account fields and do not render farmer or provider private controls." />
      {loading ? <LoadingState title="Loading settings" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <form className="info-card compact-form" onSubmit={handleSubmit}>
        <label>Full name<input name="fullName" defaultValue={profile.fullName || profile.name || ''} /></label>
        <label>Phone<input name="phone" defaultValue={profile.phone || ''} /></label>
        <label>Address<input name="address" defaultValue={profile.address || profile.location || ''} /></label>
        <label>Payment preference<input name="paymentMethod" defaultValue={profile.paymentMethod || ''} placeholder="Pending payment integration" /></label>
        <button className="primary-button" type="submit">Save settings</button>
      </form>
      <StatusMessage message={status.message} tone={status.tone} />
    </>
  );
}

export function CustomerHelpPage() {
  return (
    <>
      <PageHeader eyebrow="Help" title="Customer support" text="Customer help stays focused on marketplace browsing, local cart/favorites, farmer messages and honest pending checkout behavior." />
      <section className="card-grid">
        <InfoCard title="Cart and favorites" text="Saved locally in this browser. They are not synced to an account yet." />
        <InfoCard title="Messaging farmers" text="Product and farmer message actions use the real Messages API when you are logged in." />
        <InfoCard title="Orders and payments" text="Checkout, payment and customer order history remain pending until backend support exists." />
      </section>
    </>
  );
}

export function CustomerSocialFeedPage() {
  const { data, loading, error } = useAsyncData(getPosts, []);
  const posts = asArray(data);

  return (
    <>
      <PageHeader eyebrow="Social feed preview" title="FarmersHub community updates" text="Customer feed keeps preview behavior: public posts may be read, but customer posting is not claimed as complete." />
      {loading ? <LoadingState title="Loading community updates" /> : null}
      {error ? <ErrorState text={error} /> : null}
      {!loading && !posts.length ? <EmptyState title="No updates yet" text="Public feed items will appear after farmers publish updates." /> : null}
      <div className="list-stack">
        {posts.slice(0, 12).map((post) => (
          <article className="feed-item" key={post.id || post._id || post.createdAt}>
            <strong>{post.author?.name || post.author?.fullName || 'FarmersHub member'}</strong>
            <p>{post.text || post.content || post.description || 'Community update'}</p>
            <span>{formatDate(post.createdAt)} - preview actions only</span>
          </article>
        ))}
      </div>
    </>
  );
}
