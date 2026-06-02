import { getFarmers } from './js/farmerService.js';
import { getProducts } from './js/productService.js';
import { getFeed } from './js/postService.js';
import './assets/js/notification-float.js';

// Hero Modal Handler
function initHeroModal() {
  const heroModal = document.getElementById('heroModal');
  const heroModalClose = document.getElementById('heroModalClose');
  const heroModalOverlay = document.querySelector('.hero-modal-overlay');
  
  function closeModal() {
    heroModal.classList.add('hidden');
    localStorage.setItem('heroModalDismissed', 'true');
  }
  
  heroModalClose?.addEventListener('click', closeModal);
  heroModalOverlay?.addEventListener('click', closeModal);
  
  // Show modal on first visit or if not dismissed
  const isDismissed = localStorage.getItem('heroModalDismissed');
  if (!isDismissed && heroModal) {
    heroModal.classList.remove('hidden');
  } else if (heroModal) {
    heroModal.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', initHeroModal);

(function () {
  let feedCache = [];
  let allFarmers = [];
  let allProducts = [];
  let allPosts = [];

  const farmerGrid = document.getElementById('featuredFarmers');
  const productGrid = document.getElementById('trendingProducts');
  const nearbyGrid = document.getElementById('nearbyItems');
  const categoryWrap = document.getElementById('categoryWrap');
  const liveFeed = document.getElementById('liveFeed');
  const infiniteSections = document.getElementById('infiniteSections');
  const sentinel = document.getElementById('feedSentinel');
  const searchInput = document.getElementById('globalSearchInput');
  const sortSelect = document.getElementById('globalSortSelect');
  const searchForm = searchInput?.closest('form');

  const farmerTpl = document.getElementById('farmerCardTemplate');
  const productTpl = document.getElementById('productCardTemplate');
  const nearbyTpl = document.getElementById('nearbyCardTemplate');
  const postTpl = document.getElementById('postTemplate');
  const searchStatus = document.createElement('section');
  const heroCard = document.querySelector('.harvest-hero');
  const farmerHero = document.querySelector('.fd-hero');
  const farmerSearchPanel = document.createElement('section');
  const farmerSearchResults = document.createElement('div');

  searchStatus.className = 'feed-section search-results-summary';
  searchStatus.hidden = true;
  if (heroCard?.parentNode) {
    heroCard.insertAdjacentElement('afterend', searchStatus);
  }

  farmerSearchPanel.className = 'fd-panel fd-search-results';
  farmerSearchPanel.hidden = true;
  farmerSearchPanel.innerHTML =
    '<div class="fd-heading">' +
    '<h3></h3>' +
    '<button type="button" class="clear-search-btn">Clear</button>' +
    '</div>';
  farmerSearchResults.className = 'fd-search-grid';
  farmerSearchPanel.appendChild(farmerSearchResults);
  if (farmerHero?.parentNode) {
    farmerHero.insertAdjacentElement('afterend', farmerSearchPanel);
  }
  farmerSearchPanel.querySelector('.clear-search-btn')?.addEventListener('click', () => {
    searchInput.value = '';
    applySearchAndSort();
    searchInput.focus();
  });

  function paintGradients(nodes, a, b) {
    nodes.forEach((node, i) => {
      const tilt = i % 2 === 0 ? '135deg' : '160deg';
      node.style.background = 'linear-gradient(' + tilt + ', ' + a + ', ' + b + ')';
    });
  }

  function textMatches(value, query) {
    return String(value || '').toLowerCase().includes(query);
  }

  function farmerMatches(farmer, query) {
    return [
      farmer.fullName,
      farmer.location,
      farmer.address,
      farmer.bio,
      farmer.farmType,
      farmer.farmName,
    ].some((value) => textMatches(value, query));
  }

  function productMatches(product, query) {
    return [
      product.name,
      product.category,
      product.seller?.name,
      product.description,
    ].some((value) => textMatches(value, query));
  }

  function postMatches(post, query) {
    return [
      post.author?.name,
      post.text,
      post.caption,
    ].some((value) => textMatches(value, query));
  }

  function sortByName(items, getName) {
    return [...items].sort((a, b) => getName(a).localeCompare(getName(b)));
  }

  function isFarmerDashboardActive() {
    return document.body.dataset.userRole === 'farmer';
  }

  function setSearchMode(query) {
    const hasQuery = Boolean(query);
    const activeHero = isFarmerDashboardActive() ? farmerHero : heroCard;
    const inactiveHero = isFarmerDashboardActive() ? heroCard : farmerHero;

    if (activeHero) {
      activeHero.style.display = hasQuery ? 'none' : '';
    }

    if (inactiveHero) {
      inactiveHero.style.display = '';
    }
  }

  function getProductId(product) {
    return product.id || product._id || product.productId || product.slug || product.name || '';
  }

  function getProductImage(product) {
    if (product.imageUrl) return product.imageUrl;
    if (product.image) return product.image;
    if (product.photoUrl) return product.photoUrl;
    if (Array.isArray(product.images) && product.images.length) {
      const first = product.images[0];
      return typeof first === 'string' ? first : (first.url || first.path || first.secureUrl || '');
    }
    if (Array.isArray(product.media) && product.media.length) {
      const first = product.media[0];
      return typeof first === 'string' ? first : (first.url || first.path || first.secureUrl || '');
    }
    return '';
  }

  function getSellerId(product) {
    return product.seller?.id || product.seller?._id || product.sellerId || product.farmerId || product.userId || '';
  }

  function getSellerName(product) {
    return product.seller?.name || product.seller?.fullName || product.farmerName || 'Farmer';
  }

  function buildProductUrl(product, extra = {}) {
    const params = new URLSearchParams(extra);
    const productId = getProductId(product);
    if (productId) {
      params.set('productId', productId);
      params.set('id', productId);
    }
    return `product.html${params.toString() ? `?${params.toString()}` : ''}`;
  }

  function getFavoriteProductIds() {
    try {
      const parsed = JSON.parse(localStorage.getItem('fh_favorite_products') || '[]');
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }

  function setFavoriteProductIds(ids) {
    localStorage.setItem('fh_favorite_products', JSON.stringify(Array.from(new Set(ids.map(String)))));
  }

  function isFavoriteProduct(product) {
    const productId = String(getProductId(product));
    return productId && getFavoriteProductIds().includes(productId);
  }

  function updateFavoriteButton(button, product) {
    if (!button) return;
    button.textContent = isFavoriteProduct(product) ? '♥ Saved' : '♡ Save';
    button.setAttribute('aria-pressed', isFavoriteProduct(product) ? 'true' : 'false');
  }

  function toggleFavoriteProduct(product, button) {
    const productId = String(getProductId(product));
    if (!productId) return;
    const favorites = getFavoriteProductIds();
    const next = favorites.includes(productId)
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];
    setFavoriteProductIds(next);
    updateFavoriteButton(button, product);
  }


  function renderFarmers(farmers) {
    if (!farmers.length) {
      farmerGrid.innerHTML = '<article class="farmer-card card-shell"><h4>No farmers yet</h4><p class="location">Grower profiles will appear here once added.</p><p class="specialty"></p></article>';
      return;
    }

    farmerGrid.innerHTML = '';
    farmers.forEach((farmer, index) => {
      const card = farmerTpl.content.firstElementChild.cloneNode(true);
      card.querySelector('h4').textContent = farmer.fullName;
      card.querySelector('.location').textContent = farmer.location || farmer.address || 'Location coming soon';
      card.querySelector('.specialty').textContent = farmer.bio || farmer.farmType || 'Fresh produce from local farms';
      const avatar = card.querySelector('.avatar-ring');
      if (farmer.avatarUrl) {
        avatar.style.backgroundImage = `url('${farmer.avatarUrl}')`;
        avatar.style.backgroundSize = 'cover';
        avatar.style.backgroundPosition = 'center';
      } else {
        const farmerFallbacks = [
          'assets/images/home/farmer-fallback-1.webp',
          'assets/images/home/farmer-fallback-2.webp',
          'assets/images/home/farmer-fallback-3.webp'
        ];
        avatar.style.backgroundImage = `url('${farmerFallbacks[index % farmerFallbacks.length]}')`;
        avatar.style.backgroundSize = 'cover';
        avatar.style.backgroundPosition = 'center';
      }
      const profileLink = card.querySelector('.profile-link');
      const messageLink = card.querySelector('.message-link');
      const farmerId = farmer.id || farmer._id || farmer.userId;

      if (profileLink && farmerId) {
        profileLink.href = `profile.html?farmer=${encodeURIComponent(farmerId)}`;
      }

      if (messageLink && farmerId) {
        const params = new URLSearchParams({
          recipientId: farmer.userId || farmerId,
          recipientName: farmer.fullName || 'FarmersHub member',
          recipientRole: farmer.role || 'farmer',
        });
        messageLink.href = `messages.html?${params.toString()}`;
      }

      farmerGrid.appendChild(card);
    });
  }

  function renderProducts(products) {
    if (!products.length) {
      productGrid.innerHTML = '<article class="product-card card-shell"><h4>No products yet</h4><p class="price"></p><p class="meta">Listings will appear once farmers publish products.</p></article>';
      return;
    }

    productGrid.innerHTML = '';
    products.forEach((product, index) => {
      const card = productTpl.content.firstElementChild.cloneNode(true);
      const productId = getProductId(product);
      const sellerId = getSellerId(product);
      const sellerName = getSellerName(product);
      const productName = product.name || 'Fresh product';

      card.dataset.productId = productId || '';
      card.querySelector('h4').textContent = productName;
      card.querySelector('.price').textContent = `₩${Number(product.price || product.sellingPrice || 0).toLocaleString()}`;
      card.querySelector('.meta').textContent = `${product.category || 'General'} • ${sellerName}`;

      const preview = card.querySelector('.product-preview');
      const uploadedImage = getProductImage(product);
      if (uploadedImage) {
        preview.innerHTML = `<img src="${uploadedImage}" alt="${productName}" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:20px;">`;
      } else {
        const categoryKey = String(product.category || productName).toLowerCase();
        const fallbackByCategory = {
          vegetable: 'assets/images/home/product-tomatoes.webp',
          vegetables: 'assets/images/home/product-tomatoes.webp',
          tomato: 'assets/images/home/product-tomatoes.webp',
          tomatoes: 'assets/images/home/product-tomatoes.webp',
          onion: 'assets/images/home/product-onions.webp',
          onions: 'assets/images/home/product-onions.webp',
          organic: 'assets/images/home/product-compost.webp',
          compost: 'assets/images/home/product-compost.webp',
          eggs: 'assets/images/home/support-basket.webp',
          egg: 'assets/images/home/support-basket.webp',
          dairy: 'assets/images/home/hero-delivery.webp',
          milk: 'assets/images/home/hero-delivery.webp',
          meat: 'assets/images/home/service-delivery.webp',
          fruit: 'assets/images/home/support-basket.webp',
          fruits: 'assets/images/home/support-basket.webp',
        };
        const fallbacks = [
          'assets/images/home/product-tomatoes.webp',
          'assets/images/home/product-onions.webp',
          'assets/images/home/support-basket.webp',
          'assets/images/home/hero-delivery.webp'
        ];
        const categoryFallback = Object.entries(fallbackByCategory).find(([key]) => categoryKey.includes(key))?.[1];
        const fallbackImage = categoryFallback || fallbacks[index % fallbacks.length];
        preview.innerHTML = `<img src="${fallbackImage}" alt="${productName}" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:20px;">`;
      }

      const detailLink = card.querySelector('.product-detail-link');
      const orderLink = card.querySelector('.product-order-link');
      const messageLink = card.querySelector('.product-message-link');
      const farmerLink = card.querySelector('.product-farmer-link');
      const favoriteBtn = card.querySelector('.product-favorite-btn');

      if (detailLink) detailLink.href = buildProductUrl(product);
      if (orderLink) orderLink.href = buildProductUrl(product, { intent: 'order' });

      if (messageLink && sellerId) {
        const messageParams = new URLSearchParams({
          recipientId: sellerId,
          recipientName: sellerName,
          recipientRole: 'farmer',
        });
        if (productId) messageParams.set('productId', productId);
        messageLink.href = `messages.html?${messageParams.toString()}`;
      } else if (messageLink) {
        messageLink.href = 'messages.html';
      }

      if (farmerLink && sellerId) {
        farmerLink.href = `profile.html?farmer=${encodeURIComponent(sellerId)}`;
      } else if (farmerLink) {
        farmerLink.href = 'profile.html';
      }

      updateFavoriteButton(favoriteBtn, product);
      favoriteBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavoriteProduct(product, favoriteBtn);
      });

      productGrid.appendChild(card);
    });
  }

  function renderNearby(products, farmers, posts) {
    nearbyGrid.innerHTML = '';
    const nearbyItems = [];

    products.slice(0, 2).forEach((product) => {
      nearbyItems.push({
        title: product.name,
        text: `${product.category || 'General'} • ${product.seller?.name || 'Farmer'} • $${Number(product.price || 0).toFixed(2)}`,
        tag: 'Product',
      });
    });

    farmers.slice(0, 1).forEach((farmer) => {
      nearbyItems.push({
        title: farmer.fullName,
        text: `${farmer.location || farmer.address || 'Local grower'}${farmer.farmType ? ` • ${farmer.farmType}` : ''}`,
        tag: 'Farmer',
      });
    });

    posts.slice(0, 1).forEach((post) => {
      nearbyItems.push({
        title: post.author?.name || 'Community update',
        text: (post.text || post.caption || 'Fresh update from the community.').slice(0, 85),
        tag: 'Update',
      });
    });

    if (!nearbyItems.length) {
      nearbyGrid.innerHTML = '<article class="nearby-card card-shell"><h4>No recommendations yet</h4><p>Nearby suggestions appear when farmers, products, and updates are available.</p><span>Waiting for data</span></article>';
      return;
    }

    nearbyItems.forEach((item) => {
      const card = nearbyTpl.content.firstElementChild.cloneNode(true);
      card.querySelector('h4').textContent = item.title;
      card.querySelector('p').textContent = item.text;
      card.querySelector('span').textContent = item.tag;
      nearbyGrid.appendChild(card);
    });
  }

  function renderCategories(products) {
    categoryWrap.innerHTML = '';
    const serverCategories = Array.from(new Set((products || []).map(product => (product.category || '').trim()).filter(Boolean)));
    const marketCategories = ['Vegetables', 'Fruits', 'Eggs', 'Dairy', 'Meat', 'Organic Picks'];
    const categories = Array.from(new Set([...marketCategories, ...serverCategories])).slice(0, 10);

    categories.forEach((category) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'category-chip';
      chip.textContent = category;
      chip.addEventListener('click', () => {
        const params = new URLSearchParams({ category });
        window.location.href = `product.html?${params.toString()}`;
      });
      categoryWrap.appendChild(chip);
    });
  }

  function createPost(item) {
    const post = postTpl.content.firstElementChild.cloneNode(true);
    post.querySelector('.post-head h4').textContent = item.author?.name || 'Farmer update';
    post.querySelector('.post-head p').textContent = new Date(item.createdAt).toLocaleString();
    post.querySelector('.post-copy').textContent = item.text || 'Fresh update from the community.';
    post.querySelector('.post-meta').textContent = `${item.likesCount || 0} likes`;
    return post;
  }

  function renderFeed(posts) {
    if (!posts.length) {
      liveFeed.innerHTML = '<article class="post-card card-shell"><div class="post-head"><div><h4>No updates yet</h4><p>Live feed</p></div></div><p class="post-copy">Posts published by farmers and customers will appear here.</p><div class="post-meta">0 likes</div></article>';
      return;
    }

    liveFeed.innerHTML = '';
    posts.forEach((item) => {
      liveFeed.appendChild(createPost(item));
    });
  }

  function updateSearchStatus(query, counts) {
    if (!searchStatus.parentNode) {
      return;
    }

    if (!query) {
      searchStatus.hidden = true;
      searchStatus.innerHTML = '';
      return;
    }

    searchStatus.hidden = false;
    searchStatus.innerHTML = '';

    const heading = document.createElement('div');
    heading.className = 'section-heading';

    const title = document.createElement('h3');
    title.textContent = `Search results for "${searchInput.value.trim()}"`;

    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'clear-search-btn';
    clearButton.textContent = 'Clear';
    clearButton.addEventListener('click', () => {
      searchInput.value = '';
      applySearchAndSort();
      searchInput.focus();
    });

    heading.append(title, clearButton);

    const countRow = document.createElement('div');
    countRow.className = 'search-count-row';
    [
      `${counts.farmers} farmers`,
      `${counts.products} products`,
      `${counts.posts} updates`
    ].forEach((label) => {
      const chip = document.createElement('span');
      chip.textContent = label;
      countRow.appendChild(chip);
    });

    searchStatus.append(heading, countRow);
  }

  function createFarmerSearchItem(kind, title, body, href) {
    const item = document.createElement('a');
    item.className = 'fd-search-item';
    item.href = href || '#';

    const label = document.createElement('span');
    label.textContent = kind;

    const heading = document.createElement('h4');
    heading.textContent = title || 'Untitled result';

    const copy = document.createElement('p');
    copy.textContent = body || 'No extra details available.';

    item.append(label, heading, copy);
    return item;
  }

  function renderFarmerSearchResults(query, farmers, products, posts) {
    if (!farmerSearchPanel.parentNode) {
      return;
    }

    if (!query || !isFarmerDashboardActive()) {
      farmerSearchPanel.hidden = true;
      farmerSearchResults.innerHTML = '';
      return;
    }

    farmerSearchPanel.hidden = false;
    farmerSearchPanel.querySelector('h3').textContent = `Search results for "${searchInput.value.trim()}"`;
    farmerSearchResults.innerHTML = '';

    const fragment = document.createDocumentFragment();

    products.slice(0, 6).forEach((product) => {
      fragment.appendChild(createFarmerSearchItem(
        'Product',
        product.name || 'Fresh product',
        `${product.category || 'General'} - ${getSellerName(product)} - ₩${Number(product.price || product.sellingPrice || 0).toLocaleString()}`,
        buildProductUrl(product)
      ));
    });

    farmers.slice(0, 4).forEach((farmer) => {
      const farmerId = farmer.id || farmer._id || farmer.userId || '';
      fragment.appendChild(createFarmerSearchItem(
        'Farmer',
        farmer.fullName || farmer.farmName || 'Farmer',
        farmer.location || farmer.address || farmer.bio || farmer.farmType || 'Local grower',
        farmerId ? `profile.html?farmer=${encodeURIComponent(farmerId)}` : 'profile.html'
      ));
    });

    posts.slice(0, 4).forEach((post) => {
      fragment.appendChild(createFarmerSearchItem(
        'Update',
        post.author?.name || 'Community update',
        (post.text || post.caption || 'Fresh update from the community.').slice(0, 120),
        '#liveFeedSection'
      ));
    });

    if (!fragment.childNodes.length) {
      const empty = document.createElement('div');
      empty.className = 'fd-search-empty';
      empty.textContent = 'No matches found. Try another product, farmer, or update.';
      fragment.appendChild(empty);
    }

    farmerSearchResults.appendChild(fragment);
  }

  function applySearchAndSort() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const sortMode = sortSelect?.value || 'recent';

    setSearchMode(query);

    let farmers = query ? allFarmers.filter((farmer) => farmerMatches(farmer, query)) : [...allFarmers];
    let products = query ? allProducts.filter((product) => productMatches(product, query)) : [...allProducts];
    let posts = query ? allPosts.filter((post) => postMatches(post, query)) : [...allPosts];

    if (sortMode === 'name') {
      farmers = sortByName(farmers, (farmer) => farmer.fullName || '');
      products = sortByName(products, (product) => product.name || '');
      posts = sortByName(posts, (post) => post.author?.name || post.text || '');
    }

    if (sortMode === 'farmers') {
      products = query ? products : products.slice(0, 6);
      posts = query ? posts : posts.slice(0, 4);
    }

    if (sortMode === 'products') {
      farmers = query ? farmers : farmers.slice(0, 6);
      posts = query ? posts : posts.slice(0, 4);
    }

    updateSearchStatus(query, {
      farmers: farmers.length,
      products: products.length,
      posts: posts.length,
    });
    renderFarmerSearchResults(query, farmers, products, posts);

    renderFarmers(farmers.slice(0, 12));
    renderProducts(products.slice(0, 12));
    renderFeed(posts.slice(0, 8));
    renderNearby(products, farmers, posts);
    renderCategories(products);

    feedCache = posts;
    infiniteSections.innerHTML = '';
    page = 0;
    sentinel.textContent = query
      ? `Showing results for "${searchInput.value.trim()}".`
      : (feedCache.length ? 'Keep scrolling to discover more farmers and products.' : 'No live posts yet.');
  }

  paintGradients(
    Array.from(document.querySelectorAll('.avatar-ring')),
    'rgba(46, 125, 50, 0.25)',
    'rgba(174, 213, 129, 0.6)'
  );

  paintGradients(
    Array.from(document.querySelectorAll('.product-preview')),
    'rgba(129, 199, 132, 0.35)',
    'rgba(241, 248, 233, 0.9)'
  );

  let page = 0;
  let busy = false;

  function buildInfiniteBlock() {
    if (!feedCache.length) {
      return;
    }

    const section = document.createElement('section');
    section.className = 'feed-section reveal';
    section.innerHTML =
      '<div class="section-heading">' +
      '<h3>More For You</h3>' +
      '<a href="#">Batch ' + (page + 1) + '</a>' +
      '</div>' +
      '<div class="live-feed dynamic-feed"></div>';

    const dynamicFeed = section.querySelector('.dynamic-feed');
    for (let i = 0; i < 4; i++) {
      const postData = feedCache[(page + i) % feedCache.length];
      const clone = {
        ...postData,
        createdAt: postData.createdAt
      };
      dynamicFeed.appendChild(createPost(clone));
    }
    infiniteSections.appendChild(section);
  }

  function loadMoreFeed() {
    if (busy || !feedCache.length) {
      return;
    }
    busy = true;
    sentinel.textContent = 'Loading more from the community...';
    window.setTimeout(() => {
      buildInfiniteBlock();
      page += 1;
      busy = false;
      sentinel.textContent = 'Keep scrolling to discover more farmers and products.';
    }, 450);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMoreFeed();
      }
    },
    { root: null, threshold: 0.2 }
  );
  observer.observe(sentinel);

  async function loadLiveData() {
    farmerGrid.innerHTML = '<article class="farmer-card card-shell"><h4>Loading farmers...</h4><p class="location">Fetching live grower profiles.</p><p class="specialty"></p></article>';
    productGrid.innerHTML = '<article class="product-card card-shell"><h4>Loading products...</h4><p class="price"></p><p class="meta">Fetching current product listings.</p></article>';
    liveFeed.innerHTML = '<article class="post-card card-shell"><div class="post-head"><div><h4>Loading updates...</h4><p>Live feed</p></div></div><p class="post-copy">Fetching latest farmer and customer posts.</p><div class="post-meta"></div></article>';
    nearbyGrid.innerHTML = '<article class="nearby-card card-shell"><h4>Loading recommendations...</h4><p>Building nearby picks from live data.</p><span>Loading</span></article>';
    categoryWrap.innerHTML = '<button type="button" class="category-chip">Loading categories...</button>';

    const [farmersResult, productsResult, postsResult] = await Promise.allSettled([
      getFarmers({ limit: 12 }),
      getProducts({ limit: 24 }),
      getFeed({ limit: 32 })
    ]);

    const farmers = farmersResult.status === 'fulfilled' ? (farmersResult.value.data || []) : [];
    const products = productsResult.status === 'fulfilled' ? (productsResult.value.data || []) : [];
    const posts = postsResult.status === 'fulfilled' ? (postsResult.value.data || []) : [];

    allFarmers = farmers;
    allProducts = products;
    allPosts = posts;

    if (farmersResult.status === 'rejected') {
      allFarmers = [];
    }

    if (productsResult.status === 'rejected') {
      allProducts = [];
    }

    if (postsResult.status === 'rejected') {
      allPosts = [];
    }

    applySearchAndSort();
  }

  loadLiveData();

  searchForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    applySearchAndSort();
    searchInput?.blur();
  });
  searchInput?.addEventListener('input', applySearchAndSort);
  sortSelect?.addEventListener('change', applySearchAndSort);

  const canvas = document.getElementById('fallingCanvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const dust = [];
  for (let i = 0; i < 40; i++) {
    dust.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 1 + Math.random() * 2,
      speed: 0.1 + Math.random() * 0.3,
      drift: (Math.random() - 0.5) * 0.2
    });
  }

  function animateDust() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < dust.length; i++) {
      const d = dust[i];
      d.y += d.speed;
      d.x += d.drift;
      if (d.y > canvas.height) {
        d.y = -4;
      }
      if (d.x > canvas.width + 5) {
        d.x = -5;
      }
      if (d.x < -5) {
        d.x = canvas.width + 5;
      }
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 142, 60, 0.22)';
      ctx.fill();
    }
    window.requestAnimationFrame(animateDust);
  }
  animateDust();
})();
