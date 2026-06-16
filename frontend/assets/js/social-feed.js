import { getFeed, createPost, likePost } from './services/postService.js';
import { getToken } from './config/api.config.js';
import { getMyFollowing, followUser, unfollowUser } from './services/userService.js';
import { getUpcomingMarketEvents } from './services/marketEventService.js';

const FALLBACK_AVATAR = 'assets/images/home/farmer-fallback-1.webp';
const SAVED_POSTS_KEY = 'fh_saved_posts';
const userRole = document.body?.dataset?.pageRole || localStorage.getItem('fh_role') || '';
const isFarmer = userRole === 'farmer';

const stream = document.getElementById('postStream');
const status = document.getElementById('feedStatus');
const composerForm = document.getElementById('composerForm');
const composerText = document.getElementById('composerText');
const composerImages = document.getElementById('composerImages');
const composerStatus = document.getElementById('composerStatus');
const sortButton = document.getElementById('sortButton');
const searchForm = document.getElementById('feedSearchForm');
const searchInput = searchForm?.querySelector('input[type="search"]');
const filterChips = Array.from(document.querySelectorAll('[data-filter-chip]'));
const trendingList = document.getElementById('trendingCropsList');
const trendingEmpty = document.getElementById('trendingCropsEmpty');
const trendingMeta = document.getElementById('trendingCropsMeta');
const marketsList = document.getElementById('marketsList');
const marketsEmpty = document.getElementById('marketsEmpty');
const marketsMeta = document.getElementById('marketsMeta');

// Crop keywords used to surface "Trending Crops" from real community post text.
const CROP_KEYWORDS = [
  'tomato', 'potato', 'onion', 'carrot', 'cabbage', 'spinach', 'lettuce', 'cucumber', 'pepper', 'chili', 'chilli',
  'rice', 'wheat', 'corn', 'maize', 'barley', 'millet', 'soybean', 'lentil', 'bean', 'pea', 'garlic', 'ginger',
  'apple', 'banana', 'mango', 'orange', 'grape', 'strawberry', 'watermelon', 'melon', 'papaya', 'peach', 'pear', 'lemon',
  'egg', 'milk', 'cheese', 'honey', 'mushroom', 'pumpkin', 'radish', 'beetroot', 'broccoli', 'cauliflower', 'okra',
  'coffee', 'tea', 'sugarcane', 'cotton', 'coconut', 'avocado', 'pineapple', 'guava', 'plum', 'cherry', 'kiwi',
];

const SORT_MODES = ['latest', 'oldest', 'popular'];
const SORT_LABELS = { latest: 'Latest', oldest: 'Oldest', popular: 'Most Liked' };

if (composerForm && !isFarmer) {
  composerForm.closest('.composer-card')?.classList.add('composer-hidden');
}

let allPosts = [];
let activeFilter = 'all posts';
let activeSortIndex = 0;
let followingIds = new Set();

function currentUserId() {
  try {
    const stored = JSON.parse(localStorage.getItem('fh_user') || 'null');
    return String(stored?.id || stored?._id || '');
  } catch {
    return '';
  }
}

const myUserId = currentUserId();

async function loadFollowing() {
  if (!getToken()) {
    followingIds = new Set();
    return;
  }
  try {
    const response = await getMyFollowing();
    followingIds = new Set((Array.isArray(response.data) ? response.data : []).map(String));
  } catch {
    followingIds = new Set();
  }
}

function setStatus(message) {
  if (status) status.textContent = message;
}

function showComposerStatus(msg, autoHide = true) {
  if (!composerStatus) return;
  composerStatus.textContent = msg;
  composerStatus.classList.add('is-visible');
  if (autoHide) {
    clearTimeout(showComposerStatus._t);
    showComposerStatus._t = setTimeout(() => composerStatus.classList.remove('is-visible'), 3000);
  }
}

function formatPostDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function postId(post = {}) {
  return String(post.id || post._id || '');
}

function postText(post = {}) {
  return String(post.content || post.text || post.caption || '').trim();
}

function postImages(post = {}) {
  if (Array.isArray(post.imageUrls)) return post.imageUrls.filter(Boolean);
  return post.image ? [post.image] : [];
}

function normalizeYouTubeId(value) {
  const match = String(value || '').match(/^[A-Za-z0-9_-]{6,}$/);
  return match ? match[0] : null;
}

function extractYouTubeId(value) {
  const text = String(value || '');
  if (!text) return null;

  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?[^\s<>"']*v=([A-Za-z0-9_-]{6,})/i,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([A-Za-z0-9_-]{6,})/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    const videoId = normalizeYouTubeId(match?.[1]);
    if (videoId) return videoId;
  }

  return null;
}

function removeYouTubeUrls(value) {
  return String(value || '')
    .replace(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?[^\s<>"']*v=[A-Za-z0-9_-]{6,}[^\s<>"']*/gi, '')
    .replace(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/[A-Za-z0-9_-]{6,}[^\s<>"']*/gi, '')
    .replace(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/[A-Za-z0-9_-]{6,}[^\s<>"']*/gi, '')
    .replace(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/[A-Za-z0-9_-]{6,}[^\s<>"']*/gi, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function createYouTubeEmbed(videoId) {
  const safeVideoId = normalizeYouTubeId(videoId);
  if (!safeVideoId) return null;

  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    playsinline: '1',
    enablejsapi: '1',
    rel: '0',
  });

  const origin = window.location.origin;
  if (origin && origin !== 'null') params.set('origin', origin);

  const wrapper = document.createElement('div');
  wrapper.className = 'post-video youtube-embed';

  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${safeVideoId}?${params.toString()}`;
  iframe.title = 'YouTube video player';
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  iframe.dataset.youtubePlayer = 'true';

  wrapper.appendChild(iframe);
  return wrapper;
}

let youtubeAutoplayObserver = null;

function sendYouTubeCommand(iframe, command) {
  if (!iframe?.contentWindow) return;
  iframe.contentWindow.postMessage(JSON.stringify({
    event: 'command',
    func: command,
    args: [],
  }), 'https://www.youtube.com');
}

function resetYouTubeAutoplay() {
  if (youtubeAutoplayObserver) {
    youtubeAutoplayObserver.disconnect();
    youtubeAutoplayObserver = null;
  }
}

function setupYouTubeAutoplay(root) {
  resetYouTubeAutoplay();
  const frames = root.querySelectorAll('iframe[data-youtube-player="true"]');
  if (!frames.length || !('IntersectionObserver' in window)) return;

  youtubeAutoplayObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const iframe = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
        sendYouTubeCommand(iframe, 'playVideo');
      } else {
        sendYouTubeCommand(iframe, 'pauseVideo');
      }
    });
  }, { threshold: [0, 0.65] });

  frames.forEach((iframe) => youtubeAutoplayObserver.observe(iframe));
}

function readSavedPosts() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_POSTS_KEY) || '[]').map(String);
  } catch {
    return [];
  }
}

function toggleSavedPost(id) {
  const saved = readSavedPosts();
  const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
  localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(next));
  return next.includes(id);
}

function createIcon(paths) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = paths;
  return svg;
}

function createAction(label, iconPaths) {
  const button = document.createElement('button');
  button.type = 'button';
  button.append(createIcon(iconPaths), document.createTextNode(label));
  return button;
}

function renderState(title, message) {
  stream.replaceChildren();
  const card = document.createElement('article');
  card.className = 'post-card feed-state';
  const heading = document.createElement('strong');
  heading.textContent = title;
  const copy = document.createElement('p');
  copy.textContent = message;
  card.append(heading, copy);
  stream.appendChild(card);
}

function createPostCard(post) {
  const card = document.createElement('article');
  card.className = 'post-card';

  const header = document.createElement('header');
  header.className = 'post-header';
  const person = document.createElement('div');
  person.className = 'post-person';
  const avatar = document.createElement('img');
  avatar.src = post.author?.avatarUrl || FALLBACK_AVATAR;
  avatar.alt = '';
  avatar.addEventListener('error', () => { avatar.src = FALLBACK_AVATAR; }, { once: true });

  const identity = document.createElement('div');
  const name = document.createElement('h2');
  const profileLink = document.createElement('a');
  profileLink.textContent = post.author?.name || 'FarmersHub farmer';
  profileLink.href = isFarmer
    ? (post.author?.id ? `profile.html?id=${encodeURIComponent(post.author.id)}` : 'index.html')
    : (post.author?.id ? `customer-farmer-profile.html?farmer=${encodeURIComponent(post.author.id)}` : 'customer-marketplace.html');
  const badge = document.createElement('span');
  badge.textContent = post.author?.role === 'farmer' ? 'Farmer' : 'Member';
  name.append(profileLink, badge);

  const meta = document.createElement('p');
  meta.append(
    createIcon('<path d="M4 7h16v13H4Z"/><path d="M8 7a4 4 0 0 1 8 0"/>'),
    document.createTextNode(formatPostDate(post.createdAt))
  );
  identity.append(name, meta);
  person.append(avatar, identity);
  header.appendChild(person);

  const authorId = String(post.author?.id || '');
  if (myUserId && authorId && authorId !== myUserId) {
    const followBtn = document.createElement('button');
    followBtn.type = 'button';
    followBtn.className = 'post-follow-btn';
    const syncFollowLabel = () => {
      const isFollowing = followingIds.has(authorId);
      followBtn.textContent = isFollowing ? 'Following' : 'Follow';
      followBtn.classList.toggle('is-following', isFollowing);
      followBtn.setAttribute('aria-pressed', isFollowing ? 'true' : 'false');
    };
    syncFollowLabel();
    followBtn.addEventListener('click', async () => {
      if (!getToken()) { setStatus('Log in to follow farmers.'); return; }
      followBtn.disabled = true;
      const wasFollowing = followingIds.has(authorId);
      try {
        if (wasFollowing) {
          await unfollowUser(authorId);
          followingIds.delete(authorId);
        } else {
          await followUser(authorId);
          followingIds.add(authorId);
        }
        syncFollowLabel();
        if (activeFilter === 'following') renderPosts();
      } catch (error) {
        setStatus(error.message || 'Could not update follow.');
      } finally {
        followBtn.disabled = false;
      }
    });
    header.appendChild(followBtn);
  }

  card.appendChild(header);

  const content = postText(post);
  const youtubeId = extractYouTubeId([
    content,
    post.youtubeUrl,
    post.videoUrl,
    post.link,
  ].filter(Boolean).join(' '));
  const displayContent = youtubeId ? removeYouTubeUrls(content) : content;

  if (displayContent) {
    const text = document.createElement('p');
    text.className = 'post-text';
    text.textContent = displayContent;
    card.appendChild(text);
  }

  if (youtubeId) {
    const embed = createYouTubeEmbed(youtubeId);
    if (embed) card.appendChild(embed);
  }

  const images = postImages(post);
  if (images.length === 1) {
    const image = document.createElement('img');
    image.className = 'post-cover';
    image.src = images[0];
    image.alt = `Update from ${post.author?.name || 'a farmer'}`;
    image.addEventListener('error', () => image.remove(), { once: true });
    card.appendChild(image);
  } else if (images.length > 1) {
    const gallery = document.createElement('div');
    gallery.className = 'post-gallery';
    images.slice(0, 4).forEach((url) => {
      const image = document.createElement('img');
      image.src = url;
      image.alt = `Update from ${post.author?.name || 'a farmer'}`;
      image.addEventListener('error', () => image.remove(), { once: true });
      gallery.appendChild(image);
    });
    card.appendChild(gallery);
  }

  if (post.linkedProductId) {
    const product = document.createElement('div');
    product.className = 'product-preview';
    const copy = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = 'Product attached';
    const note = document.createElement('span');
    note.textContent = 'Open the farmer listing connected to this update.';
    copy.append(title, note);
    const link = document.createElement('a');
    link.href = isFarmer
      ? `products-management.html?id=${encodeURIComponent(post.linkedProductId)}`
      : `customer-product.html?id=${encodeURIComponent(post.linkedProductId)}`;
    link.textContent = 'View Product';
    product.append(copy, link);
    card.appendChild(product);
  }

  const actions = document.createElement('footer');
  actions.className = 'post-actions';
  actions.setAttribute('aria-label', 'Post actions');
  const id = postId(post);

  const like = createAction(
    `${Number(post.likesCount ?? post.likes ?? 0)} Likes`,
    '<path d="M12 20s-8-4.7-8-10.2A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 8 3.3C20 15.3 12 20 12 20Z"/>'
  );
  like.disabled = !id;
  like.addEventListener('click', async () => {
    like.disabled = true;
    try {
      const response = await likePost(id);
      const updated = response.data;
      const index = allPosts.findIndex((item) => postId(item) === id);
      if (index >= 0 && updated) allPosts[index] = updated;
      renderPosts();
    } catch (error) {
      setStatus(error.message || 'Sign in to like farmer posts.');
      like.disabled = false;
    }
  });

  const share = createAction('Share', '<path d="m13 5 7 7-7 7"/><path d="M20 12H4"/>');
  share.addEventListener('click', async () => {
    const url = `${window.location.href.split('#')[0]}#post-${id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.author?.name || 'FarmersHub post', text: content, url });
      } else {
        await navigator.clipboard.writeText(url);
        setStatus('Post link copied.');
      }
    } catch {
      setStatus('Unable to share this post.');
    }
  });

  const save = createAction(
    readSavedPosts().includes(id) ? 'Saved' : 'Save',
    '<path d="M7 4h10v16l-5-3-5 3V4Z"/>'
  );
  save.disabled = !id;
  save.addEventListener('click', () => {
    save.lastChild.textContent = toggleSavedPost(id) ? 'Saved' : 'Save';
  });

  actions.append(like, share, save);
  card.id = id ? `post-${id}` : '';
  card.appendChild(actions);
  return card;
}

function getSortedPosts(posts) {
  const mode = SORT_MODES[activeSortIndex];
  if (mode === 'oldest') return [...posts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (mode === 'popular') return [...posts].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
  return [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function filteredPosts() {
  const query = String(searchInput?.value || '').trim().toLowerCase();
  return allPosts.filter((post) => {
    if (activeFilter === 'products' && !post.linkedProductId) return false;
    if (activeFilter === 'farmers' && String(post.author?.role || '').toLowerCase() !== 'farmer') return false;
    if (activeFilter === 'following') {
      const authorId = String(post.author?.id || '');
      if (!authorId || !followingIds.has(authorId)) return false;
    }
    const text = [postText(post), post.author?.name].join(' ').toLowerCase();
    return !query || text.includes(query);
  });
}

function renderPosts() {
  const posts = getSortedPosts(filteredPosts());
  stream.replaceChildren();
  if (!posts.length) {
    if (activeFilter === 'following' && allPosts.length) {
      renderState(
        'No posts from people you follow',
        getToken()
          ? 'Use the Follow button on a post to add that farmer to this view.'
          : 'Log in and follow farmers to see their latest posts here.'
      );
    } else {
      renderState(
        allPosts.length ? 'No matching posts' : 'No farmer posts yet',
        allPosts.length
          ? 'Try another search or select All Posts.'
          : 'Updates will appear here after farmers publish them.'
      );
    }
    setStatus(`${posts.length} farmer posts shown.`);
    return;
  }
  posts.forEach((post) => stream.appendChild(createPostCard(post)));
  setupYouTubeAutoplay(stream);
  setStatus(`${posts.length} farmer post${posts.length === 1 ? '' : 's'} shown.`);
}

function computeTrendingCrops(posts) {
  const counts = new Map();

  const bump = (label) => {
    const key = label.toLowerCase();
    counts.set(key, (counts.get(key) || 0) + 1);
  };

  posts.forEach((post) => {
    const text = postText(post).toLowerCase();
    if (!text) return;
    const seen = new Set();

    // Curated crop keywords (matched with optional plural suffix).
    CROP_KEYWORDS.forEach((crop) => {
      if (seen.has(crop)) return;
      const pattern = new RegExp(`\\b${crop}(?:es|s)?\\b`, 'i');
      if (pattern.test(text)) {
        seen.add(crop);
        bump(crop);
      }
    });

    // Hashtags so the feed can surface emerging topics beyond the dictionary.
    const hashtags = text.match(/#([a-z][a-z0-9_]{2,20})/g) || [];
    hashtags.forEach((tag) => {
      const label = tag.slice(1);
      if (seen.has(label)) return;
      seen.add(label);
      bump(label);
    });
  });

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 6);
}

function renderTrendingCrops() {
  if (!trendingList || !trendingEmpty) return;

  const trends = computeTrendingCrops(allPosts);
  trendingList.replaceChildren();

  if (!trends.length) {
    trendingList.hidden = true;
    trendingEmpty.hidden = false;
    trendingEmpty.textContent = allPosts.length
      ? 'No crop mentions in recent community posts yet.'
      : 'Crop mentions across recent community posts will show up here.';
    if (trendingMeta) trendingMeta.textContent = 'Live';
    return;
  }

  trends.forEach((trend, index) => {
    const item = document.createElement('li');
    item.className = 'trending-item';

    const rank = document.createElement('span');
    rank.className = 'trending-rank';
    rank.textContent = String(index + 1);

    const name = document.createElement('span');
    name.className = 'trending-name';
    name.textContent = trend.name;

    const count = document.createElement('span');
    count.className = 'trending-count';
    count.textContent = `${trend.count} post${trend.count === 1 ? '' : 's'}`;

    item.append(rank, name, count);
    trendingList.appendChild(item);
  });

  trendingEmpty.hidden = true;
  trendingList.hidden = false;
  if (trendingMeta) trendingMeta.textContent = 'Live';
}

function formatMarketDate(startsAt, endsAt) {
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) return '';
  const dateOpts = { month: 'short', day: 'numeric' };
  const timeOpts = { hour: 'numeric', minute: '2-digit' };
  let label = `${start.toLocaleDateString([], dateOpts)} · ${start.toLocaleTimeString([], timeOpts)}`;
  if (endsAt) {
    const end = new Date(endsAt);
    if (!Number.isNaN(end.getTime())) {
      label += end.toDateString() === start.toDateString()
        ? `–${end.toLocaleTimeString([], timeOpts)}`
        : ` – ${end.toLocaleDateString([], dateOpts)}`;
    }
  }
  return label;
}

async function loadMarketEvents() {
  if (!marketsList || !marketsEmpty) return;
  try {
    const response = await getUpcomingMarketEvents({ limit: 5 });
    const events = Array.isArray(response.data) ? response.data : [];
    marketsList.replaceChildren();

    if (!events.length) {
      marketsList.hidden = true;
      marketsEmpty.hidden = false;
      marketsEmpty.textContent = 'No upcoming local markets are scheduled right now.';
      if (marketsMeta) marketsMeta.textContent = 'Live';
      return;
    }

    events.forEach((event) => {
      const item = document.createElement('li');
      item.className = 'markets-item';

      const title = document.createElement('span');
      title.className = 'markets-title';
      title.textContent = event.title;

      const meta = document.createElement('span');
      meta.className = 'markets-meta';
      meta.textContent = [formatMarketDate(event.startsAt, event.endsAt), event.location].filter(Boolean).join(' · ');

      item.append(title, meta);
      marketsList.appendChild(item);
    });

    marketsEmpty.hidden = true;
    marketsList.hidden = false;
    if (marketsMeta) marketsMeta.textContent = 'Live';
  } catch {
    marketsList.hidden = true;
    marketsEmpty.hidden = false;
    marketsEmpty.textContent = 'Local market events are unavailable right now.';
  }
}

async function loadPosts() {
  renderState('Loading farmer posts', 'Fetching the latest updates from FarmersHub.');
  try {
    const response = await getFeed({ limit: 100 });
    allPosts = Array.isArray(response.data) ? response.data : [];
    renderPosts();
    renderTrendingCrops();
  } catch (error) {
    allPosts = [];
    renderState('Unable to load posts', error.message || 'Please try again later.');
    setStatus('The farmer feed could not be loaded.');
    renderTrendingCrops();
  }
}

// Composer
composerForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!getToken()) { showComposerStatus('Please log in to post.', false); return; }
  if (!isFarmer) { showComposerStatus('Only farmers can post to the community feed.', false); return; }

  const content = composerText?.value?.trim() || '';
  const files = composerImages?.files || [];
  if (!content && !files.length) return;

  const submitBtn = composerForm.querySelector('[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Posting…'; }

  const fd = new FormData();
  if (content) fd.append('content', content);
  Array.from(files).slice(0, 4).forEach((f) => fd.append('images', f));

  try {
    await createPost(fd);
    if (composerText) composerText.value = '';
    if (composerImages) composerImages.value = '';
    showComposerStatus('Post shared!');
    await loadPosts();
  } catch (err) {
    showComposerStatus(err.message || 'Failed to post.', false);
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Post'; }
  }
});

// Filter chips
filterChips.forEach((chip) => {
  const label = chip.textContent.trim().toLowerCase();
  chip.addEventListener('click', () => {
    if (label.includes('nearby')) {
      showComposerStatus('Nearby filter requires location access — showing all posts.');
      activeFilter = 'all posts';
    } else if (label.includes('following')) {
      if (!getToken()) {
        showComposerStatus('Log in to see posts from farmers you follow.');
        activeFilter = 'all posts';
      } else {
        activeFilter = 'following';
        if (!followingIds.size) {
          showComposerStatus('Follow farmers with the Follow button to fill this view.');
        }
      }
    } else {
      activeFilter = label;
    }
    filterChips.forEach((c) => {
      const selected = c === chip;
      c.classList.toggle('active', selected);
      c.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    renderPosts();
  });
});

// Sort
sortButton?.addEventListener('click', () => {
  activeSortIndex = (activeSortIndex + 1) % SORT_MODES.length;
  const strong = sortButton.querySelector('strong');
  if (strong) strong.textContent = SORT_LABELS[SORT_MODES[activeSortIndex]];
  renderPosts();
});

// Search
searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  renderPosts();
});
searchInput?.addEventListener('input', renderPosts);

loadFollowing().then(loadPosts);
loadMarketEvents();
