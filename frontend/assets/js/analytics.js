import { apiFetch, jsonHeaders } from './config/api.config.js';

const panel = document.getElementById('analyticsContent');

const ACTIVE_STATUSES = ['pending', 'confirmed', 'processing', 'shipped'];
const STATUS_LABELS = {
  pending: 'Pending', confirmed: 'Confirmed', processing: 'Processing',
  shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 })
    .format(Number(value) || 0);
}

function state(title, body) {
  return `<div class="workspace-state"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(body)}</p></div>`;
}

function computeMetrics(orders) {
  const byStatus = {};
  const customers = new Set();
  const products = new Map();
  let deliveredRevenue = 0;
  let deliveredCount = 0;

  orders.forEach((order) => {
    byStatus[order.status] = (byStatus[order.status] || 0) + 1;
    if (order.customer?.userId) customers.add(String(order.customer.userId));

    if (order.status === 'delivered') {
      deliveredCount += 1;
      const amount = Number(order.totalAmount || 0);
      deliveredRevenue += amount;
      const key = String(order.product?.productId || order.product?.name || '');
      if (key) {
        const entry = products.get(key) || { name: order.product?.name || 'Product', revenue: 0, units: 0 };
        entry.revenue += amount;
        entry.units += Number(order.quantity || 0);
        products.set(key, entry);
      }
    }
  });

  const activeCount = ACTIVE_STATUSES.reduce((sum, status) => sum + (byStatus[status] || 0), 0);
  const topProducts = Array.from(products.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    totalOrders: orders.length,
    deliveredCount,
    deliveredRevenue,
    activeCount,
    cancelledCount: byStatus.cancelled || 0,
    uniqueCustomers: customers.size,
    avgOrderValue: deliveredCount ? deliveredRevenue / deliveredCount : 0,
    byStatus,
    topProducts,
  };
}

function statCard(label, value, note = '') {
  return `
    <article class="workspace-panel workspace-card analytics-stat">
      <span class="analytics-stat-label">${escapeHtml(label)}</span>
      <strong class="analytics-stat-value">${escapeHtml(value)}</strong>
      ${note ? `<span class="analytics-stat-note">${escapeHtml(note)}</span>` : ''}
    </article>
  `;
}

function statusBreakdown(metrics) {
  const order = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const rows = order
    .filter((status) => metrics.byStatus[status])
    .map((status) => {
      const count = metrics.byStatus[status];
      const pct = metrics.totalOrders ? Math.round((count / metrics.totalOrders) * 100) : 0;
      return `
        <div class="analytics-bar-row">
          <span class="analytics-bar-label">${escapeHtml(STATUS_LABELS[status] || status)}</span>
          <span class="analytics-bar-track"><span class="analytics-bar-fill analytics-bar-${status}" style="width:${pct}%"></span></span>
          <span class="analytics-bar-value">${count} (${pct}%)</span>
        </div>
      `;
    })
    .join('');
  return rows || '<p class="workspace-note">No orders to break down yet.</p>';
}

function topProductsList(metrics) {
  if (!metrics.topProducts.length) {
    return '<p class="workspace-note">Top products appear once orders are delivered.</p>';
  }
  return `
    <div class="analytics-products">
      ${metrics.topProducts.map((product, index) => `
        <div class="analytics-product-row">
          <span class="analytics-product-rank">${index + 1}</span>
          <span class="analytics-product-name">${escapeHtml(product.name)}</span>
          <span class="analytics-product-meta">${formatCurrency(product.revenue)} · ${product.units} sold</span>
        </div>
      `).join('')}
    </div>
  `;
}

function render(metrics) {
  if (!metrics.totalOrders) {
    panel.innerHTML = state(
      'No sales data yet',
      'Analytics build automatically from your orders. Once customers place and you fulfil orders, revenue and trends appear here.'
    );
    return;
  }

  panel.innerHTML = `
    <div class="workspace-grid analytics-stats">
      ${statCard('Delivered revenue', formatCurrency(metrics.deliveredRevenue), 'From completed orders')}
      ${statCard('Delivered orders', String(metrics.deliveredCount))}
      ${statCard('Total orders', String(metrics.totalOrders))}
      ${statCard('Active orders', String(metrics.activeCount), 'In progress')}
      ${statCard('Avg order value', formatCurrency(metrics.avgOrderValue), 'Delivered only')}
      ${statCard('Customers', String(metrics.uniqueCustomers))}
    </div>
    <section class="workspace-panel workspace-card">
      <h2>Orders by status</h2>
      ${statusBreakdown(metrics)}
    </section>
    <section class="workspace-panel workspace-card">
      <h2>Top products by revenue</h2>
      ${topProductsList(metrics)}
    </section>
  `;
}

async function load() {
  if (!panel) return;
  if (!localStorage.getItem('fh_token')) {
    panel.innerHTML = state('Please log in', 'Log in as a farmer to view analytics built from your orders.');
    return;
  }
  panel.innerHTML = '<div class="workspace-state"><p>Loading analytics…</p></div>';
  try {
    const response = await apiFetch('/orders?limit=100', { headers: jsonHeaders() });
    const orders = response?.data?.orders || [];
    render(computeMetrics(orders));
  } catch (error) {
    panel.innerHTML = state('Unable to load analytics', error.message || 'Please try again later.');
  }
}

load();
