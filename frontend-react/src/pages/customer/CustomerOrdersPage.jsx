import { InfoCard, PageHeader } from '../../components/common/Page.jsx';
import { EmptyState } from '../../components/common/States.jsx';
import { getCartItems } from '../../utils/customerStorage.js';
import { formatMoney } from '../../utils/format.js';

export function CustomerOrdersPage() {
  const items = getCartItems();
  const quantity = items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);

  return (
    <>
      <PageHeader eyebrow="Orders" title="Order history is pending backend support" text="The backend has a product order request endpoint, but no full persisted customer order history, payment or tracking workflow." />
      <InfoCard title="Local cart context" text={quantity ? `${quantity} local cart item${quantity === 1 ? '' : 's'} with estimated subtotal ${formatMoney(subtotal, 'KRW 0')}. These are not completed orders.` : 'Your local cart is empty.'} />
      <EmptyState title="No completed orders shown" text="React does not claim synced orders until a real Order model and customer order API exist." />
    </>
  );
}
