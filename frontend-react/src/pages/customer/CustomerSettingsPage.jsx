import { useState } from 'react';
import { getProfile, updateProfile } from '../../api/profileApi.js';
import { PageHeader } from '../../components/common/Page.jsx';
import { ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';

export function CustomerSettingsPage() {
  const { data, loading, error, reload } = useAsyncData(getProfile, []);
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const profile = data?.data || data || {};

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      await updateProfile({
        fullName: formData.get('fullName'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        paymentMethod: formData.get('paymentMethod'),
      });
      setStatus({ message: 'Customer account settings saved.', tone: 'success' });
      reload();
    } catch (saveError) {
      setStatus({ message: saveError.message || 'Unable to save settings.', tone: 'error' });
    }
  }

  return (
    <>
      <PageHeader eyebrow="Settings" title="Customer settings" text="Customer settings are limited to account fields and do not render farmer or provider private controls." />
      {loading ? <LoadingState title="Loading settings" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <form className="info-card compact-form" onSubmit={handleSubmit}>
        <label>Full name<input name="fullName" defaultValue={profile.fullName || profile.name || ''} /></label>
        <label>Phone<input name="phone" defaultValue={profile.phone || ''} /></label>
        <label>Address<input name="address" defaultValue={profile.address || profile.location || ''} /></label>
        <label>Payment preference<input name="paymentMethod" defaultValue={profile.paymentMethod || ''} placeholder="Pending payment integration" /></label>
        <button className="primary-button" type="submit">Save settings</button>
      </form>
      <StatusMessage message={status.message} tone={status.tone} />
    </>
  );
}
