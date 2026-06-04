import { useState } from 'react';
import { updateProviderProfile } from '../../../api/providerApi.js';
import { StatusMessage } from '../../../components/common/States.jsx';

export function ProviderProfileForm({ profile = {}, onSaved }) {
  const [status, setStatus] = useState({ message: '', tone: 'info' });

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      await updateProviderProfile({
        businessName: formData.get('businessName'),
        businessType: formData.get('businessType'),
        serviceArea: formData.get('serviceArea'),
        location: formData.get('location'),
        publicEmail: formData.get('publicEmail'),
        publicPhone: formData.get('publicPhone'),
        website: formData.get('website'),
        contactPreference: formData.get('contactPreference'),
        serviceCategories: formData.get('serviceCategories'),
        operatingHours: formData.get('operatingHours'),
        bio: formData.get('bio'),
      });
      setStatus({ message: 'Provider profile saved.', tone: 'success' });
      onSaved?.();
    } catch (saveError) {
      setStatus({ message: saveError.message || 'Unable to save provider profile.', tone: 'error' });
    }
  }

  return (
    <form className="info-card compact-form" onSubmit={handleSubmit}>
      <h2>Business profile</h2>
      <label>Business name<input name="businessName" defaultValue={profile.businessName || ''} required /></label>
      <label>Business type<input name="businessType" defaultValue={profile.businessType || ''} /></label>
      <label>Service area<input name="serviceArea" defaultValue={profile.serviceArea || ''} required /></label>
      <label>Location<input name="location" defaultValue={profile.location || ''} /></label>
      <label>Public email<input type="email" name="publicEmail" defaultValue={profile.publicEmail || ''} /></label>
      <label>Public phone<input name="publicPhone" defaultValue={profile.publicPhone || ''} /></label>
      <label>Website<input type="url" name="website" defaultValue={profile.website || ''} /></label>
      <label>Contact preference<select name="contactPreference" defaultValue={profile.contactPreference || 'message'}><option value="message">Message</option><option value="phone">Phone</option><option value="email">Email</option><option value="message_or_phone">Message or phone</option></select></label>
      <label className="wide-field">Service categories<input name="serviceCategories" defaultValue={Array.isArray(profile.serviceCategories) ? profile.serviceCategories.join(', ') : ''} placeholder="tractor, delivery_truck" /></label>
      <label className="wide-field">Operating hours<input name="operatingHours" defaultValue={profile.operatingHours || ''} /></label>
      <label className="wide-field">Bio<textarea name="bio" rows="4" defaultValue={profile.bio || ''} /></label>
      <button className="primary-button" type="submit">Save provider profile</button>
      <StatusMessage message={status.message} tone={status.tone} />
    </form>
  );
}
