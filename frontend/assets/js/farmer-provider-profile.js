import { getProviderPublicProfile, resolveProviderImage } from './services/providerService.js';
import { requireFarmer, getQueryParam, appendField, clearElement, createStateCard, humanize, formatMoney, setStatus } from './farmer-services-shell.js';

function renderBanner(card, profile) {
  const coverUrl = resolveProviderImage(profile.coverImage);
  const avatarUrl = resolveProviderImage(profile.avatar);

  const cover = document.createElement('div');
  cover.className = 'provider-cover';
  cover.dataset.empty = coverUrl ? 'false' : 'true';
  if (coverUrl) cover.style.backgroundImage = `url("${coverUrl}")`;

  const row = document.createElement('div');
  row.className = 'provider-avatar-row';
  const avatar = document.createElement('div');
  avatar.className = 'provider-avatar';
  avatar.dataset.empty = avatarUrl ? 'false' : 'true';
  if (avatarUrl) avatar.style.backgroundImage = `url("${avatarUrl}")`;
  else avatar.textContent = (profile.businessName || 'P').trim().charAt(0).toUpperCase();
  row.appendChild(avatar);

  card.append(cover, row);
}

function renderEquipment(profile) {
  const card = document.getElementById('farmerProviderEquipmentCard');
  const gallery = document.getElementById('farmerProviderEquipment');
  clearElement(gallery);
  const items = profile.equipment || [];
  if (!items.length) {
    card.hidden = true;
    return;
  }
  card.hidden = false;
  items.forEach((item) => {
    const tile = document.createElement('figure');
    tile.className = 'provider-gallery-tile';
    const img = document.createElement('img');
    img.src = resolveProviderImage(item.imagePath);
    img.alt = item.caption || 'Equipment photo';
    img.loading = 'lazy';
    tile.appendChild(img);
    if (item.caption) {
      const cap = document.createElement('figcaption');
      cap.textContent = item.caption;
      tile.appendChild(cap);
    }
    gallery.appendChild(tile);
  });
}

function renderPosts(posts) {
  const card = document.getElementById('farmerProviderPostsCard');
  const timeline = document.getElementById('farmerProviderPosts');
  clearElement(timeline);
  if (!posts || !posts.length) {
    card.hidden = true;
    return;
  }
  card.hidden = false;
  posts.forEach((post) => {
    const article = document.createElement('article');
    article.className = 'provider-post';
    const when = document.createElement('span');
    when.className = 'provider-muted';
    when.textContent = post.createdAt ? new Date(post.createdAt).toLocaleString() : '';
    article.appendChild(when);
    if (post.content) {
      const body = document.createElement('p');
      body.className = 'provider-post-content';
      body.textContent = post.content;
      article.appendChild(body);
    }
    if ((post.imagePaths || []).length) {
      const grid = document.createElement('div');
      grid.className = 'provider-post-images';
      post.imagePaths.forEach((p) => {
        const img = document.createElement('img');
        img.src = resolveProviderImage(p);
        img.alt = 'Post photo';
        img.loading = 'lazy';
        grid.appendChild(img);
      });
      article.appendChild(grid);
    }
    timeline.appendChild(article);
  });
}

function renderProfile(data) {
  const profile = data.profile || {};
  const panel = document.getElementById('farmerProviderProfilePanel');
  clearElement(panel);
  const card = document.createElement('article');
  card.className = 'farmer-service-card';
  renderBanner(card, profile);
  const title = document.createElement('h2');
  title.textContent = profile.businessName || 'Provider profile';
  card.appendChild(title);
  appendField(card, 'Service area', profile.serviceArea);
  appendField(card, 'Business type', profile.businessType);
  appendField(card, 'About', profile.bio);
  appendField(card, 'Contact preference', humanize(profile.contactPreference));
  appendField(card, 'Verification', profile.verificationStatus === 'approved' ? 'Approved' : 'Verification is pending platform review.');
  panel.appendChild(card);

  renderEquipment(profile);
  renderPosts(data.posts || []);

  const listingsPanel = document.getElementById('farmerProviderListings');
  clearElement(listingsPanel);
  const listings = data.listings || [];
  if (!listings.length) {
    listingsPanel.appendChild(createStateCard('No active listings', 'This provider has no active farmer-facing services right now.'));
    return;
  }
  listings.forEach((listing) => {
    const listingCard = document.createElement('article');
    listingCard.className = 'farmer-service-card';
    const listingTitle = document.createElement('h3');
    listingTitle.textContent = listing.title;
    const copy = document.createElement('p');
    copy.textContent = `${humanize(listing.category)} - ${listing.pricingType === 'quote_required' ? 'Quote required' : formatMoney(listing.price)}`;
    const action = document.createElement('a');
    action.className = 'farmer-service-button';
    action.href = `farmer-service-detail.html?id=${encodeURIComponent(listing.id)}`;
    action.textContent = 'View service';
    listingCard.append(listingTitle, copy, action);
    listingsPanel.appendChild(listingCard);
  });
}

async function initialise() {
  await requireFarmer();
  const id = getQueryParam('id');
  if (!id) {
    document.getElementById('farmerProviderProfilePanel').appendChild(createStateCard('Provider missing', 'Open a provider from a service listing.', 'error'));
    return;
  }
  try {
    const response = await getProviderPublicProfile(id);
    renderProfile(response.data || {});
  } catch (error) {
    setStatus('farmerProviderProfileStatus', error.message || 'Unable to load provider profile.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', initialise);
