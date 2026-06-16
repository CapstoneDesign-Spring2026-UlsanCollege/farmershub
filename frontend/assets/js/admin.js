import { API_BASE, apiFetch, authHeader, jsonHeaders } from './config/api.config.js';

const ADMIN_ANALYTICS_PERIODS = [7, 30, 90];
const content = document.getElementById('adminContent');
const statusbar = document.getElementById('adminStatusbar');
const toast = document.getElementById('adminToast');
const modal = document.getElementById('adminModal');
const assistantThread = document.getElementById('assistantThread');
const assistantInput = document.getElementById('assistantInput');

let currentSection = 'dashboard';
let adminAnalyticsPeriod = 7;
let lastToastTimer = null;

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('fh_user') || 'null');
  } catch {
    return null;
  }
}

function getToken() {
  return localStorage.getItem('fh_token') || localStorage.getItem('farmershub_token') || '';
}

function clearSession() {
  ['fh_token', 'farmershub_token', 'fh_user', 'fh_loggedIn', 'fh_role', 'currentUser'].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

function redirectToLogin() {
  clearSession();
  window.location.href = 'login/login.html';
}

function isAdminUser(user) {
  return user?.role === 'admin';
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

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatDate(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function money(value) {
  return `KRW ${Number(value || 0).toLocaleString()}`;
}

function showToast(message, tone = 'success') {
  toast.textContent = message;
  toast.className = `admin-toast show ${tone === 'error' ? 'error' : ''}`;
  window.clearTimeout(lastToastTimer);
  lastToastTimer = window.setTimeout(() => {
    toast.className = 'admin-toast';
  }, 3200);
}

function pageTitle(title, text, actions = '') {
  return `
    <div class="admin-page-title">
      <div>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(text)}</p>
      </div>
      <div class="admin-actions">${actions}</div>
    </div>
  `;
}

function analyticsPeriodControls() {
  return `
    <div class="admin-period-controls" role="group" aria-label="Analytics time period">
      ${ADMIN_ANALYTICS_PERIODS.map((period) => `
        <button
          class="admin-button-secondary admin-period-button ${period === adminAnalyticsPeriod ? 'active' : ''}"
          type="button"
          data-admin-period="${period}"
          aria-pressed="${period === adminAnalyticsPeriod}">
          ${period} Days
        </button>
      `).join('')}
    </div>
  `;
}

function emptyState(text) {
  return `<div class="admin-empty">${escapeHtml(text)}</div>`;
}

function setLoading(title = 'Loading', text = 'Fetching secure admin data.') {
  content.innerHTML = `
    <section class="admin-loading">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(text)}</span>
    </section>
  `;
}

async function adminFetch(path, options = {}) {
  return apiFetch(path, options);
}

async function downloadBackup(fileName, downloadEndpoint) {
  if (!fileName || !downloadEndpoint) {
    throw new Error("Backup download details are missing.");
  }

  const response = await fetch(API_BASE + downloadEndpoint, {
    headers: authHeader(),
  });

  if (!response.ok) {
    let message = "Backup download failed.";
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Keep generic message when the server response is not JSON.
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

function updateActiveNav() {
  document.querySelectorAll('[data-section]').forEach((button) => {
    button.classList.toggle('active', button.dataset.section === currentSection);
  });
}

function updateStatusbar(system = {}) {
  statusbar.innerHTML = `
    <span>System Status: ${escapeHtml(system.status || 'Operational')}</span>
    <span>Maintenance: ${system.maintenanceMode ? 'ON' : 'OFF'}</span>
    <span>Database: ${escapeHtml(system.databaseStatus || 'Connected')}</span>
    <span>Version: ${escapeHtml(system.version || '1.0.0')}</span>
  `;
}

function metricCard(label, value, delta, tone = 'green') {
  return `
    <article class="admin-card admin-metric metric-${tone}">
      <span class="metric-icon">${escapeHtml(label.slice(0, 2).toUpperCase())}</span>
      <div>
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
        <small>${escapeHtml(delta)}</small>
      </div>
    </article>
  `;
}

function renderActivity(activity) {
  if (!activity?.length) return emptyState('No recent activity yet.');
  return `
    <div class="admin-list">
      ${activity.map((item) => `
        <article class="admin-list-item">
          <span class="admin-list-icon">${escapeHtml(String(item.type || 'A').slice(0, 2).toUpperCase())}</span>
          <div>
            <strong>${escapeHtml(item.text)}</strong>
            <span>${formatDate(item.createdAt)}</span>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

function renderTopFarmers(farmers) {
  if (!farmers?.length) return emptyState('No farmers found.');
  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr><th>Farmer</th><th>Products</th><th>Orders</th><th>Rating</th></tr>
        </thead>
        <tbody>
          ${farmers.map((farmer) => `
            <tr>
              <td>${escapeHtml(farmer.name)}<br><small>${escapeHtml(farmer.email)}</small></td>
              <td>${formatNumber(farmer.products)}</td>
              <td>${formatNumber(farmer.orders)}</td>
              <td>${farmer.rating ? escapeHtml(farmer.rating) : 'Not rated'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function drawLineChart(canvasId, chart, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(rect.width * ratio, 320);
  canvas.height = Math.max(rect.height * ratio, 170);
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const sourceValues = Array.isArray(chart?.values) ? chart.values : [];
  const sourceLabels = Array.isArray(chart?.labels) ? chart.labels : [];
  const itemCount = Math.max(sourceValues.length, sourceLabels.length, 1);
  const values = Array.from({ length: itemCount }, (_, index) => {
    const value = Number(sourceValues[index]);
    return Number.isFinite(value) ? Math.max(value, 0) : 0;
  });
  const labels = Array.from({ length: itemCount }, (_, index) => String(sourceLabels[index] || ''));
  const maxValue = Math.max(...values, 1);
  const padding = { left: 36, right: 12, top: 16, bottom: 34 };
  const width = rect.width - padding.left - padding.right;
  const height = rect.height - padding.top - padding.bottom;

  ctx.strokeStyle = '#e3ebdf';
  ctx.lineWidth = 1;
  ctx.font = '11px Manrope, Arial';
  ctx.fillStyle = '#6c7a70';

  for (let i = 0; i <= 3; i += 1) {
    const y = padding.top + (height / 3) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + width, y);
    ctx.stroke();
  }

  const points = values.map((value, index) => {
    const x = padding.left + (width / Math.max(values.length - 1, 1)) * index;
    const y = padding.top + height - (Number(value) / maxValue) * height;
    return { x, y, value };
  });

  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();

  const pointStep = Math.max(1, Math.ceil(points.length / 30));
  points.forEach((point, index) => {
    if (index % pointStep !== 0 && index !== points.length - 1) return;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  const labelStep = Math.max(1, Math.ceil(labels.length / 7));
  labels.forEach((label, index) => {
    if (index % labelStep !== 0 && index !== labels.length - 1) return;
    const x = padding.left + (width / Math.max(labels.length - 1, 1)) * index;
    ctx.fillStyle = '#6c7a70';
    ctx.fillText(label, Math.max(6, x - 18), rect.height - 12);
  });
}

async function loadDashboard({ period = adminAnalyticsPeriod } = {}) {
  const requestedPeriod = Number(period);
  adminAnalyticsPeriod = ADMIN_ANALYTICS_PERIODS.includes(requestedPeriod) ? requestedPeriod : 7;
  setLoading('Loading dashboard', 'Collecting users, products, orders, messages, and uploads.');
  const response = await adminFetch(`/admin/overview?period=${adminAnalyticsPeriod}`, { headers: jsonHeaders() });
  const data = response.data || {};
  const metrics = data.metrics || {};

  updateStatusbar(data.system || {});
  content.innerHTML = `
    ${pageTitle('Dashboard Overview', 'Manage FarmersHub users, products, orders, messages, uploads, and system activity.', analyticsPeriodControls())}
    <section class="admin-grid admin-metrics">
      ${metricCard('Total Users', formatNumber(metrics.totalUsers), '+ live database', 'green')}
      ${metricCard('Farmers', formatNumber(metrics.farmers), 'producer accounts', 'gold')}
      ${metricCard('Customers', formatNumber(metrics.customers), 'buyer accounts', 'blue')}
      ${metricCard('Sellers', formatNumber(metrics.sellers), 'provider accounts', 'purple')}
      ${metricCard('Products', formatNumber(metrics.products), 'market listings', 'green')}
      ${metricCard('Orders', formatNumber(metrics.orders), 'durable order rows', 'orange')}
      ${metricCard('Messages', formatNumber(metrics.messages), 'direct messages', 'blue')}
      ${metricCard('Uploads', formatNumber(metrics.uploads), 'stored media refs', 'purple')}
      ${metricCard('Feed Posts', formatNumber(metrics.feedPosts), 'community posts', 'orange')}
    </section>
    <section class="admin-grid admin-chart-grid">
      <article class="admin-card">
        <div class="admin-card-head"><h2>Users Over Time</h2><span class="admin-chart-period">${adminAnalyticsPeriod} days</span></div>
        <canvas class="admin-chart" id="usersChart"></canvas>
      </article>
      <article class="admin-card">
        <div class="admin-card-head"><h2>Products Over Time</h2><span class="admin-chart-period">${adminAnalyticsPeriod} days</span></div>
        <canvas class="admin-chart" id="productsChart"></canvas>
      </article>
      <article class="admin-card">
        <div class="admin-card-head"><h2>Orders Over Time</h2><span class="admin-chart-period">${adminAnalyticsPeriod} days</span></div>
        <canvas class="admin-chart" id="ordersChart"></canvas>
      </article>
    </section>
    <section class="admin-grid admin-dashboard-lower">
      <article class="admin-card">
        <div class="admin-card-head"><h2>Recent Activities</h2></div>
        ${renderActivity(data.recentActivities || [])}
      </article>
      <article class="admin-card">
        <div class="admin-card-head"><h2>Top Active Farmers</h2><button class="admin-button-secondary" type="button" data-section-jump="users">View All Farmers</button></div>
        ${renderTopFarmers(data.topFarmers || [])}
      </article>
    </section>
  `;

  window.requestAnimationFrame(() => {
    drawLineChart('usersChart', data.charts?.users, '#0f7a35');
    drawLineChart('productsChart', data.charts?.products, '#2167d8');
    drawLineChart('ordersChart', data.charts?.orders, '#e97718');
  });
}

function usersTable(users) {
  if (!users.length) return emptyState('No users match this filter.');
  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${users.map((user) => `
            <tr>
              <td>${escapeHtml(user.fullName || 'No name')}</td>
              <td>${escapeHtml(user.email)}</td>
              <td>${escapeHtml(user.role)}</td>
              <td>${user.isActive ? 'Active' : 'Inactive'}</td>
              <td>${formatDate(user.createdAt)}</td>
              <td>
                <div class="admin-actions">
                  <button class="admin-button-secondary" type="button" data-action="user-detail" data-id="${escapeHtml(user.id)}">Details</button>
                  ${user.role === 'admin' ? '' : `<button class="admin-button-danger" type="button" data-action="delete-user" data-id="${escapeHtml(user.id)}">Delete</button>`}
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function loadUsers(params = {}) {
  setLoading('Loading users', 'Fetching platform accounts.');
  const query = new URLSearchParams({ limit: 100, ...params }).toString();
  const response = await adminFetch(`/admin/users?${query}`, { headers: jsonHeaders() });
  const users = response.data?.users || [];
  content.innerHTML = `
    ${pageTitle('User Management', 'View users by role, inspect details, and hard delete accounts with related data.')}
    <section class="admin-card">
      <form class="admin-filters" data-admin-form="users">
        <input class="admin-field" name="search" placeholder="Search name, email, phone, address" value="${escapeHtml(params.search || '')}">
        <select class="admin-field" name="role">
          ${['all', 'farmer', 'customer', 'provider', 'admin'].map((role) => `<option value="${role}" ${params.role === role ? 'selected' : ''}>${role}</option>`).join('')}
        </select>
        <select class="admin-field" name="status">
          ${['all', 'active', 'inactive'].map((status) => `<option value="${status}" ${params.status === status ? 'selected' : ''}>${status}</option>`).join('')}
        </select>
        <button class="admin-button" type="submit">Filter</button>
      </form>
      ${usersTable(users)}
    </section>
  `;
}

function productsTable(products) {
  if (!products.length) return emptyState('No products found.');
  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr><th>Product</th><th>Seller</th><th>Category</th><th>Price</th><th>Stock</th><th>Created</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${products.map((product) => `
            <tr>
              <td>${escapeHtml(product.name)}</td>
              <td>${escapeHtml(product.seller?.email || product.seller?.name || 'Unknown')}</td>
              <td>${escapeHtml(product.category || 'uncategorized')}</td>
              <td>${money(product.price || product.sellingPrice)}</td>
              <td>${formatNumber(product.stock)} ${escapeHtml(product.unit || '')}</td>
              <td>${formatDate(product.createdAt)}</td>
              <td><button class="admin-button-danger" type="button" data-action="delete-product" data-id="${escapeHtml(product.id)}">Delete</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function uploadsList(uploads) {
  const refs = uploads.references || [];
  if (!refs.length) return emptyState('No database upload references found.');
  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Label</th><th>Type</th><th>Path</th><th>Created</th><th>Action</th></tr></thead>
        <tbody>
          ${refs.map((upload) => `
            <tr>
              <td>${escapeHtml(upload.label || 'Upload')}</td>
              <td>${escapeHtml(upload.ownerType)}</td>
              <td>${escapeHtml(upload.path)}</td>
              <td>${formatDate(upload.createdAt)}</td>
              <td>
                <button class="admin-button-danger" type="button"
                  data-action="delete-upload"
                  data-path="${escapeHtml(upload.path)}"
                  data-owner-type="${escapeHtml(upload.ownerType)}"
                  data-owner-id="${escapeHtml(upload.ownerId)}">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function loadProductsAndUploads(params = {}) {
  setLoading('Loading products and uploads', 'Fetching listings and uploaded media.');
  const query = new URLSearchParams({ limit: 100, ...params }).toString();
  const [productsResponse, uploadsResponse] = await Promise.all([
    adminFetch(`/admin/products?${query}`, { headers: jsonHeaders() }),
    adminFetch('/admin/uploads', { headers: jsonHeaders() }),
  ]);
  const products = productsResponse.data?.products || [];
  const uploads = uploadsResponse.data || {};
  content.innerHTML = `
    ${pageTitle('Products & Uploads', 'Review product listings, remove uploaded files, and delete unsafe or duplicate content.')}
    <section class="admin-card">
      <form class="admin-filters" data-admin-form="products">
        <input class="admin-field" name="search" placeholder="Search products, sellers, descriptions" value="${escapeHtml(params.search || '')}">
        <select class="admin-field" name="category">
          <option value="all">all categories</option>
          <option value="vegetables" ${params.category === 'vegetables' ? 'selected' : ''}>vegetables</option>
          <option value="fruits" ${params.category === 'fruits' ? 'selected' : ''}>fruits</option>
          <option value="grains" ${params.category === 'grains' ? 'selected' : ''}>grains</option>
        </select>
        <span></span>
        <button class="admin-button" type="submit">Filter</button>
      </form>
      ${productsTable(products)}
    </section>
    <section class="admin-card" style="margin-top:16px;">
      <div class="admin-card-head">
        <h2>Uploads</h2>
        <p>${formatNumber(uploads.count)} references, ${(Number(uploads.totalBytes || 0) / 1024 / 1024).toFixed(2)} MB on disk</p>
      </div>
      ${uploadsList(uploads)}
    </section>
  `;
}

function ordersTable(orders, statuses) {
  if (!orders.length) return emptyState('No orders found.');
  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr><th>Order</th><th>Product</th><th>Customer</th><th>Farmer</th><th>Total</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${orders.map((order) => `
            <tr>
              <td>${escapeHtml(order.orderNumber)}<br><small>${formatDate(order.createdAt)}</small></td>
              <td>${escapeHtml(order.product?.name || '')}<br><small>${formatNumber(order.quantity)} ${escapeHtml(order.product?.unit || '')}</small></td>
              <td>${escapeHtml(order.customer?.email || '')}</td>
              <td>${escapeHtml(order.farmer?.email || '')}</td>
              <td>${money(order.totalAmount)}</td>
              <td>
                <select class="admin-field" data-action="order-status" data-id="${escapeHtml(order.id)}">
                  ${statuses.map((status) => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}
                </select>
              </td>
              <td><button class="admin-button-danger" type="button" data-action="delete-order" data-id="${escapeHtml(order.id)}">Delete</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function loadOrders(params = {}) {
  setLoading('Loading orders', 'Fetching durable order rows.');
  const query = new URLSearchParams({ limit: 100, ...params }).toString();
  const response = await adminFetch(`/admin/orders?${query}`, { headers: jsonHeaders() });
  const orders = response.data?.orders || [];
  const statuses = response.data?.statuses || ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  content.innerHTML = `
    ${pageTitle('Orders Management', 'View, filter, update, and delete customer orders.')}
    <section class="admin-card">
      <form class="admin-filters" data-admin-form="orders">
        <input class="admin-field" name="search" placeholder="Search order, product, customer, farmer" value="${escapeHtml(params.search || '')}">
        <select class="admin-field" name="status">
          ${['all', ...statuses].map((status) => `<option value="${status}" ${params.status === status ? 'selected' : ''}>${status}</option>`).join('')}
        </select>
        <span></span>
        <button class="admin-button" type="submit">Filter</button>
      </form>
      ${ordersTable(orders, statuses)}
    </section>
  `;
}

function rechargesTable(requests) {
  if (!requests.length) return emptyState('No recharge requests found.');
  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr><th>Requester</th><th>Role</th><th>Amount</th><th>Note</th><th>Status</th><th>Requested</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${requests.map((req) => `
            <tr>
              <td>${escapeHtml(req.requesterName || '')}</td>
              <td>${escapeHtml(req.requesterRole || '')}</td>
              <td>${money(req.amount)}</td>
              <td>${escapeHtml(req.note || '')}</td>
              <td>${escapeHtml(req.status)}</td>
              <td>${formatDate(req.createdAt)}</td>
              <td>
                ${req.status === 'pending' ? `
                  <button class="admin-button" type="button" data-action="approve-recharge" data-id="${escapeHtml(req.id)}">Approve</button>
                  <button class="admin-button-danger" type="button" data-action="reject-recharge" data-id="${escapeHtml(req.id)}">Reject</button>
                ` : `<small>${req.reviewedAt ? formatDate(req.reviewedAt) : ''}${req.reviewNote ? ` · ${escapeHtml(req.reviewNote)}` : ''}</small>`}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function loadRecharges(params = {}) {
  setLoading('Loading recharge requests', 'Fetching wallet top-up requests.');
  const query = new URLSearchParams({ limit: 100, ...params }).toString();
  const response = await adminFetch(`/admin/recharge-requests?${query}`, { headers: jsonHeaders() });
  const requests = response.data?.requests || [];
  const pendingCount = response.data?.pendingCount ?? 0;
  const statuses = ['all', 'pending', 'approved', 'rejected'];
  content.innerHTML = `
    ${pageTitle('Wallet Recharges', `Approve or reject virtual money top-up requests. ${pendingCount} pending.`)}
    <section class="admin-card">
      <form class="admin-filters" data-admin-form="recharges">
        <select class="admin-field" name="status">
          ${statuses.map((status) => `<option value="${status}" ${params.status === status ? 'selected' : ''}>${status}</option>`).join('')}
        </select>
        <span></span>
        <button class="admin-button" type="submit">Filter</button>
      </form>
      ${rechargesTable(requests)}
    </section>
  `;
}

async function reviewRecharge(id, action) {
  await adminFetch(`/admin/recharge-requests/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: jsonHeaders(),
    body: JSON.stringify({ action, note: action === 'approve' ? 'Approved from Admin Panel' : 'Rejected from Admin Panel' }),
  });
  showToast(`Recharge ${action === 'approve' ? 'approved' : 'rejected'}.`);
  await loadRecharges();
}

function messagesTable(messages) {
  if (!messages.length) return emptyState('No messages found.');
  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Sender</th><th>Receiver</th><th>Message</th><th>Date</th><th>Action</th></tr></thead>
        <tbody>
          ${messages.map((message) => `
            <tr>
              <td>${escapeHtml(message.sender?.email || message.sender?.fullName || '')}</td>
              <td>${escapeHtml(message.receiver?.email || message.receiver?.fullName || '')}</td>
              <td>${escapeHtml(message.content)}</td>
              <td>${formatDate(message.createdAt)}</td>
              <td><button class="admin-button-danger" type="button" data-action="delete-message" data-id="${escapeHtml(message.id)}">Delete</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function loadMessages(params = {}) {
  setLoading('Loading messages', 'Fetching platform conversations.');
  const query = new URLSearchParams({ limit: 100, ...params }).toString();
  const response = await adminFetch(`/admin/messages?${query}`, { headers: jsonHeaders() });
  const messages = response.data?.messages || [];
  content.innerHTML = `
    ${pageTitle('Messages Management', 'Review direct messages and remove abusive conversations or messages.')}
    <section class="admin-card">
      <form class="admin-filters" data-admin-form="messages">
        <input class="admin-field" name="search" placeholder="Search message text" value="${escapeHtml(params.search || '')}">
        <span></span><span></span>
        <button class="admin-button" type="submit">Search</button>
      </form>
      ${messagesTable(messages)}
    </section>
  `;
}

async function loadSettings() {
  setLoading('Loading settings', 'Fetching admin settings.');
  const response = await adminFetch('/admin/settings', { headers: jsonHeaders() });
  const settings = response.data || {};
  content.innerHTML = `
    ${pageTitle('System Settings', 'Edit basic site metadata, contact email, announcements, and maintenance mode.')}
    <section class="admin-card">
      <form class="admin-form admin-form-grid" data-admin-form="settings">
        <label>Site title<input name="siteTitle" value="${escapeHtml(settings.siteTitle || '')}"></label>
        <label>Contact email<input name="contactEmail" type="email" value="${escapeHtml(settings.contactEmail || '')}"></label>
        <label class="wide">Site description<textarea name="siteDescription">${escapeHtml(settings.siteDescription || '')}</textarea></label>
        <label class="admin-switch"><input name="maintenanceMode" type="checkbox" ${settings.maintenanceMode ? 'checked' : ''}> Maintenance mode</label>
        <label class="admin-switch"><input name="announcementsEnabled" type="checkbox" ${settings.announcementsEnabled ? 'checked' : ''}> Announcements enabled</label>
        <div class="wide admin-actions"><button class="admin-button" type="submit">Save Settings</button></div>
      </form>
    </section>
  `;
}

function announcementsList(announcements) {
  if (!announcements.length) return emptyState('No announcements created yet.');
  return `
    <div class="admin-list">
      ${announcements.map((announcement) => `
        <article class="admin-list-item">
          <span class="admin-list-icon">AN</span>
          <div>
            <strong>${escapeHtml(announcement.title)}</strong>
            <span>${escapeHtml(announcement.audience)} audience - ${formatDate(announcement.createdAt)} - ${announcement.isActive ? 'Active' : 'Inactive'}</span>
            <p>${escapeHtml(announcement.body)}</p>
            ${announcement.isActive ? `<button class="admin-button-danger" type="button" data-action="delete-announcement" data-id="${escapeHtml(announcement._id || announcement.id)}">Deactivate</button>` : ''}
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

async function loadAnnouncements() {
  setLoading('Loading announcements', 'Fetching admin announcements.');
  const response = await adminFetch('/admin/announcements', { headers: jsonHeaders() });
  const announcements = response.data?.announcements || [];
  content.innerHTML = `
    ${pageTitle('Announcements', 'Publish platform announcements and optional user notifications.')}
    <section class="admin-grid admin-dashboard-lower">
      <article class="admin-card">
        <div class="admin-card-head"><h2>New Announcement</h2></div>
        <form class="admin-form" data-admin-form="announcement">
          <label>Title<input name="title" required></label>
          <label>Audience<select name="audience"><option value="all">all</option><option value="farmer">farmer</option><option value="customer">customer</option><option value="provider">provider</option></select></label>
          <label>Message<textarea name="body" required></textarea></label>
          <label class="admin-switch"><input name="sendNotification" type="checkbox" checked> Send as notification</label>
          <button class="admin-button" type="submit">Publish</button>
        </form>
      </article>
      <article class="admin-card">
        <div class="admin-card-head"><h2>Recent Announcements</h2></div>
        ${announcementsList(announcements)}
      </article>
    </section>
  `;
}

function marketEventsList(events) {
  if (!events.length) return emptyState('No market events scheduled yet.');
  return `
    <div class="admin-list">
      ${events.map((event) => `
        <article class="admin-list-item">
          <span class="admin-list-icon">MK</span>
          <div>
            <strong>${escapeHtml(event.title)}</strong>
            <span>${escapeHtml(event.location)} - ${formatDate(event.startsAt)}</span>
            ${event.description ? `<p>${escapeHtml(event.description)}</p>` : ''}
            <button class="admin-button-danger" type="button" data-action="delete-market" data-id="${escapeHtml(event.id || event._id)}">Delete</button>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

async function loadMarkets() {
  setLoading('Loading market events', 'Fetching upcoming local markets.');
  const response = await adminFetch('/market-events?includePast=true&limit=50', { headers: jsonHeaders() });
  const events = response.data || [];
  content.innerHTML = `
    ${pageTitle('Local Markets', 'Publish upcoming local market events shown in the community feed widgets.')}
    <section class="admin-grid admin-dashboard-lower">
      <article class="admin-card">
        <div class="admin-card-head"><h2>New Market Event</h2></div>
        <form class="admin-form" data-admin-form="market-event">
          <label>Title<input name="title" maxlength="140" required></label>
          <label>Location<input name="location" maxlength="180" required></label>
          <label>Starts<input name="startsAt" type="datetime-local" required></label>
          <label>Ends (optional)<input name="endsAt" type="datetime-local"></label>
          <label>Details (optional)<textarea name="description" maxlength="1000"></textarea></label>
          <button class="admin-button" type="submit">Publish event</button>
        </form>
      </article>
      <article class="admin-card">
        <div class="admin-card-head"><h2>Scheduled Markets</h2></div>
        ${marketEventsList(events)}
      </article>
    </section>
  `;
}

async function loadLogs() {
  setLoading('Loading logs', 'Fetching admin action logs.');
  const response = await adminFetch('/admin/logs?limit=100', { headers: jsonHeaders() });
  const logs = response.data?.logs || [];
  content.innerHTML = `
    ${pageTitle('Logs', 'Review admin actions and assistant queries.')}
    <section class="admin-card">
      ${logs.length ? `
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr><th>Action</th><th>Admin</th><th>Target</th><th>Date</th></tr></thead>
            <tbody>
              ${logs.map((log) => `
                <tr>
                  <td>${escapeHtml(log.action)}</td>
                  <td>${escapeHtml(log.admin?.email || '')}</td>
                  <td>${escapeHtml(log.targetType || '')} ${escapeHtml(log.targetId || '')}</td>
                  <td>${formatDate(log.createdAt)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : emptyState('No admin logs recorded yet.')}
    </section>
  `;
}

async function loadBackup() {
  content.innerHTML = `
    ${pageTitle('Backup & Restore', 'Create an export of the current platform data. Restore is intentionally manual for safety.')}
    <section class="admin-card">
      <div class="admin-card-head"><h2>Database Backup</h2></div>
      <p>Generate a JSON backup for users, products, posts, orders, messages, announcements, and settings. The file is stored in private backend storage and requires admin access to download.</p>
      <div class="admin-actions" style="margin-top:16px;">
        <button class="admin-button" type="button" data-action="create-backup">Create Backup</button>
      </div>
      <div id="backupResult" style="margin-top:16px;"></div>
    </section>
  `;
}

async function loadAssistantSection() {
  content.innerHTML = `
    ${pageTitle('AI Assistant', 'Ask natural language questions about platform data.')}
    <section class="admin-card">
      <div class="admin-card-head"><h2>Example Questions</h2></div>
      <div class="admin-actions">
        ${['Show me all users who registered this week', 'How many products were uploaded today?', 'Show all pending orders', 'List users by role', 'Top active farmers'].map((text) => `
          <button class="admin-button-secondary" type="button" data-action="assistant-chip" data-prompt="${escapeHtml(text)}">${escapeHtml(text)}</button>
        `).join('')}
      </div>
      <p style="margin-top:14px;">Use the floating assistant in the lower right to run these queries.</p>
    </section>
  `;
  assistantInput?.focus();
}

async function loadSection(section = currentSection, params = {}) {
  currentSection = section;
  updateActiveNav();
  document.body.classList.remove('nav-open');

  try {
    if (section === 'dashboard') await loadDashboard(params);
    else if (section === 'users') await loadUsers(params);
    else if (section === 'products') await loadProductsAndUploads(params);
    else if (section === 'orders') await loadOrders(params);
    else if (section === 'recharges') await loadRecharges(params);
    else if (section === 'messages') await loadMessages(params);
    else if (section === 'settings') await loadSettings();
    else if (section === 'announcements') await loadAnnouncements();
    else if (section === 'markets') await loadMarkets();
    else if (section === 'logs') await loadLogs();
    else if (section === 'backup') await loadBackup();
    else if (section === 'assistant') await loadAssistantSection();
  } catch (error) {
    if (/authorized|restricted|invalid|expired|access/i.test(error.message)) {
      redirectToLogin();
      return;
    }
    content.innerHTML = `${pageTitle('Unable to load', error.message || 'Request failed.')}`;
    showToast(error.message || 'Request failed.', 'error');
  }
}

function openModal(title, body) {
  modal.hidden = false;
  modal.innerHTML = `
    <article class="admin-modal-card">
      <header>
        <h2>${escapeHtml(title)}</h2>
        <button class="admin-button-secondary" type="button" data-action="close-modal">Close</button>
      </header>
      ${body}
    </article>
  `;
}

function closeModal() {
  modal.hidden = true;
  modal.innerHTML = '';
}

async function openUserDetail(id) {
  const response = await adminFetch(`/admin/users/${encodeURIComponent(id)}`, { headers: jsonHeaders() });
  const data = response.data || {};
  const user = data.user || {};
  openModal(user.email || 'User detail', `
    <section class="admin-grid admin-dashboard-lower">
      <article class="admin-card">
        <h3>Profile</h3>
        <p>Name: ${escapeHtml(user.fullName || '')}</p>
        <p>Email: ${escapeHtml(user.email || '')}</p>
        <p>Role: ${escapeHtml(user.role || '')}</p>
        <p>Status: ${user.isActive ? 'Active' : 'Inactive'}</p>
        <p>Joined: ${formatDate(user.createdAt)}</p>
      </article>
      <article class="admin-card">
        <h3>Related Data</h3>
        <p>Products: ${formatNumber(data.products?.length)}</p>
        <p>Orders: ${formatNumber(data.orders?.length)}</p>
        <p>Messages sent: ${formatNumber(data.messages?.sent)}</p>
        <p>Messages received: ${formatNumber(data.messages?.received)}</p>
        <p>Notifications loaded: ${formatNumber(data.notifications?.length)}</p>
      </article>
    </section>
  `);
}

async function deleteByAction(action, id) {
  const endpoints = {
    'delete-user': `/admin/users/${id}`,
    'delete-product': `/admin/products/${id}`,
    'delete-order': `/admin/orders/${id}`,
    'delete-message': `/admin/messages/${id}`,
    'delete-announcement': `/admin/announcements/${id}`,
    'delete-market': `/market-events/${id}`,
  };

  if (!endpoints[action]) return;
  const confirmed = window.confirm('This will delete or deactivate the selected record. Continue?');
  if (!confirmed) return;

  await adminFetch(endpoints[action], { method: 'DELETE', headers: jsonHeaders() });
  showToast('Admin action completed.');
  await loadSection(currentSection);
}

async function deleteUpload(button) {
  const confirmed = window.confirm('Delete this uploaded file reference and remove the file if it exists?');
  if (!confirmed) return;

  await adminFetch('/admin/uploads', {
    method: 'DELETE',
    headers: jsonHeaders(),
    body: JSON.stringify({
      path: button.dataset.path,
      ownerType: button.dataset.ownerType,
      ownerId: button.dataset.ownerId,
    }),
  });
  showToast('Upload deleted.');
  await loadSection('products');
}

async function updateOrderStatus(select) {
  await adminFetch(`/admin/orders/${encodeURIComponent(select.dataset.id)}`, {
    method: 'PATCH',
    headers: jsonHeaders(),
    body: JSON.stringify({ status: select.value, note: 'Updated from Admin Panel' }),
  });
  showToast('Order status updated.');
}

function formParams(form) {
  const params = {};
  new FormData(form).forEach((value, key) => {
    if (value !== '' && value !== 'all') params[key] = value;
  });
  return params;
}

async function handleAdminForm(form) {
  const type = form.dataset.adminForm;
  if (type === 'users') return loadUsers(formParams(form));
  if (type === 'products') return loadProductsAndUploads(formParams(form));
  if (type === 'orders') return loadOrders(formParams(form));
  if (type === 'recharges') return loadRecharges(formParams(form));
  if (type === 'messages') return loadMessages(formParams(form));

  if (type === 'settings') {
    const data = Object.fromEntries(new FormData(form).entries());
    data.maintenanceMode = form.elements.maintenanceMode.checked;
    data.announcementsEnabled = form.elements.announcementsEnabled.checked;
    await adminFetch('/admin/settings', {
      method: 'PATCH',
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    });
    showToast('Settings saved.');
    await loadSettings();
    return null;
  }

  if (type === 'announcement') {
    const data = Object.fromEntries(new FormData(form).entries());
    data.sendNotification = form.elements.sendNotification.checked;
    await adminFetch('/admin/announcements', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    });
    showToast('Announcement published.');
    await loadAnnouncements();
  }

  if (type === 'market-event') {
    const data = Object.fromEntries(new FormData(form).entries());
    await adminFetch('/market-events', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    });
    showToast('Market event published.');
    await loadMarkets();
  }

  return null;
}

function renderAssistantTable(table) {
  if (!table?.columns?.length) return '';
  return `
    <table class="assistant-mini-table">
      <thead><tr>${table.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}</tr></thead>
      <tbody>
        ${(table.rows || []).slice(0, 8).map((row) => `
          <tr>${row.map((cell) => `<td>${escapeHtml(formatAssistantCell(cell))}</td>`).join('')}</tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function formatAssistantCell(value) {
  if (value && !Number.isFinite(Number(value))) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime()) && String(value).includes('T')) return formatDate(value);
  }
  return value ?? '';
}

function appendAssistantMessage(message, mine = false, table = null) {
  const row = document.createElement('div');
  row.className = `assistant-message ${mine ? 'mine' : ''}`;
  row.innerHTML = `
    <div class="assistant-bubble">${escapeHtml(message)}</div>
    ${table ? renderAssistantTable(table) : ''}
  `;
  assistantThread.appendChild(row);
  assistantThread.scrollTop = assistantThread.scrollHeight;
}

async function sendAssistantPrompt(prompt) {
  const text = String(prompt || '').trim();
  if (!text) return;

  appendAssistantMessage(text, true);
  assistantInput.value = '';

  try {
    const response = await adminFetch('/admin/assistant', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ message: text }),
    });
    const data = response.data || {};
    appendAssistantMessage(data.answer || 'I found a response.', false, data.table);
    if (data.chips?.length) {
      document.getElementById('assistantChips').innerHTML = data.chips.map((chip) => `<button type="button">${escapeHtml(chip)}</button>`).join('');
    }
  } catch (error) {
    appendAssistantMessage(error.message || 'Assistant query failed.', false);
  }
}

async function ensureAdminAccess() {
  if (!getToken()) {
    redirectToLogin();
    throw new Error('Admin login required');
  }

  let user = getStoredUser();
  if (!user) {
    const response = await apiFetch('/auth/me', { headers: jsonHeaders() });
    user = response.data || response.user || null;
    if (user) localStorage.setItem('fh_user', JSON.stringify(user));
  }

  if (!isAdminUser(user)) {
    redirectToLogin();
    throw new Error('Admin account required');
  }
  document.getElementById('adminIdentity').textContent = user.email;
}

document.querySelectorAll('[data-section]').forEach((button) => {
  button.addEventListener('click', () => loadSection(button.dataset.section));
});

document.getElementById('adminLogout').addEventListener('click', redirectToLogin);
document.getElementById('adminMenuButton').addEventListener('click', () => {
  document.body.classList.toggle('nav-open');
});

content.addEventListener('click', async (event) => {
  const periodButton = event.target.closest('[data-admin-period]');
  if (periodButton) {
    await loadSection('dashboard', { period: periodButton.dataset.adminPeriod });
    return;
  }

  const jump = event.target.closest('[data-section-jump]');
  if (jump) {
    await loadSection(jump.dataset.sectionJump);
    return;
  }

  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) return;

  const { action, id, prompt } = actionButton.dataset;
  try {
    if (action === 'close-modal') closeModal();
    else if (action === 'user-detail') await openUserDetail(id);
    else if (action === 'delete-upload') await deleteUpload(actionButton);
      else if (action === "create-backup") {
        actionButton.disabled = true;
        const response = await adminFetch("/admin/backup", { method: "POST", headers: jsonHeaders() });
        const backup = response.data || {};
        document.getElementById("backupResult").innerHTML = `
          <div class="admin-empty">
            Backup created: ${escapeHtml(backup.fileName || "backup.json")}
            <br>Created: ${formatDate(backup.createdAt)}
            <br>Size: ${formatNumber(backup.size)} bytes
            <br>Users: ${formatNumber(backup.counts?.users)}
            Products: ${formatNumber(backup.counts?.products)}
            Orders: ${formatNumber(backup.counts?.orders)}
            Messages: ${formatNumber(backup.counts?.messages)}
            <div class="admin-actions" style="margin-top:12px;">
              <button class="admin-button-secondary" type="button" data-action="download-backup" data-file-name="${escapeHtml(backup.fileName || "")}" data-download-endpoint="${escapeHtml(backup.downloadEndpoint || "")}">Download Backup</button>
            </div>
          </div>
        `;
        showToast("Backup created.");
      } else if (action === "download-backup") {
        actionButton.disabled = true;
        await downloadBackup(actionButton.dataset.fileName, actionButton.dataset.downloadEndpoint);
        showToast("Backup downloaded.");
    } else if (action === 'assistant-chip') {
      await sendAssistantPrompt(prompt);
    } else if (action === 'approve-recharge') {
      await reviewRecharge(id, 'approve');
    } else if (action === 'reject-recharge') {
      if (window.confirm('Reject this recharge request?')) await reviewRecharge(id, 'reject');
    } else {
      await deleteByAction(action, id);
    }
  } catch (error) {
    showToast(error.message || 'Admin action failed.', 'error');
  } finally {
      if (["create-backup", "download-backup"].includes(actionButton.dataset.action)) actionButton.disabled = false;
  }
});

content.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await handleAdminForm(event.target);
  } catch (error) {
    showToast(error.message || 'Form submission failed.', 'error');
  }
});

content.addEventListener('change', async (event) => {
  if (event.target.dataset.action !== 'order-status') return;
  try {
    await updateOrderStatus(event.target);
  } catch (error) {
    showToast(error.message || 'Order update failed.', 'error');
  }
});

modal.addEventListener('click', (event) => {
  if (event.target === modal || event.target.closest('[data-action="close-modal"]')) closeModal();
});

document.getElementById('assistantForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  await sendAssistantPrompt(assistantInput.value);
});

document.getElementById('assistantChips').addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (button) await sendAssistantPrompt(button.textContent);
});

document.getElementById('assistantMinimize').addEventListener('click', () => {
  document.getElementById('assistantPanel').classList.toggle('is-minimized');
});

document.getElementById('assistantClose').addEventListener('click', () => {
  document.getElementById('assistantPanel').hidden = true;
});

appendAssistantMessage('Hello Admin. Ask me anything about your platform.');

ensureAdminAccess()
  .then(() => loadSection('dashboard'))
  .catch(() => redirectToLogin());
