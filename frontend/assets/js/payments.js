import { apiFetch, jsonHeaders } from './config/api.config.js';

const paymentsStatus = document.getElementById('paymentsStatus');
const paymentsStats = document.getElementById('paymentsStats');
const paymentsList = document.getElementById('paymentsList');
const LIVE_PAYMENTS_REFRESH_MS = 15000;

let paymentsRefreshTimer = null;
let paymentsRefreshInFlight = false;

const STATUS_LABELS = {
  pending: 'Pending', confirmed: 'Confirmed', processing: 'Processing',
  shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
};

const STATUS_COLORS = {
  pending:    '#a86f15',
  confirmed:  '#1565c0',
  processing: '#6a1ab0',
  shipped:    '#00695c',
  delivered:  '#1b5e20',
  cancelled:  '#b71c1c',
};

function formatCurrency(value) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 })
    .format(Number(value) || 0);
}

function formatDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderStats(orders) {
  if (!paymentsStats) return;
  const earned = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + Number(o.totalAmount || 0), 0);
  const pendingAmt = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).reduce((s, o) => s + Number(o.totalAmount || 0), 0);
  const cancelledAmt = orders.filter((o) => o.status === 'cancelled').reduce((s, o) => s + Number(o.totalAmount || 0), 0);

  const stats = [
    { label: 'Earned (Delivered)', value: formatCurrency(earned), color: '#1b5e20', bg: '#e8f5e9' },
    { label: 'Pending revenue', value: formatCurrency(pendingAmt), color: '#a86f15', bg: '#fff2d8' },
    { label: 'Total orders', value: String(orders.length), color: '#1565c0', bg: '#e8f4ff' },
    { label: 'Cancelled value', value: formatCurrency(cancelledAmt), color: '#b71c1c', bg: '#fce4e4' },
  ];

  paymentsStats.innerHTML = '';
  stats.forEach(({ label, value, color, bg }) => {
    const card = document.createElement('div');
    card.className = 'workspace-panel workspace-card payments-stat-card';
    card.style.cssText = `border-top:4px solid ${color};`;
    card.innerHTML = `<p class="workspace-note">${label}</p><strong style="font-size:22px;color:${color};font-family:Sora,sans-serif;display:block;margin-top:8px;">${value}</strong>`;
    paymentsStats.appendChild(card);
  });
}

function renderOrdersTable(orders) {
  if (!paymentsList) return;
  paymentsList.innerHTML = '';

  if (!orders.length) {
    const empty = document.createElement('div');
    empty.className = 'workspace-panel workspace-state';
    empty.innerHTML = '<h2>No orders yet</h2><p>Revenue and payout history will appear here when customers place orders for your products.</p><div class="workspace-card-actions"><a class="workspace-secondary" href="products-management.html">View products</a></div>';
    paymentsList.appendChild(empty);
    return;
  }

  const wrap = document.createElement('div');
  wrap.className = 'workspace-panel';
  wrap.style.cssText = 'overflow-x:auto;';

  const table = document.createElement('table');
  table.className = 'payments-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Order #</th>
        <th>Product</th>
        <th>Customer</th>
        <th>Qty</th>
        <th>Amount</th>
        <th>Status</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector('tbody');
  orders.forEach((order) => {
    const color = STATUS_COLORS[order.status] || '#617265';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><small style="color:var(--fw-muted)">${order.orderNumber}</small></td>
      <td>${order.product.name}</td>
      <td>${order.customer.name}</td>
      <td style="white-space:nowrap">${order.quantity} ${order.product.unit}</td>
      <td><strong style="color:var(--fw-green)">${formatCurrency(order.totalAmount)}</strong></td>
      <td><span style="padding:2px 9px;border-radius:6px;font-size:12px;font-weight:700;background:${color}1a;color:${color}">${STATUS_LABELS[order.status] || order.status}</span></td>
      <td><small style="color:var(--fw-muted)">${formatDate(order.createdAt)}</small></td>
    `;
    tbody.appendChild(tr);
  });

  wrap.appendChild(table);
  paymentsList.appendChild(wrap);
}

async function loadPayments() {
  if (paymentsRefreshInFlight) return;
  const token = localStorage.getItem('fh_token');
  if (!token) {
    if (paymentsStatus) paymentsStatus.textContent = 'Please log in to view payments.';
    return;
  }

  if (paymentsStatus) paymentsStatus.textContent = 'Loading...';
  paymentsRefreshInFlight = true;

  try {
    const result = await apiFetch('/orders', { headers: jsonHeaders(), cache: 'no-store' });
    const orders = result?.data?.orders || [];
    const total = result?.data?.total ?? orders.length;

    if (paymentsStatus) paymentsStatus.textContent = `${total} order${total === 1 ? '' : 's'}`;

    renderStats(orders);
    renderOrdersTable(orders);
  } catch (err) {
    if (paymentsStatus) paymentsStatus.textContent = `Error: ${err.message}`;
  } finally {
    paymentsRefreshInFlight = false;
  }
}

function startLivePaymentsRefresh() {
  if (paymentsRefreshTimer) return;

  window.addEventListener('fh-orders-changed', loadPayments);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) loadPayments();
  });
  window.addEventListener('focus', loadPayments);
  paymentsRefreshTimer = window.setInterval(loadPayments, LIVE_PAYMENTS_REFRESH_MS);
}

loadPayments();
startLivePaymentsRefresh();
