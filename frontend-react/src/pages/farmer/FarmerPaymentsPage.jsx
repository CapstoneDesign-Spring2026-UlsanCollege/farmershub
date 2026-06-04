import { PageHeader } from '../../components/common/Page.jsx';
import { EmptyState } from '../../components/common/States.jsx';

export function FarmerPaymentsPage() {
  return (
    <>
      <PageHeader eyebrow="Payments" title="Payments are not connected" text="The React migration does not claim payouts, checkout or payment history until backend support exists." />
      <EmptyState title="Payment workflow pending" text="Provider and farmer service payments are also not connected yet." />
    </>
  );
}
