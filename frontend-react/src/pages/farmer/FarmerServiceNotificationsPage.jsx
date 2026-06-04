import { NotificationsPanel } from '../../components/common/NotificationsPanel.jsx';
import { PageHeader } from '../../components/common/Page.jsx';

export function FarmerServiceNotificationsPage() {
  return (
    <>
      <PageHeader eyebrow="Service alerts" title="Provider service notifications" text="Quotes, request updates and service messages use the real Notifications API." />
      <NotificationsPanel emptyText="Service request notifications will appear when providers respond." />
    </>
  );
}
