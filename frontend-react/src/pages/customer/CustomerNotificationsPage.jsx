import { NotificationsPanel } from '../../components/common/NotificationsPanel.jsx';
import { PageHeader } from '../../components/common/Page.jsx';

export function CustomerNotificationsPage() {
  return (
    <>
      <PageHeader eyebrow="Notifications" title="Customer notifications" text="Message, market and system notifications are loaded from the backend." />
      <NotificationsPanel emptyText="Customer notifications will appear when the backend creates them." />
    </>
  );
}
