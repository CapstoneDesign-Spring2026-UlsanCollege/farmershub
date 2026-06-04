import { InfoCard, PageHeader } from '../../components/common/Page.jsx';

export function CustomerHelpPage() {
  return (
    <>
      <PageHeader eyebrow="Help" title="Customer support" text="Customer help stays focused on marketplace browsing, local cart/favorites, farmer messages and honest pending checkout behavior." />
      <section className="card-grid">
        <InfoCard title="Cart and favorites" text="Saved locally in this browser. They are not synced to an account yet." />
        <InfoCard title="Messaging farmers" text="Product and farmer message actions use the real Messages API when you are logged in." />
        <InfoCard title="Orders and payments" text="Checkout, payment and customer order history remain pending until backend support exists." />
      </section>
    </>
  );
}
