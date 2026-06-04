import { getProfile } from '../../api/profileApi.js';
import { PageHeader, MetricCard } from '../../components/common/Page.jsx';
import { ErrorState, LoadingState } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';

export function CustomerProfilePage() {
  const { data, loading, error } = useAsyncData(getProfile, []);
  const profile = data?.data || data || {};

  return (
    <>
      <PageHeader eyebrow="Profile" title="Customer account" text="This customer-safe profile view does not expose farmer product or provider management controls." />
      {loading ? <LoadingState title="Loading profile" /> : null}
      {error ? <ErrorState text={error} /> : null}
      {!loading && !error ? (
        <section className="metric-grid">
          <MetricCard label="Name" value={profile.fullName || profile.name || 'Not set'} text={profile.email || 'Email unavailable'} />
          <MetricCard label="Role" value={profile.role || 'customer'} text="Customer-only shopping workspace" />
          <MetricCard label="Location" value={profile.location || profile.address || 'Not set'} text="Used only as account context here" />
        </section>
      ) : null}
    </>
  );
}
