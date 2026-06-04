import { MessagesPanel } from '../../components/common/MessagesPanel.jsx';
import { PageHeader } from '../../components/common/Page.jsx';

export function CustomerMessagesPage() {
  return (
    <>
      <PageHeader eyebrow="Messages" title="Message farmers" text="Customer messages use the real Messages API and can include product context." />
      <MessagesPanel title="Customer conversations" emptyText="Message a farmer from a product card to start a customer conversation." />
    </>
  );
}
