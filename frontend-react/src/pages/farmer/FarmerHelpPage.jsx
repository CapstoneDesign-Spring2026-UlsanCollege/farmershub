import { InfoCard, PageHeader } from '../../components/common/Page.jsx';

export function FarmerHelpPage() {
  return (
    <>
      <PageHeader eyebrow="Help" title="Farmer workflow guide" text="Farmer help covers products, inventory, messages, profile updates and provider services." />
      <section className="card-grid">
        <InfoCard title="Products and inventory" text="Create products from Products. Inventory currently summarizes listing stock." />
        <InfoCard title="Provider services" text="Browse active provider listings, submit service requests and manage quotes from Service Requests." />
        <InfoCard title="Pending platform features" text="Orders, payments and analytics are clearly marked pending until backend support exists." />
      </section>
    </>
  );
}
