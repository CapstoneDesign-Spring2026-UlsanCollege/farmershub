import { NotificationsPanel } from '../../components/common/NotificationsPanel.jsx';
import { PageHeader } from '../../components/common/Page.jsx';

export function ProviderNotificationsPage() {
  return (
    <>
      <PageHeader eyebrow="Notifications" title="Provider updates" text="Request workflow and message notifications load from the Notifications API." />
      <NotificationsPanel emptyText="Provider request and message notifications will appear here." />
    </>
  );
}
