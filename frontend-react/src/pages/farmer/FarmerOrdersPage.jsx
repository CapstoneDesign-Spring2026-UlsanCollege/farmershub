import { PageHeader } from '../../components/common/Page.jsx';
import { EmptyState } from '../../components/common/States.jsx';

export function FarmerOrdersPage() {
  return (
    <>
      <PageHeader eyebrow="Orders" title="Order fulfillment is pending backend support" text="The current backend has product order request notification behavior, but no full farmer order inbox, status workflow, or payment settlement." />
      <EmptyState title="No farmer order list shown" text="React keeps this honest until a real Order model and farmer order API exist." />
    </>
  );
}
