import { getProfile, updateProfile, updateFarmerProfile, uploadAvatar, uploadCover } from './js/profileService.js';
import { getFeed, createPost, deletePost } from './js/postService.js';
import { isLoggedIn, logout } from './js/authService.js';

let currentProfile = null;

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
        <button class="delete-post-btn" data-id="${post.id}" title="Delete">✕</button>
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
    const action = currentProfile?.role === 'farmer' ? updateFarmerProfile : updateProfile;
    const response = await action(updates);
    renderProfile(response.data);
    document.getElementById('editModal').style.display = 'none';
  } catch (error) {
    alert(error.message || 'Failed to update profile.');
  }
}

async function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const response = await uploadAvatar(file);
    renderProfile(response.data);
  } catch (error) {
    alert(error.message || 'Failed to upload avatar.');
  }
}

async function handleCoverUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const response = await uploadCover(file);
    renderProfile(response.data);
  } catch (error) {
    alert(error.message || 'Failed to upload cover image.');
  }
}

async function handlePostSubmit() {
  const text = document.getElementById('postInput').value.trim();
  const imageInput = document.getElementById('postImageInput');
  const file = imageInput.files[0];

  if (!text && !file) return;

  const form = new FormData();
  if (text) form.append('text', text);
  if (file) form.append('images', file);

  try {
    await createPost(form);
    document.getElementById('postInput').value = '';
    document.getElementById('postImageName').textContent = '';
    imageInput.value = '';
    await loadPosts();
    await loadProfileData();
  } catch (error) {
    alert(error.message || 'Failed to create post.');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('goLoginBtn').addEventListener('click', () => {
    window.location.href = 'login/login.html';
  });

  if (!isLoggedIn()) {
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
    await loadProfileData();
    await loadPosts();
  } catch (error) {
    if ((error.message || '').toLowerCase().includes('invalid') || (error.message || '').toLowerCase().includes('authentication')) {
      showAuthGate();
      return;
    }
    alert(error.message || 'Failed to load profile data.');
  }
});
