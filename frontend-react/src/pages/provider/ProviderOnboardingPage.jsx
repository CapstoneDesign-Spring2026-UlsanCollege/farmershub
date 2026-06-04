import { getProviderProfile } from '../../api/providerApi.js';
import { PageHeader } from '../../components/common/Page.jsx';
import { ErrorState, LoadingState } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { ProviderProfileForm } from './components/ProviderProfileForm.jsx';

export function ProviderOnboardingPage() {
  const { data, loading, error, reload } = useAsyncData(getProviderProfile, []);
  const profile = data?.data || data || {};
  return (
    <>
      <PageHeader eyebrow="Onboarding" title="Set up provider business profile" text="Complete a real provider profile before publishing service listings." />
      {loading ? <LoadingState title="Loading provider profile" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <ProviderProfileForm profile={profile} onSaved={reload} />
    </>
  );
}
