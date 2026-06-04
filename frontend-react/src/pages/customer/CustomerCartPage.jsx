import { useState } from 'react';
import { PageHeader, MetricCard } from '../../components/common/Page.jsx';
import { EmptyState } from '../../components/common/States.jsx';
import { getCartItems, saveCartItems } from '../../utils/customerStorage.js';
import { formatMoney } from '../../utils/format.js';

export function CustomerCartPage() {
  const [items, setItems] = useState(getCartItems);
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);

  function update(next) {
    saveCartItems(next);
    setItems(next);
  }

  return (
    <>
      <PageHeader eyebrow="Local cart" title="Cart stored in this browser" text="FarmersHub does not yet have a real customer checkout or synced cart API, so this page keeps the static frontend honesty intact." />
      <section className="metric-grid">
        <MetricCard label="Items" value={items.reduce((sum, item) => sum + Number(item.quantity || 1), 0)} text="Browser-local quantity" />
        <MetricCard label="Estimated subtotal" value={formatMoney(subtotal, 'KRW 0')} text="Before checkout, delivery and payment rules" />
      </section>
      {!items.length ? <EmptyState title="Your cart is empty" text="Add products from the marketplace. They will be stored in this browser only." /> : null}
      <div className="list-stack">
        {items.map((item) => (
          <article className="line-item" key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <span>{item.sellerName || 'Local farmer'} - {item.priceLabel || formatMoney(item.price)}</span>
            </div>
            <div className="quantity-controls">
              <button type="button" onClick={() => update(items.map((cartItem) => cartItem.id === item.id ? { ...cartItem, quantity: Math.max(1, Number(cartItem.quantity || 1) - 1) } : cartItem))}>-</button>
              <span>{item.quantity || 1}</span>
              <button type="button" onClick={() => update(items.map((cartItem) => cartItem.id === item.id ? { ...cartItem, quantity: Number(cartItem.quantity || 1) + 1 } : cartItem))}>+</button>
              <button type="button" onClick={() => update(items.filter((cartItem) => cartItem.id !== item.id))}>Remove</button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
