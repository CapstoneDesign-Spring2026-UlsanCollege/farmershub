import { getFeed, likePost } from './services/postService.js';

const FALLBACK_AVATAR = 'assets/images/home/farmer-fallback-1.webp';
const SAVED_POSTS_KEY = 'fh_saved_posts';

const stream = document.getElementById('postStream');
const status = document.getElementById('feedStatus');
const searchForm = document.getElementById('feedSearchForm');
const searchInput = searchForm?.querySelector('input[type="search"]');
const filterChips = Array.from(document.querySelectorAll('[data-filter-chip]'));
const pendingActions = document.querySelectorAll('[data-pending-action]');

let allPosts = [];
let activeFilter = 'all posts';

function setStatus(message) {
  if (status) status.textContent = message;
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
  avatar.addEventListener('error', () => {
    avatar.src = FALLBACK_AVATAR;
  }, { once: true });

  const identity = document.createElement('div');
  const name = document.createElement('h2');
  const profileLink = document.createElement('a');
  profileLink.textContent = post.author?.name || 'FarmersHub farmer';
  profileLink.href = post.author?.id
    ? `customer-farmer-profile.html?farmer=${encodeURIComponent(post.author.id)}`
    : 'customer-marketplace.html';
  const badge = document.createElement('span');
  badge.textContent = 'Farmer';
  name.append(profileLink, badge);

  const meta = document.createElement('p');
  meta.append(
    createIcon('<path d="M4 7h16v13H4Z"/><path d="M8 7a4 4 0 0 1 8 0"/>'),
    document.createTextNode(formatPostDate(post.createdAt))
  );
  identity.append(name, meta);
  person.append(avatar, identity);
  header.appendChild(person);
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
    link.href = `customer-product.html?id=${encodeURIComponent(post.linkedProductId)}`;
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

  const share = createAction(
    'Share',
    '<path d="m13 5 7 7-7 7"/><path d="M20 12H4"/>'
  );
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

function filteredPosts() {
  const query = String(searchInput?.value || '').trim().toLowerCase();
  return allPosts.filter((post) => {
    if (activeFilter === 'products' && !post.linkedProductId) return false;
    const text = [postText(post), post.author?.name].join(' ').toLowerCase();
    return !query || text.includes(query);
  });
}

function renderPosts() {
  const posts = filteredPosts();
  stream.replaceChildren();
  if (!posts.length) {
    renderState(
      allPosts.length ? 'No matching posts' : 'No farmer posts yet',
      allPosts.length
        ? 'Try another search or select All Posts.'
        : 'Updates will appear here after farmers publish them.'
    );
    setStatus(`${posts.length} farmer posts shown.`);
    return;
  }
  posts.forEach((post) => stream.appendChild(createPostCard(post)));
  setupYouTubeAutoplay(stream);
  setStatus(`${posts.length} farmer post${posts.length === 1 ? '' : 's'} shown.`);
}

async function loadPosts() {
  renderState('Loading farmer posts', 'Fetching the latest updates from FarmersHub.');
  try {
    const response = await getFeed({ limit: 100 });
    allPosts = (Array.isArray(response.data) ? response.data : [])
      .filter((post) => String(post.author?.role || '').toLowerCase() === 'farmer');
    renderPosts();
  } catch (error) {
    allPosts = [];
    renderState('Unable to load posts', error.message || 'Please try again later.');
    setStatus('The farmer feed could not be loaded.');
  }
}

filterChips.forEach((chip) => {
  const filter = chip.textContent.trim().toLowerCase();
  const supported = filter === 'all posts' || filter === 'farmers' || filter === 'products';
  if (!supported) {
    chip.disabled = true;
    chip.title = 'This filter needs location or following data that is not connected yet.';
    return;
  }
  chip.addEventListener('click', () => {
    activeFilter = filter === 'farmers' ? 'all posts' : filter;
    filterChips.forEach((button) => {
      const selected = button === chip;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    renderPosts();
  });
});

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  renderPosts();
});
searchInput?.addEventListener('input', renderPosts);

pendingActions.forEach((button) => {
  button.addEventListener('click', () => {
    setStatus('Customers can browse farmer posts here. Farmers publish updates from their profile.');
  });
});

loadPosts();
