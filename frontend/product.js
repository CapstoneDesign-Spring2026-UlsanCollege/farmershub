/**
 * product.js
 * Marketplace product listing page.
 * Loads products from /api/products, supports category filter + search.
 */
import { getProducts } from './js/productService.js';
import { isLoggedIn, logout } from './js/authService.js';
import './assets/js/notification-float.js';

let allProducts = [];
const pageParams = new URLSearchParams(window.location.search);
let activeCategory = pageParams.get('category') || '';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const grid        = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const filterBar   = document.getElementById('categoryFilterBar');
const emptyMsg    = document.getElementById('emptyMsg');
const loadingMsg  = document.getElementById('loadingMsg');
const detailModal = document.getElementById('detailModal');
const detailBody  = document.getElementById('detailBody');
const closeDetail = document.getElementById('closeDetailBtn');

// ── Auth nav ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn  = document.getElementById('navLoginBtn');
    const logoutBtn = document.getElementById('navLogoutBtn');
    if (isLoggedIn()) {
        loginBtn && (loginBtn.style.display = 'none');
        logoutBtn && (logoutBtn.style.display = 'inline-block');
    } else {
        loginBtn  && (loginBtn.style.display = 'inline-block');
        logoutBtn && (logoutBtn.style.display = 'none');
    }
    logoutBtn && logoutBtn.addEventListener('click', () => logout('index.html'));
});

// ── Load products ─────────────────────────────────────────────────────────────
async function loadProducts() {
    loadingMsg.style.display = 'block';
    grid.innerHTML = '';
    emptyMsg.style.display = 'none';

    try {
        const res = await getProducts({ limit: 100 });
        allProducts = res.data || [];
    } catch {
        allProducts = [];
    }

    loadingMsg.style.display = 'none';
    buildCategoryFilters();
    renderGrid();
    openRequestedProduct();
}

// ── Category filter chips ─────────────────────────────────────────────────────
function buildCategoryFilters() {
    const categories = Array.from(
        new Set(allProducts.map(p => (p.category || '').trim()).filter(Boolean))
    ).sort();

    filterBar.innerHTML = '';

    const allChip = makeChip('All', '');
    filterBar.appendChild(allChip);

    categories.forEach(cat => {
        filterBar.appendChild(makeChip(cap(cat), cat));
    });
}

function makeChip(label, value) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-chip' + (value === activeCategory ? ' active' : '');
    btn.textContent = label;
    btn.addEventListener('click', () => {
        activeCategory = value;
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        renderGrid();
    });
    return btn;
}

// ── Render grid ───────────────────────────────────────────────────────────────
function renderGrid() {
    const query = (searchInput.value || '').trim().toLowerCase();

    const filtered = allProducts.filter(p => {
        const matchCat = !activeCategory || String(p.category || '').toLowerCase() === String(activeCategory).toLowerCase();
        const matchQ   = !query ||
            (p.name || '').toLowerCase().includes(query) ||
            (p.description || '').toLowerCase().includes(query) ||
            (p.seller?.name || '').toLowerCase().includes(query);
        return matchCat && matchQ;
    });

    grid.innerHTML = '';

    if (!filtered.length) {
        emptyMsg.style.display = 'block';
        return;
    }
    emptyMsg.style.display = 'none';

    filtered.forEach(product => {
        grid.appendChild(makeProductCard(product));
    });
}

function getProductId(p) {
    return p.id || p._id || p.productId || p.slug || p.name || '';
}

function openRequestedProduct() {
    const requestedId = pageParams.get('productId') || pageParams.get('id');
    if (!requestedId) return;
    const requested = allProducts.find(p => String(getProductId(p)) === String(requestedId));
    if (requested) openDetail(requested);
}

function makeProductCard(p) {
    const article = document.createElement('article');
    article.className = 'mp-card';

    const imgHtml = p.imageUrl
        ? `<img src="${p.imageUrl}" alt="${escHtml(p.name)}" class="mp-card-img" />`
        : `<div class="mp-card-img mp-card-img--placeholder">🌾</div>`;

    const price = Number(p.price || p.sellingPrice || 0).toFixed(2);
    const hasDis = p.discount > 0;
    const originalPrice = Number(p.sellingPrice || 0).toFixed(2);

    article.innerHTML = `
        ${imgHtml}
        <div class="mp-card-body">
            <span class="mp-card-cat">${cap(p.category || 'general')}</span>
            <h3 class="mp-card-name">${escHtml(p.name)}</h3>
            <p class="mp-card-seller">by ${escHtml(p.seller?.name || 'Farmer')}</p>
            <div class="mp-card-price-row">
                <span class="mp-card-price">$${price}/${escHtml(p.unit || 'unit')}</span>
                ${hasDis ? `<span class="mp-card-original">$${originalPrice}</span><span class="mp-card-badge">${p.discount}% off</span>` : ''}
            </div>
            <p class="mp-card-stock">In stock: ${p.stock} ${escHtml(p.unit || '')}</p>
        </div>
    `;

    article.addEventListener('click', () => openDetail(p));
    return article;
}

// ── Product detail modal ──────────────────────────────────────────────────────
function openDetail(p) {
    const imgHtml = p.imageUrl
        ? `<img src="${p.imageUrl}" alt="${escHtml(p.name)}" class="detail-hero-img" />`
        : `<div class="detail-hero-img detail-hero-placeholder">🌾</div>`;

    const price = Number(p.price || p.sellingPrice || 0).toFixed(2);
    const payments = (p.paymentMethods || []).map(m => fmtPayment(m)).join(', ') || 'Contact seller';
    const harvestStr = p.harvestDate ? new Date(p.harvestDate).toLocaleDateString() : '—';
    const expiryStr  = p.expiryDate  ? new Date(p.expiryDate).toLocaleDateString()  : '—';

    const sellerName = escHtml(p.seller?.name || 'Seller');
    const sellerLabel = p.seller?.id
        ? `<a href="profile.html?farmer=${encodeURIComponent(p.seller.id)}">${sellerName}</a>`
        : sellerName;

    detailBody.innerHTML = `
        ${imgHtml}
        <h2 class="detail-name">${escHtml(p.name)}</h2>
        <span class="mp-card-cat">${cap(p.category || 'general')}</span>
        <p class="detail-desc">${escHtml(p.description || 'No description provided.')}</p>
        <div class="detail-grid">
            <div class="detail-row"><span>Price</span><strong>$${price} / ${escHtml(p.unit || 'unit')}</strong></div>
            ${p.discount > 0 ? `<div class="detail-row"><span>Discount</span><strong>${p.discount}% off (was $${Number(p.sellingPrice).toFixed(2)})</strong></div>` : ''}
            <div class="detail-row"><span>In Stock</span><strong>${p.stock} ${escHtml(p.unit || '')}</strong></div>
            <div class="detail-row"><span>Harvest Date</span><strong>${harvestStr}</strong></div>
            <div class="detail-row"><span>Best Before</span><strong>${expiryStr}</strong></div>
            <div class="detail-row"><span>Payment</span><strong>${payments}</strong></div>
        </div>
        <div class="detail-seller">
            <h4>Seller</h4>
            <p><strong>${sellerLabel}</strong></p>
            <p>${escHtml(p.seller?.location || p.seller?.email || '—')}</p>
            <p>${escHtml(p.seller?.phone || '')}</p>
        </div>
        <div class="detail-actions">
            ${p.seller?.id ? `<a class="mp-action-btn" href="messages.html?recipientId=${encodeURIComponent(p.seller.id)}&recipientName=${encodeURIComponent(p.seller?.name || 'Seller')}&recipientRole=farmer&productId=${encodeURIComponent(getProductId(p))}">Message Seller</a>` : `<a class="mp-action-btn" href="messages.html">Message Seller</a>`}
            ${p.seller?.id ? `<a class="mp-action-btn mp-action-btn-secondary" href="profile.html?farmer=${encodeURIComponent(p.seller.id)}">View Farmer</a>` : ''}
        </div>
    `;

    detailModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

closeDetail.addEventListener('click', closeDetailModal);
detailModal.addEventListener('click', e => { if (e.target === detailModal) closeDetailModal(); });

function closeDetailModal() {
    detailModal.style.display = 'none';
    document.body.style.overflow = '';
}

// ── Search ────────────────────────────────────────────────────────────────────
let searchTimer;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(renderGrid, 250);
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function cap(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function escHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtPayment(m) {
    const map = { cash: 'Cash', card: 'Card', bank_transfer: 'Bank Transfer', mobile_pay: 'Mobile Pay' };
    return map[m] || cap(m);
}

// ── Init ──────────────────────────────────────────────────────────────────────
loadProducts();
