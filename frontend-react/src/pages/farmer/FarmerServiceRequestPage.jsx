import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFarmServiceListingById } from '../../api/farmServiceListingsApi.js';
import { createServiceRequest } from '../../api/serviceRequestsApi.js';
import { PageHeader } from '../../components/common/Page.jsx';
import { ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';

export function FarmerServiceRequestPage() {
  const { listingId } = useParams();
  const { data, loading, error } = useAsyncData(() => getFarmServiceListingById(listingId), [listingId]);
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const listing = data?.data || data || {};

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      await createServiceRequest({
        listingId,
        farmLocation: formData.get('farmLocation'),
        needDescription: formData.get('needDescription'),
        preferredStartDate: formData.get('preferredStartDate'),
        preferredEndDate: formData.get('preferredEndDate'),
        acreageOrQuantity: formData.get('acreageOrQuantity'),
        budget: formData.get('budget'),
        contactPreference: formData.get('contactPreference'),
        notes: formData.get('notes'),
      });
      event.currentTarget.reset();
      setStatus({ message: 'Service request submitted to the provider.', tone: 'success' });
    } catch (requestError) {
      setStatus({ message: requestError.message || 'Unable to submit request.', tone: 'error' });
    }
  }

  return (
    <>
      <PageHeader eyebrow="Service request" title={`Request ${listing.title || 'provider service'}`} text="This form uses the real farmer-to-provider service request API." />
      {loading ? <LoadingState title="Loading listing" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <form className="info-card compact-form" onSubmit={handleSubmit}>
        <label>Farm location<input name="farmLocation" required /></label>
        <label>Preferred start<input type="date" name="preferredStartDate" /></label>
        <label>Preferred end<input type="date" name="preferredEndDate" /></label>
        <label>Acreage or quantity<input name="acreageOrQuantity" /></label>
        <label>Budget<input type="number" name="budget" min="0" step="1" /></label>
        <label>Contact preference<select name="contactPreference"><option value="message">Message</option><option value="phone">Phone</option><option value="message_or_phone">Message or phone</option></select></label>
        <label className="wide-field">Description<textarea name="needDescription" rows="4" required /></label>
        <label className="wide-field">Notes<textarea name="notes" rows="3" /></label>
        <button className="primary-button" type="submit">Submit request</button>
      </form>
      <StatusMessage message={status.message} tone={status.tone} />
    </>
  );
}
