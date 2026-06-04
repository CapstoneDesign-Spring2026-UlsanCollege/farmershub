import { getMessages } from '../../api/messagesApi.js';
import { MetricCard, PageHeader } from '../../components/common/Page.jsx';
import { ErrorState, LoadingState } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { asArray } from '../../utils/format.js';

export function FarmerCustomersPage() {
  const { data, loading, error } = useAsyncData(getMessages, []);
  const conversations = asArray(data);
  return (
    <>
      <PageHeader eyebrow="Customers" title="Customer visibility is message-based for now" text="There is no complete customer order model yet, so this page summarizes message conversations without inventing a customer CRM." />
      {loading ? <LoadingState title="Loading conversations" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <section className="metric-grid">
        <MetricCard label="Conversations" value={conversations.length} text="From Messages API" />
        <MetricCard label="Order-backed customers" value="Pending" text="Requires real orders backend" />
      </section>
    </>
  );
}
