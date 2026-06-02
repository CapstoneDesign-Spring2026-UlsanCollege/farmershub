import { getFeed, createPost, deletePost } from './services/postService.js';

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('fh_user') || 'null');
  } catch {
    return null;
  }
}

function getUserId(user) {
  return user?.id || user?._id || user?.userId || '';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

function formatDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function setSummary(title, text) {
  document.getElementById('feedSummaryTitle').textContent = title;
  document.getElementById('feedSummaryText').textContent = text;
}

function renderState(title, text) {
  document.getElementById('feedList').innerHTML = `
    <article class="workspace-panel workspace-state">
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(text)}</p>
    </article>
  `;
}

async function handleDelete(postId) {
  if (!postId) return;
  const confirmed = window.confirm('Delete this post? The backend will only allow the post owner or an admin.');
  if (!confirmed) return;
  await deletePost(postId);
  await loadFeed();
}

function renderPosts(posts, currentUserId) {
  const list = document.getElementById('feedList');
  list.innerHTML = '';

  posts.forEach((post) => {
    const author = post.author || {};
    const postId = post.id || post._id || '';
    const authorId = author.id || author._id || author.userId || '';
    const canDelete = postId && currentUserId && String(authorId) === String(currentUserId);
    const images = Array.isArray(post.imageUrls) ? post.imageUrls : (post.image ? [post.image] : []);

    const card = document.createElement('article');
    card.className = 'workspace-panel workspace-card post-card';
    card.innerHTML = `
      <div class="post-head">
        <div class="post-avatar" style="${author.avatarUrl ? `background-image:url('${escapeHtml(author.avatarUrl)}')` : ''}"></div>
        <div>
          <h3>${escapeHtml(author.name || 'FarmersHub farmer')}</h3>
          <span class="post-date">${escapeHtml(formatDate(post.createdAt))}</span>
        </div>
      </div>
      ${post.content || post.text || post.caption ? `<p class="post-copy">${escapeHtml(post.content || post.text || post.caption)}</p>` : ''}
      ${images.length ? `<div class="post-media-grid">${images.map((image) => `<img src="${escapeHtml(image)}" alt="Post media" loading="lazy">`).join('')}</div>` : ''}
      <div class="workspace-meta">
        <span class="workspace-pill">${Number(post.likesCount ?? post.likes ?? 0).toLocaleString()} likes</span>
        ${post.linkedProductId ? '<span class="workspace-pill">Linked product</span>' : ''}
      </div>
      ${canDelete ? '<div class="workspace-card-actions"><button class="workspace-danger" type="button" data-delete>Delete</button></div>' : ''}
    `;

    const deleteButton = card.querySelector('[data-delete]');
    if (deleteButton) {
      deleteButton.addEventListener('click', async () => {
        try {
          await handleDelete(postId);
        } catch (error) {
          window.alert(error.message || 'Failed to delete post.');
        }
      });
    }

    list.appendChild(card);
  });
}

async function loadFeed() {
  setSummary('Loading feed', 'Fetching real community posts.');
  renderState('Loading feed', 'Farm updates will appear here.');

  const user = getStoredUser();
  const currentUserId = getUserId(user);

  try {
    const response = await getFeed({ limit: 30 });
    const posts = Array.isArray(response.data) ? response.data : [];
    setSummary(`${posts.length} post${posts.length === 1 ? '' : 's'}`, 'Only real backend posts are shown.');

    if (!posts.length) {
      renderState('No posts yet', 'Create a farm update once you are logged in as a farmer.');
      return;
    }

    renderPosts(posts, currentUserId);
  } catch (error) {
    setSummary('Feed unavailable', 'The Posts API returned an error.');
    renderState('Posts could not be loaded', error.message || 'Try again later.');
  }
}

function setupComposer() {
  const user = getStoredUser();
  const role = localStorage.getItem('fh_role') || user?.role || '';
  const token = localStorage.getItem('fh_token');
  const panel = document.getElementById('composerPanel');
  const form = document.getElementById('postForm');
  const message = document.getElementById('composerMessage');

  if (token && role === 'farmer') {
    panel.hidden = false;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = 'Publishing post...';

    const formData = new FormData();
    formData.append('content', document.getElementById('postContent').value.trim());
    Array.from(document.getElementById('postImages').files || []).forEach((file) => {
      formData.append('images', file);
    });

    try {
      await createPost(formData);
      form.reset();
      message.textContent = 'Post published.';
      await loadFeed();
    } catch (error) {
      message.textContent = error.message || 'Post could not be published.';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupComposer();
  loadFeed();
});
