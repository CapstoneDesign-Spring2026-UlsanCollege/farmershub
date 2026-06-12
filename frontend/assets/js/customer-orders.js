import {
  customerMessageUrl,
  formatCurrency,
  getCartItems,
  getToken,
  hydrateCustomerShell,
  setStatus,
} from './customer-shell.js';
import { apiFetch, jsonHeaders } from './config/api.config.js';

const cartStatus = document.getElementById('ordersCartStatus');
const cartNote = document.getElementById('ordersCartNote');
const searchForm = document.getElementById('ordersSearchForm');
const searchInput = document.getElementById('ordersSearchInput');
const ordersStatus = document.getElementById('ordersStatus');
const orderHistoryList = document.getElementById('orderHistoryList');
const orderFilters = document.getElementById('orderFilters');

let orders = [];
let activeFilter = 'all';

function orderMatchesFilter(order) {
  if (activeFilter === 'all') return true;
  if (activeFilter === 'active') return ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status);
  if (activeFilter === 'completed') return order.status === 'delivered';
  return order.status === 'cancelled';
}

function formatOrderDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderOrders() {
  const filtered = orders.filter(orderMatchesFilter);
  orderHistoryList.innerHTML = '';
  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'customer-state customer-empty';
    const title = document.createElement('strong');
    title.textContent = orders.length ? `No ${activeFilter} orders` : 'No order history yet';
    const copy = document.createElement('p');
    copy.textContent = orders.length
      ? 'Choose another filter to view your real order records.'
      : 'Orders placed through the marketplace will appear here.';
    const link = document.createElement('a');
    link.className = 'customer-button';
    link.href = 'customer-marketplace.html';
    link.textContent = 'Browse marketplace';
    empty.append(title, copy, link);
    orderHistoryList.appendChild(empty);
    return;
  }

  filtered.forEach((order) => {
    const card = document.createElement('article');
    card.className = 'order-history-card';
    const heading = document.createElement('div');
    heading.className = 'order-history-heading';
    const title = document.createElement('strong');
    title.textContent = order.product?.name || 'FarmersHub order';
    const status = document.createElement('span');
    status.className = `order-status order-status-${order.status || 'pending'}`;
    status.textContent = order.status || 'pending';
    heading.append(title, status);

    const details = document.createElement('dl');
    [
      ['Order', order.orderNumber || order.id],
      ['Farmer', order.farmer?.name || 'Farmer'],
      ['Quantity', `${order.quantity || 0} ${order.product?.unit || ''}`.trim()],
      ['Total', formatCurrency(order.totalAmount)],
      ['Placed', formatOrderDate(order.createdAt)],
    ].forEach(([label, value]) => {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const detail = document.createElement('dd');
      term.textContent = label;
      detail.textContent = String(value || '');
      row.append(term, detail);
      details.appendChild(row);
    });

    const actions = document.createElement('div');
    actions.className = 'orders-actions';
    if (order.farmer?.userId) {
      const message = document.createElement('a');
      message.className = 'customer-secondary-button';
      message.href = customerMessageUrl({
        recipientId: order.farmer.userId,
        recipientName: order.farmer.name,
        recipientRole: 'farmer',
        productId: order.product?.productId,
        productName: order.product?.name,
      });
      message.textContent = 'Message farmer';
      actions.appendChild(message);
    }
    card.append(heading, details, actions);
    orderHistoryList.appendChild(card);
  });
}

async function loadOrders() {
  hydrateCustomerShell();
  if (!getToken()) {
    setStatus(ordersStatus, 'Log in to view your order history.', 'error');
    renderOrders();
    return;
  }

  setStatus(ordersStatus, 'Loading real order history...');
  try {
    const response = await apiFetch('/orders/my', { headers: jsonHeaders() });
    orders = response.data?.orders || [];
    renderOrders();
    setStatus(ordersStatus, orders.length ? `${orders.length} order${orders.length === 1 ? '' : 's'} loaded.` : 'No order history yet.');
  } catch (error) {
    orderHistoryList.innerHTML = '';
    const state = document.createElement('div');
    state.className = 'customer-state customer-empty';
    const title = document.createElement('strong');
    title.textContent = 'Order history is unavailable';
    const copy = document.createElement('p');
    copy.textContent = error.message || 'The real order API could not be reached.';
    state.append(title, copy);
    orderHistoryList.appendChild(state);
    setStatus(ordersStatus, 'Unable to load order history.', 'error');
  }
}

function renderCartNote() {
  hydrateCustomerShell();
  const items = getCartItems();
  const quantity = items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  const subtotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);

  if (!items.length) {
    setStatus(cartStatus, 'No local cart items.');
    cartNote.innerHTML = '<strong>Your local cart is empty.</strong> Browse the marketplace to save products before checkout is connected.';
    return;
  }

  setStatus(cartStatus, `${quantity} local cart item${quantity === 1 ? '' : 's'} found.`);
  cartNote.innerHTML = `<strong>${quantity} item${quantity === 1 ? '' : 's'} in your local cart.</strong> Estimated subtotal is ${formatCurrency(subtotal)} before delivery, payment and checkout rules. These cart items are not completed orders.`;
}

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = String(searchInput?.value || '').trim();
  const params = new URLSearchParams();
  if (query) params.set('search', query);
  window.location.href = `customer-marketplace.html${params.toString() ? `?${params.toString()}` : ''}`;
});

orderFilters?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-filter]');
  if (!button) return;
  activeFilter = button.dataset.filter;
  orderFilters.querySelectorAll('button').forEach((item) => item.classList.toggle('is-active', item === button));
  renderOrders();
});

renderCartNote();
loadOrders();
