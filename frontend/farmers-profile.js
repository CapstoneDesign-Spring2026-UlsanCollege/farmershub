import { getFarmers } from './js/farmerService.js';
import './assets/js/notification-float.js';

const main = document.querySelector('.farmer-profile');

function escHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderFarmers(farmers) {
  if (!farmers.length) {
    main.innerHTML = `
      <section class="profile-header">
        <div class="profile-info">
          <h2>No farmers yet</h2>
          <p class="location">Farmer profiles will appear here after accounts are created.</p>
        </div>
      </section>
    `;
    return;
  }

  main.innerHTML = `
    <section class="profile-header">
      <div class="profile-info">
        <h2>Farmers</h2>
        <p class="location">Choose a farmer to open their profile.</p>
      </div>
    </section>
    <section class="farmer-products">
      <h3>All Farmers</h3>
      <div class="products-grid" id="farmersDirectory"></div>
    </section>
  `;

  const grid = document.getElementById('farmersDirectory');
  farmers.forEach((farmer) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div style="padding:18px;">
        <h4>${escHtml(farmer.fullName)}</h4>
        <p>${escHtml(farmer.location || farmer.address || 'Location not set')}</p>
        <p>${escHtml(farmer.bio || farmer.farmType || 'Fresh produce from local farms')}</p>
        <a class="mini-link" href="profile.html?id=${encodeURIComponent(farmer.id)}">View profile</a>
      </div>
    `;
    card.addEventListener('click', (event) => {
      if (event.target.closest('a')) return;
      window.location.href = `profile.html?id=${encodeURIComponent(farmer.id)}`;
    });
    grid.appendChild(card);
  });
}

async function loadFarmers() {
  if (!main) return;
  main.innerHTML = `
    <section class="profile-header">
      <div class="profile-info">
        <h2>Loading farmers...</h2>
        <p class="location">Fetching live farmer profiles.</p>
      </div>
    </section>
  `;

  try {
    const response = await getFarmers({ limit: 100 });
    renderFarmers(response.data || []);
  } catch (error) {
    main.innerHTML = `
      <section class="profile-header">
        <div class="profile-info">
          <h2>Unable to load farmers</h2>
          <p class="location">${escHtml(error.message || 'Please make sure the backend is running.')}</p>
        </div>
      </section>
    `;
  }
}

loadFarmers();
