import { InfoCard, PageHeader } from '../../components/common/Page.jsx';

export function ProviderHelpPage() {
  return (
    <>
      <PageHeader eyebrow="Help" title="Provider workflow guide" text="Use the portal to publish farm support services and manage real farmer requests." />
      <section className="card-grid">
        <InfoCard title="Listings" text="Create listings for rentals, transport, storage, inputs, consultation or repair." />
        <InfoCard title="Requests" text="Review farmer requests, quote or decline, and mark accepted work complete after service delivery." />
        <InfoCard title="Pending platform features" text="Payments, verification review, ratings and media uploads are still pending." />
      </section>
    </>
  );
}
