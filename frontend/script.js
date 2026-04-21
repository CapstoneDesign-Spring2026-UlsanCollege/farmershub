import { getFarmers } from './js/farmerService.js';
import { getProducts } from './js/productService.js';
import { getFeed } from './js/postService.js';

(function () {
  let feedCache = [];

  const farmerGrid = document.getElementById('featuredFarmers');
  const productGrid = document.getElementById('trendingProducts');
  const nearbyGrid = document.getElementById('nearbyItems');
  const categoryWrap = document.getElementById('categoryWrap');
  const liveFeed = document.getElementById('liveFeed');
  const infiniteSections = document.getElementById('infiniteSections');
  const sentinel = document.getElementById('feedSentinel');

  const farmerTpl = document.getElementById('farmerCardTemplate');
  const productTpl = document.getElementById('productCardTemplate');
  const nearbyTpl = document.getElementById('nearbyCardTemplate');
  const postTpl = document.getElementById('postTemplate');

  function paintGradients(nodes, a, b) {
    nodes.forEach((node, i) => {
      const tilt = i % 2 === 0 ? '135deg' : '160deg';
      node.style.background = 'linear-gradient(' + tilt + ', ' + a + ', ' + b + ')';
    });
  }

  function renderFarmers(farmers) {
    if (!farmers.length) {
      farmerGrid.innerHTML = '<article class="farmer-card card-shell"><h4>No farmers yet</h4><p class="location">Grower profiles will appear here once added.</p><p class="specialty"></p></article>';
      return;
    }

    farmerGrid.innerHTML = '';
    farmers.forEach((farmer) => {
      const card = farmerTpl.content.firstElementChild.cloneNode(true);
      card.querySelector('h4').textContent = farmer.fullName;
      card.querySelector('.location').textContent = farmer.location || farmer.address || 'Location coming soon';
      card.querySelector('.specialty').textContent = farmer.bio || farmer.farmType || 'Fresh produce from local farms';
      const avatar = card.querySelector('.avatar-ring');
      if (farmer.avatarUrl) {
        avatar.style.backgroundImage = `url('${farmer.avatarUrl}')`;
        avatar.style.backgroundSize = 'cover';
        avatar.style.backgroundPosition = 'center';
      }
      const link = card.querySelector('.mini-link');
      link.href = `profile.html?farmer=${encodeURIComponent(farmer.id)}`;
      farmerGrid.appendChild(card);
    });
  }

  function renderProducts(products) {
    if (!products.length) {
      productGrid.innerHTML = '<article class="product-card card-shell"><h4>No products yet</h4><p class="price"></p><p class="meta">Listings will appear once farmers publish products.</p></article>';
      return;
    }

    productGrid.innerHTML = '';
    products.forEach((product) => {
      const card = productTpl.content.firstElementChild.cloneNode(true);
      card.querySelector('h4').textContent = product.name;
      card.querySelector('.price').textContent = `$${Number(product.price || 0).toFixed(2)}`;
      card.querySelector('.meta').textContent = `${product.category} • ${product.seller?.name || 'Farmer'}`;
      const preview = card.querySelector('.product-preview');
      if (product.imageUrl) {
        preview.innerHTML = `<img src="${product.imageUrl}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:20px;">`;
      }
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
    const categories = Array.from(new Set((products || []).map(product => (product.category || '').trim()).filter(Boolean))).slice(0, 10);

    if (!categories.length) {
      categoryWrap.innerHTML = '<button type="button" class="category-chip">No categories yet</button>';
      return;
    }

    categories.forEach((category) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'category-chip';
      chip.textContent = category;
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

    if (farmersResult.status === 'rejected') {
      farmerGrid.innerHTML = '<article class="farmer-card card-shell"><h4>Unable to load farmers</h4><p class="location">Start backend and ensure /api/farmers is available.</p><p class="specialty"></p></article>';
    } else {
      renderFarmers(farmers.slice(0, 6));
    }

    if (productsResult.status === 'rejected') {
      productGrid.innerHTML = '<article class="product-card card-shell"><h4>Unable to load products</h4><p class="price"></p><p class="meta">Start backend and ensure /api/products is available.</p></article>';
    } else {
      renderProducts(products.slice(0, 6));
    }

    if (postsResult.status === 'rejected') {
      liveFeed.innerHTML = '<article class="post-card card-shell"><div class="post-head"><div><h4>Unable to load updates</h4><p>Backend unavailable</p></div></div><p class="post-copy">Live feed data appears when /api/posts is reachable.</p><div class="post-meta"></div></article>';
      feedCache = [];
    } else {
      feedCache = posts;
      renderFeed(feedCache.slice(0, 4));
    }

    renderNearby(products, farmers, posts);
    renderCategories(products);
    sentinel.textContent = feedCache.length ? 'Keep scrolling to discover more farmers and products.' : 'No live posts yet.';
  }

  loadLiveData();

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
