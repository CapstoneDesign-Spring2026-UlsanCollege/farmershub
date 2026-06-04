import { MessagesPanel } from '../../components/common/MessagesPanel.jsx';
import { PageHeader } from '../../components/common/Page.jsx';

export function FarmerProviderMessagesPage() {
  return (
    <>
      <PageHeader eyebrow="Provider messages" title="Service conversations" text="Farmer-to-provider messages use the shared Messages API and can carry service request context." />
      <MessagesPanel title="Provider conversations" emptyText="Provider service messages will appear after service conversations start." />
    </>
  );
}
