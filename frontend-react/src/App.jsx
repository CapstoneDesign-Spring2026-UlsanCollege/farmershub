import './App.css'

const ASSET = '/assets/images/home/'

const farmers = [
  {
    name: 'Green Valley Farms',
    location: 'Ulsan Local Market',
    specialty: 'Organic vegetables, tomatoes, leafy greens',
  },
  {
    name: 'Harvest Moon Growers',
    location: 'Busan Fresh Zone',
    specialty: 'Seasonal fruits and greenhouse crops',
  },
  {
    name: 'Sunny Field Providers',
    location: 'Daegu Farm Route',
    specialty: 'Eggs, dairy, herbs and farm baskets',
  },
]

const products = [
  {
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    price: '₩8,500',
    image: `${ASSET}product-tomatoes.webp`,
  },
  {
    name: 'Organic Onions',
    category: 'Vegetables',
    price: '₩6,000',
    image: `${ASSET}product-onions.webp`,
  },
  {
    name: 'Natural Compost',
    category: 'Organic Support',
    price: '₩12,000',
    image: `${ASSET}product-compost.webp`,
  },
]

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

function App() {
  return (
    <>
      <header className="top-nav">
        <a href="#" className="brand">
          <img src="/logo.png" alt="FarmersHub Logo" className="home-logo" />
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
          <a href="#" className="nav-icon-link active"><span>⌂</span><span>Home</span></a>
          <a href="#" className="nav-icon-link"><span>👤</span><span>Profile</span></a>
          <a href="#" className="nav-icon-link"><span>✉</span><span>Messages</span></a>
          <a href="#" className="nav-icon-link"><span>🔔</span><span>Alerts</span></a>
          <a href="#" className="login-btn">Login</a>
        </nav>
      </header>

      <main className="home-shell">
        <aside className="home-sidebar left-sidebar">
          <section className="sidebar-card workspace-card">
            <span className="card-kicker">Customer Market</span>
            <h3>Buy fresh locally</h3>
            <a href="#">🧺 <span>Browse Products</span></a>
            <a href="#featuredFarmers">🌱 <span>Discover Farmers</span></a>
            <a href="#">✉ <span>Messages</span></a>
            <a href="#">🔔 <span>Alerts</span></a>
            <a href="#">👤 <span>My Profile</span></a>
          </section>

          <section className="sidebar-card service-card">
            <div className="section-heading compact-heading">
              <h3>Agri-Service Providers</h3>
              <a href="#">Future hub</a>
            </div>
            <div className="service-tile-grid">
              {services.map((service) => (
                <a className="service-tile" href="#" key={service.title}>
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
            <a href="#">Start Selling Today</a>
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
              <div className="hero-actions">
                <a href="#" className="cta-primary">Shop Now</a>
                <a href="#trendingProducts" className="cta-ghost">See Today Deals</a>
              </div>
            </div>

            <div className="hero-visual">
              <img src={`${ASSET}hero-delivery.webp`} alt="Fresh local produce delivery" />
            </div>

            <div className="hero-metrics">
              <article><span>👨‍🌾</span><h3>1.8K+</h3><p>Active Farmers</p></article>
              <article><span>🌿</span><h3>340+</h3><p>Fresh Listings Today</p></article>
              <article><span>🛡️</span><h3>99%</h3><p>Verified Sources</p></article>
              <article><span>🤝</span><h3>5K+</h3><p>Happy Buyers</p></article>
            </div>
          </section>

          <section className="feed-section reveal" id="featuredFarmers">
            <div className="section-heading">
              <h3>Nearby Farmers & Providers</h3>
              <a href="#">See all</a>
            </div>
            <div className="farmer-grid">
              {farmers.map((farmer) => (
                <article className="farmer-card card-shell" key={farmer.name}>
                  <div className="avatar-ring" aria-label={`${farmer.name} profile placeholder`}>
                    <span>👤</span>
                  </div>
                  <h4>{farmer.name}</h4>
                  <p className="location">{farmer.location}</p>
                  <p className="specialty">{farmer.specialty}</p>
                  <div className="card-actions">
                    <a href="#" className="mini-link">View profile</a>
                    <a href="#" className="mini-link message-link">Message</a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="feed-section reveal" id="trendingProducts">
            <div className="section-heading">
              <h3>Recommended For You</h3>
              <a href="#">View all</a>
            </div>
            <div className="product-grid">
              {products.map((product) => (
                <article className="product-card card-shell" key={product.name}>
                  <div className="product-preview">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <h4>{product.name}</h4>
                  <p className="price">{product.price}</p>
                  <p className="meta">{product.category} • Farmer</p>
                  <div className="card-actions">
                    <a href="#" className="mini-link">View</a>
                    <button className="mini-link save-button" type="button">♡ Save</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="feed-section reveal">
            <div className="section-heading">
              <h3>Shop by Category</h3>
              <a href="#">Browse catalog</a>
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
              <a href="#">Live feed</a>
            </div>
            <div className="live-feed">
              <article className="post-card card-shell">
                <div className="post-head">
                  <div className="post-avatar"></div>
                  <div><h4>FarmersHub Update</h4><p>Fresh market notice</p></div>
                </div>
                <p className="post-copy">New seasonal listings are being prepared for the React marketplace preview.</p>
                <p className="post-meta">🌿 12 fresh updates • 4 nearby farmers</p>
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
            <p>New arrivals: organic turmeric, green chillies, fresh milk.</p>
            <p>Monsoon crop care tips from agri experts.</p>
            <p>Buyers nearby are looking for tomatoes and onions.</p>
          </section>

          <section className="sidebar-card quick-card">
            <h3>Quick Actions</h3>
            <a href="#">🧺 Browse All Products</a>
            <a href="#">➕ Start Selling</a>
            <a href="#">👤 Update Farm Profile</a>
            <a href="#">📣 View Farmer Updates</a>
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
