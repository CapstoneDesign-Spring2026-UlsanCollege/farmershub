import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { API_BASE, getFarmers, getProducts } from './services/api'

const BASE = import.meta.env.BASE_URL || '/'
const ASSET = `${BASE}assets/images/home/`

const services = [
  {
    title: 'Farm Equipment',
    image: `${ASSET}service-equipment.webp`,
  },
  {
    title: 'Organic Fertilizer',
    image: `${ASSET}service-fertilizer.webp`,
  },
  {
    title: 'Vehicle & Delivery Help',
    image: `${ASSET}service-delivery.webp`,
  },
  {
    title: 'Loan & Growth Help',
    image: `${ASSET}service-loan.webp`,
  },
]

const categories = ['Vegetables', 'Fruits', 'Eggs', 'Dairy', 'Meat', 'Organic', 'Seeds', 'Delivery']

function formatPrice(product) {
  const value = product.price ?? product.sellingPrice

  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return 'Price on request'
  }

  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function getProductImage(product, index) {
  if (product.imageUrl) return product.imageUrl

  const fallbackImages = [
    `${ASSET}product-tomatoes.webp`,
    `${ASSET}product-onions.webp`,
    `${ASSET}product-compost.webp`,
  ]

  return fallbackImages[index % fallbackImages.length]
}

function getFarmerName(farmer) {
  return farmer.farmName || farmer.fullName || farmer.name || 'Unnamed Farmer'
}

function getFarmerSpecialty(farmer) {
  return farmer.farmType || farmer.productsLabel || farmer.specialty || farmer.bio || 'Fresh local farm products'
}

function getProfileUrl(farmer) {
  const id = farmer.id || farmer.userId || farmer._id || ''
  return id ? `../frontend/profile.html?farmer=${encodeURIComponent(id)}` : '../frontend/profile.html'
}

function getProductUrl(product) {
  const id = product.id || product._id || ''
  return id ? `../frontend/product.html?id=${encodeURIComponent(id)}` : '../frontend/product.html'
}

function App() {
  const [farmers, setFarmers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadHomeData() {
      setLoading(true)
      setApiError('')

      try {
        const [farmersResponse, productsResponse] = await Promise.all([
          getFarmers(),
          getProducts(),
        ])

        if (cancelled) return

        const liveFarmers = Array.isArray(farmersResponse?.data) ? farmersResponse.data : []
        const liveProducts = Array.isArray(productsResponse?.data) ? productsResponse.data : []

        setFarmers(liveFarmers.slice(0, 6))
        setProducts(liveProducts.slice(0, 6))
      } catch (error) {
        if (cancelled) return
        console.error('Failed to load FarmersHub live data:', error)
        setApiError(error.message || 'Could not connect to FarmersHub backend.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadHomeData()

    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(() => {
    return {
      farmers: farmers.length,
      products: products.length,
    }
  }, [farmers.length, products.length])

  return (
    <>
      <header className="top-nav">
        <a href={BASE} className="brand">
          <img src={`${BASE}logo.png`} alt="FarmersHub Logo" className="home-logo" />
          <div>
            <p className="brand-overline">Green Marketplace</p>
            <h1>FarmersHub</h1>
          </div>
        </a>

        <form className="global-search">
          <span className="search-icon">⌕</span>
          <input placeholder="Search farmers, crops, organic picks, and local updates" />
          <select className="global-sort" aria-label="Sort search results">
            <option>Recent</option>
            <option>Name A-Z</option>
            <option>Farmers First</option>
            <option>Products First</option>
          </select>
        </form>

        <nav className="user-nav" aria-label="Main navigation">
          <a href={BASE} className="nav-icon-link active"><span>⌂</span><span>Home</span></a>
          <a href="../frontend/profile.html" className="nav-icon-link"><span>👤</span><span>Profile</span></a>
          <a href="../frontend/messages.html" className="nav-icon-link"><span>✉</span><span>Messages</span></a>
          <a href="../frontend/notifications.html" className="nav-icon-link"><span>🔔</span><span>Alerts</span></a>
          <a href="../frontend/login/login.html" className="login-btn">Login</a>
        </nav>
      </header>

      <main className="home-shell">
        <aside className="home-sidebar left-sidebar">
          <section className="sidebar-card workspace-card">
            <span className="card-kicker">Customer Market</span>
            <h3>Buy fresh locally</h3>
            <a href="#trendingProducts">🧺 <span>Browse Products</span></a>
            <a href="#featuredFarmers">🌱 <span>Discover Farmers</span></a>
            <a href="../frontend/messages.html">✉ <span>Messages</span></a>
            <a href="../frontend/notifications.html">🔔 <span>Alerts</span></a>
            <a href="../frontend/profile.html">👤 <span>My Profile</span></a>
          </section>

          <section className="sidebar-card service-card">
            <div className="section-heading compact-heading">
              <h3>Agri-Service Providers</h3>
              <a href="#services">Future hub</a>
            </div>
            <div className="service-tile-grid" id="services">
              {services.map((service) => (
                <a className="service-tile" href="#services" key={service.title}>
                  <img src={service.image} alt={service.title} />
                  <span>{service.title}</span>
                </a>
              ))}
            </div>
          </section>

          <section className="sidebar-card support-card">
            <img src={`${ASSET}support-basket.webp`} alt="Basket of seasonal produce" />
            <h3>List your crops. Reach local buyers.</h3>
            <p>Simple. Trusted. Local.</p>
            <a href="../frontend/sell_crops.html">Start Selling Today</a>
          </section>
        </aside>

        <section className="page-feed social-feed">
          <section className="hero-card reveal harvest-hero">
            <div className="hero-content">
              <p className="eyebrow">Fresh Market • Direct from Farmers</p>
              <h2>Shop fresh groceries from trusted local farmers.</h2>
              <p className="hero-copy">
                Browse vegetables, fruits, eggs, dairy, meat, and organic farm products with direct farmer profiles,
                messages, and quick ordering.
              </p>
              <p className="api-status">
                {loading
                  ? 'Loading live FarmersHub data...'
                  : apiError
                    ? `Backend issue: ${apiError}`
                    : `Connected to live backend: ${API_BASE}`}
              </p>
              <div className="hero-actions">
                <a href="#trendingProducts" className="cta-primary">Shop Now</a>
                <a href="#featuredFarmers" className="cta-ghost">Meet Farmers</a>
              </div>
            </div>

            <div className="hero-visual">
              <img src={`${ASSET}hero-delivery.webp`} alt="Fresh local produce delivery" />
            </div>

            <div className="hero-metrics">
              <article><span>👨‍🌾</span><h3>{stats.farmers}</h3><p>Live Farmers</p></article>
              <article><span>🌿</span><h3>{stats.products}</h3><p>Fresh Listings</p></article>
              <article><span>🛡️</span><h3>{apiError ? 'Check' : 'Live'}</h3><p>Render API</p></article>
              <article><span>🤝</span><h3>{apiError ? 'Retry' : 'DB'}</h3><p>MongoDB Data</p></article>
            </div>
          </section>

          <section className="feed-section reveal" id="featuredFarmers">
            <div className="section-heading">
              <h3>Nearby Farmers & Providers</h3>
              <a href="../frontend/farmer.html">See all</a>
            </div>

            {loading ? (
              <p className="empty-state">Loading farmers from database...</p>
            ) : farmers.length ? (
              <div className="farmer-grid">
                {farmers.map((farmer) => (
                  <article className="farmer-card card-shell" key={farmer.id || farmer.email || getFarmerName(farmer)}>
                    <div className="avatar-ring" aria-label={`${getFarmerName(farmer)} profile`}>
                      {farmer.avatarUrl ? (
                        <img src={farmer.avatarUrl} alt={`${getFarmerName(farmer)} avatar`} />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    <h4>{getFarmerName(farmer)}</h4>
                    <p className="location">{farmer.location || farmer.address || 'Location not added yet'}</p>
                    <p className="specialty">{getFarmerSpecialty(farmer)}</p>
                    <div className="card-actions">
                      <a href={getProfileUrl(farmer)} className="mini-link">View profile</a>
                      <a href="../frontend/messages.html" className="mini-link message-link">Message</a>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="empty-state">No farmers found in the database yet.</p>
            )}
          </section>

          <section className="feed-section reveal" id="trendingProducts">
            <div className="section-heading">
              <h3>Recommended For You</h3>
              <a href="../frontend/product.html">View all</a>
            </div>

            {loading ? (
              <p className="empty-state">Loading products from database...</p>
            ) : products.length ? (
              <div className="product-grid">
                {products.map((product, index) => (
                  <article className="product-card card-shell" key={product.id || product.name}>
                    <div className="product-preview">
                      <img src={getProductImage(product, index)} alt={product.name || 'Farm product'} />
                    </div>
                    <h4>{product.name || 'Fresh Product'}</h4>
                    <p className="price">{formatPrice(product)}</p>
                    <p className="meta">{product.category || 'Farm product'} • {product.seller?.name || 'Farmer'}</p>
                    <div className="card-actions">
                      <a href={getProductUrl(product)} className="mini-link">View</a>
                      <button className="mini-link save-button" type="button">♡ Save</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="empty-state">No products found in the database yet.</p>
            )}
          </section>

          <section className="feed-section reveal">
            <div className="section-heading">
              <h3>Shop by Category</h3>
              <a href="../frontend/product.html">Browse catalog</a>
            </div>
            <div className="category-wrap">
              {categories.map((category) => (
                <button className="category-chip" type="button" key={category}>{category}</button>
              ))}
            </div>
          </section>

          <section className="feed-section reveal">
            <div className="section-heading">
              <h3>Community Feed</h3>
              <a href="../frontend/dashboard.html">Live feed</a>
            </div>
            <div className="live-feed">
              <article className="post-card card-shell">
                <div className="post-head">
                  <div className="post-avatar"></div>
                  <div><h4>FarmersHub Update</h4><p>Fresh market notice</p></div>
                </div>
                <p className="post-copy">React homepage now reads live farmers and products from the FarmersHub Render API.</p>
                <p className="post-meta">🌿 Connected to live marketplace data</p>
              </article>
              <article className="post-card card-shell">
                <div className="post-head">
                  <div className="post-avatar"></div>
                  <div><h4>Agri Service Hub</h4><p>Future provider support</p></div>
                </div>
                <p className="post-copy">Equipment, delivery, fertilizer, and growth support cards are now part of the new homepage.</p>
                <p className="post-meta">🚚 Services preview ready</p>
              </article>
            </div>
          </section>
        </section>

        <aside className="home-sidebar right-sidebar">
          <section className="sidebar-card today-card">
            <span className="card-kicker">Today on FarmersHub</span>
            <h3>Fresh activity</h3>
            <p>{products[0]?.name ? `${products[0].name} is available from the live marketplace.` : 'Live product data will appear here.'}</p>
            <p>{farmers[0] ? `${getFarmerName(farmers[0])} is active in FarmersHub.` : 'Live farmer data will appear here.'}</p>
            <p>Buyers nearby are looking for tomatoes and onions.</p>
          </section>

          <section className="sidebar-card quick-card">
            <h3>Quick Actions</h3>
            <a href="../frontend/product.html">🧺 Browse All Products</a>
            <a href="../frontend/sell_crops.html">➕ Start Selling</a>
            <a href="../frontend/profile.html">👤 Update Farm Profile</a>
            <a href="../frontend/dashboard.html">📣 View Farmer Updates</a>
          </section>

          <section className="sidebar-card trust-card">
            <h3>Why buy on FarmersHub?</h3>
            <p>✅ Verified growers</p>
            <p>📸 Uploaded farm photos appear first</p>
            <p>⚡ Fast direct messaging</p>
            <img src={`${ASSET}support-basket.webp`} alt="Seasonal produce basket" />
          </section>
        </aside>
      </main>
    </>
  )
}

export default App
