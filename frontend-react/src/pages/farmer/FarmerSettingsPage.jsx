import { useState } from 'react';
import { getProfile, updateProfile } from '../../api/profileApi.js';
import { PageHeader } from '../../components/common/Page.jsx';
import { ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';

export function FarmerSettingsPage() {
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
        bio: formData.get('bio'),
        location: formData.get('location'),
        farmName: formData.get('farmName'),
        products: formData.get('products'),
        cropTypes: String(formData.get('cropTypes') || '').split(',').map((item) => item.trim()).filter(Boolean),
      });
      setStatus({ message: 'Farmer settings saved.', tone: 'success' });
      reload();
    } catch (saveError) {
      setStatus({ message: saveError.message || 'Unable to save settings.', tone: 'error' });
    }
  }

  return (
    <>
      <PageHeader eyebrow="Settings" title="Farmer account and farm settings" text="These settings update farmer-safe profile fields only." />
      {loading ? <LoadingState title="Loading settings" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <form className="info-card compact-form" onSubmit={handleSubmit}>
        <label>Full name<input name="fullName" defaultValue={profile.fullName || profile.name || ''} /></label>
        <label>Phone<input name="phone" defaultValue={profile.phone || ''} /></label>
        <label>Address<input name="address" defaultValue={profile.address || ''} /></label>
        <label>Farm name<input name="farmName" defaultValue={profile.farmName || ''} /></label>
        <label>Location<input name="location" defaultValue={profile.location || profile.farmLocation || ''} /></label>
        <label>Products grown<input name="products" defaultValue={profile.products || ''} /></label>
        <label>Crop types<input name="cropTypes" defaultValue={Array.isArray(profile.cropTypes) ? profile.cropTypes.join(', ') : ''} /></label>
        <label className="wide-field">Bio<textarea name="bio" rows="4" defaultValue={profile.bio || ''} /></label>
        <button className="primary-button" type="submit">Save farmer settings</button>
      </form>
      <StatusMessage message={status.message} tone={status.tone} />
    </>
  );
}
