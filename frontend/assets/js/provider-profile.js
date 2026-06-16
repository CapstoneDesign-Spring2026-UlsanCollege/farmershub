import {
  getProviderProfile,
  updateProviderProfile,
  resolveProviderImage,
  uploadProviderAvatar,
  uploadProviderCover,
  addEquipmentImages,
  deleteEquipmentImage,
  getMyProviderPosts,
  createProviderPost,
  deleteProviderPost,
} from './services/providerService.js';
import { getFarmServiceListings } from './services/farmServiceListingService.js';
import { requireProvider, appendField, clearElement, createStateCard, setStatus, humanize } from './provider-shell.js';

function fillForm(profile = {}) {
  const form = document.getElementById('providerProfileForm');
  ['businessName', 'businessType', 'serviceArea', 'location', 'publicEmail', 'publicPhone', 'website', 'operatingHours', 'bio'].forEach((name) => {
    if (form.elements[name]) form.elements[name].value = profile[name] || '';
  });
  if (form.elements.contactPreference) form.elements.contactPreference.value = profile.contactPreference || 'message';
  if (form.elements.serviceCategories) {
    form.elements.serviceCategories.value = (profile.serviceCategories || []).join(', ');
  }
}

function renderPreview(profile) {
  const preview = document.getElementById('providerProfilePreview');
  clearElement(preview);
  appendField(preview, 'Business', profile.businessName);
  appendField(preview, 'Service area', profile.serviceArea);
  appendField(preview, 'Categories', (profile.serviceCategories || []).map(humanize).join(', '));
  appendField(preview, 'Verification', profile.verificationStatus === 'approved' ? 'Approved' : 'Verification is pending platform review.');
  appendField(preview, 'Contact', profile.contactPreference);
}

function renderImagery(profile = {}) {
  const cover = document.getElementById('providerCoverPreview');
  const avatar = document.getElementById('providerAvatarPreview');
  const coverUrl = resolveProviderImage(profile.coverImage);
  const avatarUrl = resolveProviderImage(profile.avatar);
  cover.style.backgroundImage = coverUrl ? `url("${coverUrl}")` : '';
  cover.dataset.empty = coverUrl ? 'false' : 'true';
  avatar.style.backgroundImage = avatarUrl ? `url("${avatarUrl}")` : '';
  avatar.dataset.empty = avatarUrl ? 'false' : 'true';
  avatar.textContent = avatarUrl ? '' : (profile.businessName || 'P').trim().charAt(0).toUpperCase();
}

function renderEquipment(profile = {}) {
  const gallery = document.getElementById('providerEquipmentGallery');
  clearElement(gallery);
  const items = profile.equipment || [];
  if (!items.length) {
    gallery.appendChild(createStateCard('No equipment photos yet', 'Add photos of your machinery and tools.'));
    return;
  }
  items.forEach((item) => {
    const tile = document.createElement('figure');
    tile.className = 'provider-gallery-tile';
    const img = document.createElement('img');
    img.src = resolveProviderImage(item.imagePath);
    img.alt = item.caption || 'Equipment photo';
    img.loading = 'lazy';
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'provider-gallery-remove';
    del.setAttribute('aria-label', 'Remove photo');
    del.textContent = '×';
    del.addEventListener('click', async () => {
      del.disabled = true;
      try {
        const res = await deleteEquipmentImage(item.id);
        renderEquipment(res.data || {});
        setStatus('providerEquipmentStatus', 'Photo removed.');
      } catch (error) {
        del.disabled = false;
        setStatus('providerEquipmentStatus', error.message || 'Could not remove photo.', 'error');
      }
    });
    tile.append(img, del);
    if (item.caption) {
      const cap = document.createElement('figcaption');
      cap.textContent = item.caption;
      tile.appendChild(cap);
    }
    gallery.appendChild(tile);
  });
}

function renderPosts(posts = []) {
  const timeline = document.getElementById('providerPostTimeline');
  clearElement(timeline);
  if (!posts.length) {
    timeline.appendChild(createStateCard('No posts yet', 'Publish your first update above.'));
    return;
  }
  posts.forEach((post) => {
    const card = document.createElement('article');
    card.className = 'provider-post';

    const head = document.createElement('div');
    head.className = 'provider-post-head';
    const when = document.createElement('span');
    when.className = 'provider-muted';
    when.textContent = post.createdAt ? new Date(post.createdAt).toLocaleString() : '';
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'provider-post-delete';
    del.textContent = 'Delete';
    del.addEventListener('click', async () => {
      if (!window.confirm('Delete this post?')) return;
      del.disabled = true;
      try {
        await deleteProviderPost(post.id);
        card.remove();
        if (!document.querySelectorAll('.provider-post').length) renderPosts([]);
      } catch (error) {
        del.disabled = false;
        setStatus('providerPostStatus', error.message || 'Could not delete post.', 'error');
      }
    });
    head.append(when, del);
    card.appendChild(head);

    if (post.content) {
      const body = document.createElement('p');
      body.className = 'provider-post-content';
      body.textContent = post.content;
      card.appendChild(body);
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
      card.appendChild(grid);
    }

    timeline.appendChild(card);
  });
}

function payloadFrom(form) {
  const data = new FormData(form);
  return {
    businessName: String(data.get('businessName') || '').trim(),
    businessType: String(data.get('businessType') || '').trim(),
    serviceArea: String(data.get('serviceArea') || '').trim(),
    location: String(data.get('location') || '').trim(),
    publicEmail: String(data.get('publicEmail') || '').trim(),
    publicPhone: String(data.get('publicPhone') || '').trim(),
    website: String(data.get('website') || '').trim(),
    operatingHours: String(data.get('operatingHours') || '').trim(),
    bio: String(data.get('bio') || '').trim(),
    contactPreference: String(data.get('contactPreference') || 'message'),
    serviceCategories: String(data.get('serviceCategories') || '').split(',').map((item) => item.trim()).filter(Boolean),
  };
}

async function loadListings() {
  const listings = await getFarmServiceListings({ mine: 'true', status: 'active', limit: 20 });
  const active = listings.data?.listings || [];
  const list = document.getElementById('providerProfileListings');
  clearElement(list);
  if (!active.length) {
    list.appendChild(createStateCard('No active public listings', 'Publish a listing to show it on your public provider profile.'));
    return;
  }
  active.forEach((listing) => {
    const card = document.createElement('article');
    card.className = 'provider-card';
    const title = document.createElement('h3');
    title.textContent = listing.title;
    const copy = document.createElement('p');
    copy.textContent = `${humanize(listing.category)} - ${listing.serviceArea}`;
    card.append(title, copy);
    list.appendChild(card);
  });
}

function wireImagery() {
  const avatarInput = document.getElementById('providerAvatarInput');
  const coverInput = document.getElementById('providerCoverInput');

  avatarInput.addEventListener('change', async () => {
    const file = avatarInput.files?.[0];
    if (!file) return;
    setStatus('providerImageryStatus', 'Uploading photo…');
    try {
      const res = await uploadProviderAvatar(file);
      renderImagery(res.data || {});
      setStatus('providerImageryStatus', 'Profile photo updated.');
    } catch (error) {
      setStatus('providerImageryStatus', error.message || 'Could not upload photo.', 'error');
    } finally {
      avatarInput.value = '';
    }
  });

  coverInput.addEventListener('change', async () => {
    const file = coverInput.files?.[0];
    if (!file) return;
    setStatus('providerImageryStatus', 'Uploading cover…');
    try {
      const res = await uploadProviderCover(file);
      renderImagery(res.data || {});
      setStatus('providerImageryStatus', 'Cover image updated.');
    } catch (error) {
      setStatus('providerImageryStatus', error.message || 'Could not upload cover.', 'error');
    } finally {
      coverInput.value = '';
    }
  });
}

function wireEquipment() {
  const input = document.getElementById('providerEquipmentInput');
  input.addEventListener('change', async () => {
    const files = input.files;
    if (!files?.length) return;
    setStatus('providerEquipmentStatus', `Uploading ${files.length} photo${files.length === 1 ? '' : 's'}…`);
    try {
      const res = await addEquipmentImages(files);
      renderEquipment(res.data || {});
      setStatus('providerEquipmentStatus', 'Equipment photos added.');
    } catch (error) {
      setStatus('providerEquipmentStatus', error.message || 'Could not add photos.', 'error');
    } finally {
      input.value = '';
    }
  });
}

function wirePosts() {
  const form = document.getElementById('providerPostForm');
  const imagesInput = document.getElementById('providerPostImages');
  const hint = document.getElementById('providerPostFileHint');

  imagesInput.addEventListener('change', () => {
    const n = imagesInput.files?.length || 0;
    hint.textContent = n ? `${n} photo${n === 1 ? '' : 's'} selected` : '';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const content = String(new FormData(form).get('content') || '').trim();
    const files = imagesInput.files;
    if (!content && !(files && files.length)) {
      setStatus('providerPostStatus', 'Add a caption or at least one photo.', 'error');
      return;
    }
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    setStatus('providerPostStatus', 'Publishing…');
    try {
      await createProviderPost({ content, files });
      form.reset();
      hint.textContent = '';
      imagesInput.value = '';
      const res = await getMyProviderPosts();
      renderPosts(res.data?.posts || []);
      setStatus('providerPostStatus', 'Post published.');
    } catch (error) {
      setStatus('providerPostStatus', error.message || 'Could not publish post.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

async function initialise() {
  await requireProvider();
  const form = document.getElementById('providerProfileForm');

  try {
    const profileResponse = await getProviderProfile();
    const profile = profileResponse.data || {};
    fillForm(profile);
    renderPreview(profile);
    renderImagery(profile);
    renderEquipment(profile);
    await loadListings();
    const postsRes = await getMyProviderPosts();
    renderPosts(postsRes.data?.posts || []);
  } catch (error) {
    setStatus('providerProfileStatus', error.message || 'Unable to load profile.', 'error');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const response = await updateProviderProfile(payloadFrom(form));
      renderPreview(response.data || {});
      renderImagery(response.data || {});
      setStatus('providerProfileStatus', 'Profile saved.');
    } catch (error) {
      setStatus('providerProfileStatus', error.message || 'Unable to save profile.', 'error');
    }
  });

  wireImagery();
  wireEquipment();
  wirePosts();
}

document.addEventListener('DOMContentLoaded', initialise);
