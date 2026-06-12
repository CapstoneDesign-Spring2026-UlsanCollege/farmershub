import {
  customerMessageUrl,
  formatCurrency,
  formatDate,
  getCartItems,
  getToken,
  hydrateCustomerShell,
  setStatus,
} from './customer-shell.js';
import { apiFetch, jsonHeaders } from './config/api.config.js';

const ordersStatus = document.getElementById('ordersStatus');
const orderHistoryList = document.getElementById('orderHistoryList');
const orderFilters = document.getElementById('orderFilters');
const ordersListContainer = document.getElementById('ordersListContainer');
const ordersApiStatus = document.getElementById('ordersApiStatus');
const cartStatus = document.getElementById('ordersCartStatus');
const cartNote = document.getElementById('ordersCartNote');
const searchForm = document.getElementById('ordersSearchForm');
const searchInput = document.getElementById('ordersSearchInput');

let orders = [];
let activeFilter = 'all';

const STATUS_STYLES = {
  pending:    { bg: '#fff2d8', color: '#a86f15', label: 'Pending' },
  confirmed:  { bg: '#e8f4ff', color: '#1565c0', label: 'Confirmed' },
  processing: { bg: '#f3e8ff', color: '#6a1ab0', label: 'Processing' },
  shipped:    { bg: '#e0f7fa', color: '#00695c', label: 'Shipped' },
  delivered:  { bg: '#e8f5e9', color: '#1b5e20', label: 'Delivered' },
  cancelled:  { bg: '#fce4e4', color: '#b71c1c', label: 'Cancelled' },
};

function createStatusBadge(status) {
  const style = STATUS_STYLES[status] || { bg: '#f5f5f5', color: '#555', label: status };
  const span = document.createElement('span');
  span.className = 'customer-pill';
  span.style.cssText = `background:${style.bg};color:${style.color}`;
  span.textContent = style.label;
  return span;
}

function orderMatchesFilter(order) {
  if (activeFilter === 'all') return true;
  if (activeFilter === 'active') return ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status);
  if (activeFilter === 'completed') return order.status === 'delivered';
  return order.status === 'cancelled';
}

function renderOrders() {
  const container = orderHistoryList || ordersListContainer;
  if (!container) return;
  const filtered = orders.filter(orderMatchesFilter);
  container.innerHTML = '';

  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'customer-state customer-empty';
    const title = document.createElement('strong');
    title.textContent = orders.length ? `No ${activeFilter} orders` : 'No order history yet';
    const copy = document.createElement('p');
    copy.textContent = orders.length
      ? 'Choose another filter to view your order records.'
      : 'Orders placed through the marketplace will appear here.';
    const link = document.createElement('a');
    link.className = 'customer-button';
    link.href = 'customer-marketplace.html';
    link.textContent = 'Browse marketplace';
    empty.append(title, copy, link);
    container.appendChild(empty);
    return;
  }

  filtered.forEach((order) => {
    const card = document.createElement('article');
    card.className = 'order-history-card';

    const heading = document.createElement('div');
    heading.className = 'order-history-heading';
    const title = document.createElement('strong');
    title.textContent = order.product?.name || 'FarmersHub order';
    heading.append(title, createStatusBadge(order.status));

    const details = document.createElement('dl');
    [
      ['Order', order.orderNumber || order.id],
      ['Farmer', order.farmer?.name || 'Farmer'],
      ['Qty', `${order.quantity || 0} ${order.product?.unit || ''}`.trim()],
      ['Total', formatCurrency(order.totalAmount)],
      ['Placed', formatDate(order.createdAt)],
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
    container.appendChild(card);
  });
}

async function loadOrders() {
  hydrateCustomerShell();
  if (!getToken()) {
    const s = ordersStatus || ordersApiStatus;
    if (s) setStatus(s, 'Log in to view your order history.', 'error');
    renderOrders();
    return;
  }

  const s = ordersStatus || ordersApiStatus;
  if (s) setStatus(s, 'Loading real order history...');

  try {
    const response = await apiFetch('/orders/my', { headers: jsonHeaders() });
    orders = response.data?.orders || [];
    renderOrders();
    if (s) setStatus(s, orders.length ? `${orders.length} order${orders.length === 1 ? '' : 's'} loaded.` : 'No order history yet.');
  } catch (error) {
    const container = orderHistoryList || ordersListContainer;
    if (container) {
      const state = document.createElement('div');
      state.className = 'customer-state customer-empty';
      const title = document.createElement('strong');
      title.textContent = 'Order history is unavailable';
      const copy = document.createElement('p');
      copy.textContent = error.message || 'The order API could not be reached.';
      state.append(title, copy);
      container.replaceChildren(state);
    }
    if (s) setStatus(s, 'Unable to load order history.', 'error');
  }
}

function renderCartNote() {
  const items = getCartItems();
  const quantity = items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  const subtotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);

  if (!items.length) {
    if (cartStatus) setStatus(cartStatus, 'No local cart items.');
    if (cartNote) cartNote.innerHTML = '<strong>Your local cart is empty.</strong> Browse the marketplace to add products.';
    return;
  }

  if (cartStatus) setStatus(cartStatus, `${quantity} local cart item${quantity === 1 ? '' : 's'} found.`);
  if (cartNote) {
    cartNote.innerHTML = `<strong>${quantity} item${quantity === 1 ? '' : 's'} in your local cart.</strong> Estimated subtotal: ${formatCurrency(subtotal)}. ` +
      `<a href="customer-cart.html" class="customer-secondary-button" style="display:inline-flex;margin-top:8px">Go to checkout</a>`;
  }
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
