import { MessagesPanel } from '../../components/common/MessagesPanel.jsx';
import { PageHeader } from '../../components/common/Page.jsx';

export function FarmerMessagesPage() {
  return (
    <>
      <PageHeader eyebrow="Messages" title="Buyer and farm conversations" text="Messages use the real shared Messages API inside the farmer workspace." />
      <MessagesPanel title="Farmer conversations" emptyText="Buyer and farmer messages will appear here when conversations exist." />
    </>
  );
}
