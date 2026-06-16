import { apiFetch, jsonHeaders } from './config/api.config.js';

const panel = document.getElementById('customersPanel');

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 })
    .format(Number(value) || 0);
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

function state(title, body) {
  return `<div class="workspace-state"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(body)}</p></div>`;
}

function aggregateCustomers(orders) {
  const map = new Map();
  orders.forEach((order) => {
    const key = String(order.customer?.userId || order.customer?.email || '');
    if (!key) return;
    const entry = map.get(key) || {
      name: order.customer?.name || 'Customer',
      contact: order.customer?.email || order.customer?.phone || '',
      orders: 0,
      delivered: 0,
      totalSpent: 0,
      lastOrderAt: null,
    };
    entry.orders += 1;
    if (order.status === 'delivered') {
      entry.delivered += 1;
      entry.totalSpent += Number(order.totalAmount || 0);
    }
    const created = new Date(order.createdAt);
    if (!entry.lastOrderAt || created > entry.lastOrderAt) entry.lastOrderAt = created;
    map.set(key, entry);
  });
  return Array.from(map.values())
    .sort((a, b) => b.totalSpent - a.totalSpent || b.orders - a.orders);
}

function render(customers) {
  if (!customers.length) {
    panel.innerHTML = state(
      'No customers yet',
      'Buyers appear here once customers place orders for your products. Completed (delivered) orders count toward lifetime spend.'
    );
    return;
  }

  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const rows = customers.map((customer) => `
    <article class="customer-row">
      <div class="customer-row-main">
        <strong>${escapeHtml(customer.name)}</strong>
        <span>${escapeHtml(customer.contact || 'No contact provided')}</span>
      </div>
      <div class="customer-row-stats">
        <span><strong>${customer.orders}</strong> order${customer.orders === 1 ? '' : 's'}</span>
        <span><strong>${formatCurrency(customer.totalSpent)}</strong> spent</span>
        <span>Last order ${formatDate(customer.lastOrderAt)}</span>
      </div>
    </article>
  `).join('');

  panel.innerHTML = `
    <div class="workspace-toolbar">
      <h2>${customers.length} customer${customers.length === 1 ? '' : 's'}</h2>
      <span class="workspace-pill">${formatCurrency(totalRevenue)} lifetime revenue</span>
    </div>
    <div class="customers-list">${rows}</div>
  `;
}

async function load() {
  if (!panel) return;
  if (!localStorage.getItem('fh_token')) {
    panel.innerHTML = state('Please log in', 'Log in as a farmer to see the customers who ordered from you.');
    return;
  }
  panel.innerHTML = '<div class="workspace-state"><p>Loading customers…</p></div>';
  try {
    const response = await apiFetch('/orders?limit=100', { headers: jsonHeaders() });
    const orders = response?.data?.orders || [];
    render(aggregateCustomers(orders));
  } catch (error) {
    panel.innerHTML = state('Unable to load customers', error.message || 'Please try again later.');
  }
}

load();
