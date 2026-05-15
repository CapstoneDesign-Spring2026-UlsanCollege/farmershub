import { getProfile, updateProfile, updateFarmerProfile, uploadAvatar, uploadCover } from './js/profileService.js';
import { getFarmerById } from './js/farmerService.js';
import { getFeed, createPost, deletePost } from './js/postService.js';
import { isLoggedIn, logout } from './js/authService.js';

let currentProfile = null;
let isViewingPublicFarmer = false;

function getRequestedFarmerId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('farmer') || params.get('farmerId') || params.get('id') || '';
}

function setOwnerControlsVisible(visible) {
  ['editProfileBtn', 'submitPostBtn'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = visible ? '' : 'none';
  });

  ['coverInput', 'avatarInput', 'postImageInput'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = !visible;
  });

  document.querySelectorAll('.cover-upload-btn, .avatar-upload-btn, .create-post-card').forEach((el) => {
    el.style.display = visible ? '' : 'none';
  });
}

function normalisePublicFarmerProfile(farmer) {
  return {
    ...farmer,
    role: 'farmer',
    userId: farmer.id,
    products: farmer.productsLabel || farmer.cropTypes?.join(', ') || '',
    stats: {
      posts: farmer.posts?.length || 0,
      products: farmer.products?.length || 0,
    },
    posts: (farmer.posts || []).map((post) => ({
      ...post,
      text: post.text || post.content || '',
      author: { name: farmer.fullName },
      canDelete: false,
    })),
  };
}

function setStatus(message, type = 'info') {
  const el = document.getElementById('actionStatus');
  if (!el) return;
  el.textContent = message || '';
  el.className = `action-status ${type}`;
}

function validateImageFile(file, maxMb = 5) {
  if (!file) return { ok: false, message: 'Please choose an image first.' };
  if (!file.type || !file.type.startsWith('image/')) {
    return { ok: false, message: 'Only image files are allowed.' };
  }
  if (file.size > maxMb * 1024 * 1024) {
    return { ok: false, message: `Image must be smaller than ${maxMb}MB.` };
  }
  return { ok: true };
}

function showAuthGate() {
  document.getElementById('loginModal').style.display = 'flex';
  document.getElementById('profilePage').style.display = 'none';
}

function showProfilePage() {
  document.getElementById('loginModal').style.display = 'none';
  document.getElementById('profilePage').style.display = 'block';
}

function renderImage(targetId, placeholderId, url, placeholderFallback = '👤') {
  const img = document.getElementById(targetId);
  const placeholder = document.getElementById(placeholderId);

  if (url) {
    img.src = url;
    img.style.display = 'block';
    placeholder.style.display = 'none';
  } else {
    img.removeAttribute('src');
    img.style.display = 'none';
    placeholder.style.display = 'flex';
    placeholder.textContent = placeholderFallback;
  }
}

function renderProfile(profile) {
  currentProfile = profile;

  document.getElementById('profileName').textContent = profile.fullName;
  document.getElementById('profileRole').textContent = profile.role === 'farmer' ? 'Farmer' : 'Customer';
  document.getElementById('profileLocation').textContent = profile.location ? `📍 ${profile.location}` : '📍 Add your location';
  document.getElementById('bioText').textContent = profile.bio || 'No bio yet. Click "Edit Profile" to add one.';
  document.getElementById('farmNameDisplay').textContent = profile.farmName || 'Not set';
  document.getElementById('productsDisplay').textContent = profile.products || (profile.cropTypes?.join(', ') || 'Not set');
  document.getElementById('phoneDisplay').textContent = profile.phone || 'Not set';
  document.getElementById('postCount').textContent = String(profile.stats?.posts || 0);
  document.getElementById('productCount').textContent = String(profile.stats?.products || 0);

  renderImage('coverImg', 'coverPlaceholder', profile.coverUrl, '🌾 Add a cover photo of your farm');
  renderImage('avatarImg', 'avatarPlaceholder', profile.avatarUrl);

  const avatarSmall = document.getElementById('postAvatarSmall');
  avatarSmall.innerHTML = profile.avatarUrl
    ? `<img src="${profile.avatarUrl}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
    : '👤';
}

function openEditModal() {
  if (!currentProfile) return;

  document.getElementById('editName').value = currentProfile.fullName || '';
  document.getElementById('editRole').value = currentProfile.role || 'farmer';
  document.getElementById('editLocation').value = currentProfile.location || '';
  document.getElementById('editBio').value = currentProfile.bio || '';
  document.getElementById('editPhone').value = currentProfile.phone || '';
  document.getElementById('editFarmName').value = currentProfile.farmName || '';
  document.getElementById('editProducts').value = currentProfile.products || currentProfile.cropTypes?.join(', ') || '';
  document.getElementById('editModal').style.display = 'flex';
}

async function loadProfileData() {
  const requestedFarmerId = getRequestedFarmerId();

  if (requestedFarmerId) {
    isViewingPublicFarmer = true;
    setOwnerControlsVisible(false);
    const response = await getFarmerById(requestedFarmerId);
    renderProfile(normalisePublicFarmerProfile(response.data));
    return;
  }

  isViewingPublicFarmer = false;
  setOwnerControlsVisible(true);
  const response = await getProfile();
  renderProfile(response.data);
}

function renderPosts(posts) {
  const feed = document.getElementById('postsFeed');

  if (!posts.length) {
    feed.innerHTML = '<div class="post-card"><p class="post-text">No posts yet. Share your first update.</p></div>';
    return;
  }

  feed.innerHTML = posts.map(post => `
    <div class="post-card">
      <div class="post-header">
        <strong>${post.author?.name || currentProfile?.fullName || 'User'}</strong>
        <small>${new Date(post.createdAt).toLocaleDateString()}</small>
        ${post.canDelete === false || isViewingPublicFarmer ? '' : `<button class="delete-post-btn" data-id="${post.id}" title="Delete">✕</button>`}
      </div>
      ${post.text ? `<p class="post-text">${post.text}</p>` : ''}
      ${post.image ? `<img src="${post.image}" class="post-image" alt="Post image" />` : ''}
    </div>
  `).join('');

  feed.querySelectorAll('.delete-post-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await deletePost(btn.dataset.id);
        await loadPosts();
        await loadProfileData();
      } catch (error) {
        alert(error.message || 'Failed to delete post.');
      }
    });
  });
}

async function loadPosts() {
  if (!currentProfile) return;

  if (isViewingPublicFarmer) {
    renderPosts(currentProfile.posts || []);
    return;
  }

  const response = await getFeed({ authorId: currentProfile.userId, limit: 100 });
  renderPosts(response.data || []);
}

async function handleProfileSave(event) {
  event.preventDefault();

  const updates = {
    fullName: document.getElementById('editName').value.trim(),
    location: document.getElementById('editLocation').value.trim(),
    bio: document.getElementById('editBio').value.trim(),
    phone: document.getElementById('editPhone').value.trim(),
    farmName: document.getElementById('editFarmName').value.trim(),
    products: document.getElementById('editProducts').value.trim(),
    cropTypes: document.getElementById('editProducts').value.trim(),
  };

  try {
    setStatus('Saving profile...', 'info');
    const action = currentProfile?.role === 'farmer' ? updateFarmerProfile : updateProfile;
    const response = await action(updates);
    renderProfile(response.data);
    document.getElementById('editModal').style.display = 'none';
    setStatus('Profile updated successfully.', 'success');
  } catch (error) {
    setStatus(error.message || 'Failed to update profile.', 'error');
  }
}

async function handleAvatarUpload(event) {
  const file = event.target.files[0];
  const check = validateImageFile(file);
  if (!check.ok) {
    setStatus(check.message, 'error');
    event.target.value = '';
    return;
  }

  try {
    setStatus('Uploading avatar...', 'info');
    const response = await uploadAvatar(file);
    renderProfile(response.data);
    setStatus('Avatar uploaded successfully.', 'success');
    event.target.value = '';
  } catch (error) {
    setStatus(error.message || 'Failed to upload avatar.', 'error');
  }
}

async function handleCoverUpload(event) {
  const file = event.target.files[0];
  const check = validateImageFile(file);
  if (!check.ok) {
    setStatus(check.message, 'error');
    event.target.value = '';
    return;
  }

  try {
    setStatus('Uploading cover photo...', 'info');
    const response = await uploadCover(file);
    renderProfile(response.data);
    setStatus('Cover photo uploaded successfully.', 'success');
    event.target.value = '';
  } catch (error) {
    setStatus(error.message || 'Failed to upload cover image.', 'error');
  }
}

async function handlePostSubmit() {
  const text = document.getElementById('postInput').value.trim();
  const imageInput = document.getElementById('postImageInput');
  const file = imageInput.files[0];

  if (!text && !file) {
    setStatus('Write something or select an image before posting.', 'error');
    return;
  }

  if (file) {
    const check = validateImageFile(file);
    if (!check.ok) {
      setStatus(check.message, 'error');
      return;
    }
  }

  const form = new FormData();
  if (text) form.append('text', text);
  if (file) form.append('images', file);

  try {
    setStatus('Publishing post...', 'info');
    await createPost(form);
    document.getElementById('postInput').value = '';
    document.getElementById('postImageName').textContent = '';
    imageInput.value = '';
    await loadPosts();
    await loadProfileData();
    setStatus('Post published successfully.', 'success');
  } catch (error) {
    setStatus(error.message || 'Failed to create post.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('goLoginBtn').addEventListener('click', () => {
    window.location.href = 'login/login.html';
  });

  const requestedFarmerId = getRequestedFarmerId();

  if (!requestedFarmerId && !isLoggedIn()) {
    showAuthGate();
    return;
  }

  showProfilePage();

  document.getElementById('logoutBtn').addEventListener('click', () => {
    logout('index.html');
  });

  document.getElementById('editProfileBtn').addEventListener('click', openEditModal);
  document.getElementById('cancelEditBtn').addEventListener('click', () => {
    document.getElementById('editModal').style.display = 'none';
  });
  document.getElementById('editForm').addEventListener('submit', handleProfileSave);
  document.getElementById('avatarInput').addEventListener('change', handleAvatarUpload);
  document.getElementById('coverInput').addEventListener('change', handleCoverUpload);
  document.getElementById('submitPostBtn').addEventListener('click', handlePostSubmit);
  document.getElementById('postImageInput').addEventListener('change', (event) => {
    const name = event.target.files[0] ? event.target.files[0].name : '';
    document.getElementById('postImageName').textContent = name;
  });

  try {
    setStatus('Loading profile...', 'info');
    await loadProfileData();
    await loadPosts();
    setStatus('Profile loaded.', 'success');
  } catch (error) {
    if ((error.message || '').toLowerCase().includes('invalid') || (error.message || '').toLowerCase().includes('authentication')) {
      showAuthGate();
      return;
    }
    setStatus(error.message || 'Failed to load profile data.', 'error');
  }
});
