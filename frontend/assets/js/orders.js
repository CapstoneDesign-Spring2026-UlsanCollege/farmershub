import { apiFetch, jsonHeaders } from './config/api.config.js';
import { openDeliveryPicker } from './delivery-picker.js';

const ordersStatus = document.getElementById('ordersStatus');
const ordersList = document.getElementById('ordersList');
const statusFilter = document.getElementById('statusFilter');

// Shipping happens through the delivery-partner picker, not the status dropdown,
// so 'shipped' is intentionally absent here.
const NEXT_STATUSES = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['cancelled'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
};

// Statuses from which a farmer may ship the order by assigning a delivery partner.
const SHIPPABLE_STATUSES = ['confirmed', 'processing'];

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

function notifyOrdersChanged(order) {
  window.dispatchEvent(new CustomEvent('fh-orders-changed', { detail: { order } }));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 })
    .format(Number(value) || 0);
}

function formatDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

function createStatusBadge(status) {
  const color = STATUS_COLORS[status] || '#617265';
  const span = document.createElement('span');
  span.className = 'workspace-pill';
  span.style.cssText = `background:${color}1a;color:${color}`;
  span.textContent = STATUS_LABELS[status] || status;
  return span;
}

function renderOrderCard(order) {
  const card = document.createElement('article');
  card.className = 'workspace-panel workspace-card farmer-order-card';
  card.id = `order-${order.id}`;

  const row = document.createElement('div');
  row.className = 'farmer-order-row';

  const info = document.createElement('div');
  info.style.cssText = 'flex:1;min-width:0;';
  const num = document.createElement('strong');
  num.style.cssText = 'font-size:13px;color:var(--fw-muted);';
  num.textContent = order.orderNumber;
  const product = document.createElement('p');
  product.style.cssText = 'margin:4px 0 0;font-size:15px;color:var(--fw-text);';
  product.textContent = `${order.product.name} — ${order.quantity} ${order.product.unit} × ${formatCurrency(order.product.unitPrice)}`;
  const meta = document.createElement('p');
  meta.style.cssText = 'margin:3px 0 0;font-size:13px;color:var(--fw-muted);';
  meta.textContent = `Customer: ${order.customer.name} • ${formatDate(order.createdAt)}`;
  info.append(num, product, meta);

  const right = document.createElement('div');
  right.className = 'farmer-order-right';
  const amount = document.createElement('strong');
  amount.style.cssText = 'font-size:17px;color:var(--fw-green);font-family:Sora,sans-serif;';
  amount.textContent = formatCurrency(order.totalAmount);
  right.append(createStatusBadge(order.status), amount);

  row.append(info, right);
  card.appendChild(row);

  if (order.notes) {
    const notes = document.createElement('p');
    notes.style.cssText = 'margin:8px 0 0;font-size:13px;color:var(--fw-muted);';
    notes.textContent = `Notes: ${order.notes}`;
    card.appendChild(notes);
  }

  if (order.delivery && order.delivery.partnerName) {
    const del = document.createElement('p');
    del.style.cssText = 'margin:6px 0 0;font-size:13px;color:var(--fw-muted);';
    del.textContent = `Delivery: ${order.delivery.partnerName} (${formatCurrency(order.delivery.fee || 0)}) via ${order.delivery.providerName || 'provider'}`;
    card.appendChild(del);
  }

  const nextStatuses = NEXT_STATUSES[order.status] || [];
  const canShip = SHIPPABLE_STATUSES.includes(order.status);
  if (nextStatuses.length || canShip) {
    const controls = document.createElement('div');
    controls.className = 'farmer-order-controls';

    if (canShip) {
      const shipBtn = document.createElement('button');
      shipBtn.type = 'button';
      shipBtn.className = 'workspace-primary';
      shipBtn.textContent = 'Ship (choose delivery)';
      shipBtn.style.cssText = 'min-height:36px;font-size:13px;';
      shipBtn.addEventListener('click', async () => {
        const updatedOrder = await openDeliveryPicker(order.id);
        if (updatedOrder) {
          card.replaceWith(renderOrderCard(updatedOrder));
          notifyOrdersChanged(updatedOrder);
        }
      });
      controls.appendChild(shipBtn);
    }

    if (!nextStatuses.length) {
      card.appendChild(controls);
      return card;
    }

    const select = document.createElement('select');
    select.style.cssText = 'min-height:36px;padding:0 10px;border:1px solid var(--fw-border);border-radius:10px;background:#fff;color:var(--fw-text);font:inherit;font-size:13px;cursor:pointer;';
    select.innerHTML = `<option value="">Update status…</option>` +
      nextStatuses.map((s) => `<option value="${s}">${STATUS_LABELS[s]}</option>`).join('');

    const updateBtn = document.createElement('button');
    updateBtn.type = 'button';
    updateBtn.className = 'workspace-primary';
    updateBtn.textContent = 'Update';
    updateBtn.style.cssText = 'min-height:36px;font-size:13px;';

    const errMsg = document.createElement('span');
    errMsg.style.cssText = 'color:var(--fw-danger);font-size:13px;display:none;';

    updateBtn.addEventListener('click', async () => {
      const newStatus = select.value;
      if (!newStatus) return;
      updateBtn.disabled = true;
      updateBtn.textContent = 'Updating…';
      errMsg.style.display = 'none';
      try {
        const result = await apiFetch(`/orders/${order.id}/status`, {
          method: 'PUT',
          headers: jsonHeaders(),
          body: JSON.stringify({ status: newStatus }),
        });
        const updatedOrder = result.data.order;
        const updated = renderOrderCard(updatedOrder);
        card.replaceWith(updated);
        notifyOrdersChanged(updatedOrder);
      } catch (err) {
        updateBtn.disabled = false;
        updateBtn.textContent = 'Update';
        errMsg.textContent = err.message;
        errMsg.style.display = 'inline';
        setTimeout(() => { errMsg.style.display = 'none'; }, 4000);
      }
    });

    controls.append(select, updateBtn, errMsg);
    card.appendChild(controls);
  }

  return card;
}

function renderOrders(orders) {
  if (!ordersList) return;
  ordersList.innerHTML = '';

  if (!orders.length) {
    const empty = document.createElement('div');
    empty.className = 'workspace-panel workspace-state';
    empty.innerHTML = '<h2>No orders yet</h2><p>When customers place orders for your products, they will appear here.</p><div class="workspace-card-actions"><a class="workspace-secondary" href="products-management.html">View products</a></div>';
    ordersList.appendChild(empty);
    return;
  }

  orders.forEach((order) => ordersList.appendChild(renderOrderCard(order)));
}

async function loadOrders(status = '') {
  const token = localStorage.getItem('fh_token');
  if (!token) {
    if (ordersStatus) ordersStatus.textContent = 'Please log in to view orders.';
    return;
  }

  if (ordersStatus) ordersStatus.textContent = 'Loading orders...';

  try {
    const url = status ? `/orders?status=${encodeURIComponent(status)}` : '/orders';
    const result = await apiFetch(url, { headers: jsonHeaders(), cache: 'no-store' });
    const orders = result?.data?.orders || [];
    const total = result?.data?.total ?? orders.length;
    if (ordersStatus) ordersStatus.textContent = `${total} order${total === 1 ? '' : 's'}`;
    renderOrders(orders);
  } catch (err) {
    if (ordersStatus) ordersStatus.textContent = `Error: ${err.message}`;
    renderOrders([]);
  }
}

statusFilter?.addEventListener('change', () => loadOrders(statusFilter.value));

loadOrders();
