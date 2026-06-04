import { MessagesPanel } from '../../components/common/MessagesPanel.jsx';
import { PageHeader } from '../../components/common/Page.jsx';

export function ProviderMessagesPage() {
  return (
    <>
      <PageHeader eyebrow="Messages" title="Farmer conversations" text="Provider messages use the real Messages API and can include related service request context." />
      <MessagesPanel title="Provider conversations" emptyText="Provider conversations with farmers will appear here." />
    </>
  );
}
