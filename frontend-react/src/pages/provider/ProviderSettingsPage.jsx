import { getProviderProfile } from '../../api/providerApi.js';
import { InfoCard, PageHeader } from '../../components/common/Page.jsx';
import { ErrorState, LoadingState } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';

export function ProviderSettingsPage() {
  const { data, loading, error } = useAsyncData(getProviderProfile, []);
  const profile = data?.data || data || {};

  return (
    <>
      <PageHeader eyebrow="Settings" title="Account and platform status" text="Provider settings keep account facts separate from unconnected platform capabilities." />
      {loading ? <LoadingState title="Loading settings" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <section className="card-grid">
        <InfoCard title="Account role" text="This route requires role === provider." />
        <InfoCard title="Onboarding" text={profile.isOnboarded ? 'Provider profile is onboarded.' : 'Complete business name and service area before publishing listings.'} />
        <InfoCard title="Pending features" text="Payments, payouts, ratings, reviews and service media uploads are not connected yet." />
      </section>
    </>
  );
}
