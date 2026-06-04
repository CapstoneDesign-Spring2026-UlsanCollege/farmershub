import { InfoCard, PageHeader } from '../../components/common/Page.jsx';

export function FarmerAnalyticsPage() {
  return (
    <>
      <PageHeader eyebrow="Analytics" title="Analytics pending real order and payment data" text="Product counts can be summarized, but revenue, conversion and fulfillment charts require connected order/payment APIs." />
      <section className="card-grid">
        <InfoCard title="Available now" text="Product listing counts, stock summaries and message counts." />
        <InfoCard title="Deferred" text="Revenue, repeat customers, checkout conversion and settlement analytics." />
      </section>
    </>
  );
}
