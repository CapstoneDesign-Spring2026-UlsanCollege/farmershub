import {
  customerMessageUrl,
  customerProductUrl,
  formatCurrency,
  getCartItems,
  hydrateCustomerShell,
  saveCartItems,
  setStatus,
} from './customer-shell.js';

const cartList = document.getElementById('cartList');
const clearCartBtn = document.getElementById('clearCartBtn');
const cartStatus = document.getElementById('cartStatus');
const itemCount = document.getElementById('cartItemCount');
const subtotal = document.getElementById('cartSubtotal');
const searchForm = document.getElementById('cartSearchForm');
const searchInput = document.getElementById('cartSearchInput');

function cartTotal(items) {
  return items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
}

function cartQuantity(items) {
  return items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
}

function updateSummary(items) {
  itemCount.textContent = String(cartQuantity(items));
  subtotal.textContent = formatCurrency(cartTotal(items));
  clearCartBtn.disabled = !items.length;
}

function renderEmpty() {
  cartList.innerHTML = '';
  const empty = document.createElement('div');
  empty.className = 'customer-state customer-empty';
  const title = document.createElement('strong');
  title.textContent = 'Your cart is empty';
  const copy = document.createElement('p');
  copy.textContent = 'Add products from Customer Marketplace. They will be stored in this browser only.';
  const action = document.createElement('a');
  action.className = 'customer-button';
  action.href = 'customer-marketplace.html';
  action.textContent = 'Browse marketplace';
  empty.append(title, copy, action);
  cartList.appendChild(empty);
}

function saveAndRender(items, message = '') {
  saveCartItems(items);
  renderCart(message);
}

function createImage(item) {
  const image = document.createElement('div');
  image.className = 'cart-item-image';
  if (item.imageUrl) {
    image.style.backgroundImage = `url("${item.imageUrl}")`;
    image.setAttribute('role', 'img');
    image.setAttribute('aria-label', item.name);
  } else {
    image.textContent = 'Image pending';
  }
  return image;
}

function createCartItem(item, items) {
  const article = document.createElement('article');
  article.className = 'cart-item';

  const body = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = item.name;
  const seller = document.createElement('p');
  seller.textContent = `Seller: ${item.sellerName || 'Local farmer'}`;
  const price = document.createElement('strong');
  price.className = 'cart-item-price';
  price.textContent = `${formatCurrency(item.price)} / ${item.unit || 'unit'}`;
  body.append(title, seller, price);

  const controls = document.createElement('div');
  controls.className = 'cart-item-controls';

  const quantity = document.createElement('div');
  quantity.className = 'cart-quantity';
  quantity.setAttribute('aria-label', `Quantity for ${item.name}`);

  const decrease = document.createElement('button');
  decrease.type = 'button';
  decrease.textContent = '-';
  decrease.setAttribute('aria-label', `Decrease ${item.name} quantity`);
  decrease.addEventListener('click', () => {
    const next = items.map((cartItem) => cartItem.id === item.id
      ? { ...cartItem, quantity: Math.max(Number(cartItem.quantity || 1) - 1, 1) }
      : cartItem);
    saveAndRender(next, 'Cart quantity updated on this device.');
  });

  const output = document.createElement('output');
  output.textContent = String(item.quantity || 1);

  const increase = document.createElement('button');
  increase.type = 'button';
  increase.textContent = '+';
  increase.setAttribute('aria-label', `Increase ${item.name} quantity`);
  increase.addEventListener('click', () => {
    const next = items.map((cartItem) => cartItem.id === item.id
      ? { ...cartItem, quantity: Number(cartItem.quantity || 1) + 1 }
      : cartItem);
    saveAndRender(next, 'Cart quantity updated on this device.');
  });

  quantity.append(decrease, output, increase);

  const actions = document.createElement('div');
  actions.className = 'cart-item-actions';

  const view = document.createElement('a');
  view.className = 'customer-secondary-button';
  view.href = customerProductUrl(item.id);
  view.textContent = 'View';
  actions.appendChild(view);

  if (item.sellerId) {
    const message = document.createElement('a');
    message.className = 'customer-secondary-button';
    message.href = customerMessageUrl({
      recipientId: item.sellerId,
      recipientName: item.sellerName,
      recipientRole: 'farmer',
      productId: item.id,
      productName: item.name,
    });
    message.textContent = 'Message';
    actions.appendChild(message);
  }

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'customer-danger-button';
  remove.textContent = 'Remove';
  remove.addEventListener('click', () => {
    saveAndRender(items.filter((cartItem) => cartItem.id !== item.id), `${item.name} was removed from this device cart.`);
  });
  actions.appendChild(remove);

  controls.append(quantity, actions);
  article.append(createImage(item), body, controls);
  return article;
}

function renderCart(message = '') {
  hydrateCustomerShell();
  const items = getCartItems();
  updateSummary(items);
  setStatus(cartStatus, message || (items.length ? 'Cart items are stored in this browser.' : ''));

  if (!items.length) {
    renderEmpty();
    return;
  }

  cartList.innerHTML = '';
  items.forEach((item) => {
    cartList.appendChild(createCartItem(item, items));
  });
}

clearCartBtn?.addEventListener('click', () => {
  saveAndRender([], 'Cart cleared from this device.');
});

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = String(searchInput?.value || '').trim();
  const params = new URLSearchParams();
  if (query) params.set('search', query);
  window.location.href = `customer-marketplace.html${params.toString() ? `?${params.toString()}` : ''}`;
});

renderCart();
