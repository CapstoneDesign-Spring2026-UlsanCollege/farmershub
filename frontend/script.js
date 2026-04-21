(function () {
  const farmers = [
    { name: 'Eden Valley Farm', location: '12 km away', specialty: 'Heirloom tomatoes, leafy greens' },
    { name: 'Sunrise Orchard', location: '8 km away', specialty: 'Seasonal apples and citrus' },
    { name: 'Riverbend Organics', location: '16 km away', specialty: 'Chemical-free vegetable baskets' },
    { name: 'Highland Honey Co.', location: '21 km away', specialty: 'Raw honey and bee pollen' },
    { name: 'Golden Soil Co-op', location: '10 km away', specialty: 'Community supported farm packs' },
    { name: 'Meadow Fresh Dairy', location: '14 km away', specialty: 'Farm milk and artisan yogurt' }
  ];

  const products = [
    { title: 'Premium Rice Bundle', price: '$18.40', meta: 'Freshly milled this week' },
    { title: 'Organic Carrot Box', price: '$9.90', meta: 'Crunchy harvest, no chemicals' },
    { title: 'Farm Eggs (30 pack)', price: '$12.75', meta: 'Free-range and protein rich' },
    { title: 'Green Chili Basket', price: '$8.60', meta: 'Spicy local crop, same-day pickup' },
    { title: 'Sweet Corn Crate', price: '$11.20', meta: 'Morning harvest, sweet kernels' },
    { title: 'Spinach Fresh Pack', price: '$6.80', meta: 'Hydroponic and pesticide-free' }
  ];

  const nearby = [
    { title: '2 km: Farm pickup lane', text: 'Collect directly from Lakshmi family farm', tag: 'Pickup in 45 min' },
    { title: '4 km: Weekend market', text: '27 farmers offering produce this Saturday', tag: 'Opens 7:00 AM' },
    { title: '6 km: Bulk grain lot', text: 'Discounted for restaurants and resellers', tag: 'Limited stock' },
    { title: '9 km: Fresh herb center', text: 'Mint, basil, dill and rosemary bundles', tag: 'Popular nearby' }
  ];

  const categories = ['Organic', 'Grains', 'Vegetables', 'Fruits', 'Dairy', 'Poultry', 'Herbs', 'Bulk Supply', 'Farm Tools', 'Seedlings'];

  const posts = [
    { title: 'Nila from Riverbend', stamp: '2h ago', copy: 'First rain this week helped our spinach patch. New bundles listed with early-bird pricing for local buyers.', meta: '24 likes • 6 comments • 3 saves' },
    { title: 'Arun at Sunrise Orchard', stamp: '4h ago', copy: 'Citrus harvest is at peak sweetness. Posting a limited box for families and cafes in nearby neighborhoods.', meta: '32 likes • 9 comments • 5 shares' },
    { title: 'Meadow Fresh Dairy', stamp: '6h ago', copy: 'Small-batch yogurt now available in reusable jars. Return jars for a discount on your next order.', meta: '17 likes • 4 comments • 2 saves' },
    { title: 'Golden Soil Co-op', stamp: '8h ago', copy: 'We are opening 20 community farm subscription slots for weekly mixed produce delivery.', meta: '41 likes • 12 comments • 8 saves' }
  ];

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

  farmers.forEach((farmer) => {
    const card = farmerTpl.content.firstElementChild.cloneNode(true);
    card.querySelector('h4').textContent = farmer.name;
    card.querySelector('.location').textContent = farmer.location;
    card.querySelector('.specialty').textContent = farmer.specialty;
    farmerGrid.appendChild(card);
  });

  products.forEach((product) => {
    const card = productTpl.content.firstElementChild.cloneNode(true);
    card.querySelector('h4').textContent = product.title;
    card.querySelector('.price').textContent = product.price;
    card.querySelector('.meta').textContent = product.meta;
    productGrid.appendChild(card);
  });

  nearby.forEach((item) => {
    const card = nearbyTpl.content.firstElementChild.cloneNode(true);
    card.querySelector('h4').textContent = item.title;
    card.querySelector('p').textContent = item.text;
    card.querySelector('span').textContent = item.tag;
    nearbyGrid.appendChild(card);
  });

  categories.forEach((category) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'category-chip';
    chip.textContent = category;
    categoryWrap.appendChild(chip);
  });

  function createPost(item) {
    const post = postTpl.content.firstElementChild.cloneNode(true);
    post.querySelector('.post-head h4').textContent = item.title;
    post.querySelector('.post-head p').textContent = item.stamp;
    post.querySelector('.post-copy').textContent = item.copy;
    post.querySelector('.post-meta').textContent = item.meta;
    return post;
  }

  posts.forEach((item) => {
    liveFeed.appendChild(createPost(item));
  });

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
      const postData = posts[(page + i) % posts.length];
      const clone = {
        title: postData.title,
        stamp: (2 + page + i) + 'h ago',
        copy: postData.copy,
        meta: postData.meta
      };
      dynamicFeed.appendChild(createPost(clone));
    }
    infiniteSections.appendChild(section);
  }

  function loadMoreFeed() {
    if (busy) {
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
