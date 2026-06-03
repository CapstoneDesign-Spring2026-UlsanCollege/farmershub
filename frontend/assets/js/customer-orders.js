import {
  formatCurrency,
  getCartItems,
  hydrateCustomerShell,
  setStatus,
} from './customer-shell.js';

const cartStatus = document.getElementById('ordersCartStatus');
const cartNote = document.getElementById('ordersCartNote');
const searchForm = document.getElementById('ordersSearchForm');
const searchInput = document.getElementById('ordersSearchInput');

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

renderCartNote();
