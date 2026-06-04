import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { completeServiceRequest, declineServiceRequest, getServiceRequestById, quoteServiceRequest } from '../../api/serviceRequestsApi.js';
import { InfoCard, PageHeader } from '../../components/common/Page.jsx';
import { ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { formatMoney, humanize } from '../../utils/format.js';

export function ProviderRequestDetailPage() {
  const { requestId } = useParams();
  const { data, loading, error, reload } = useAsyncData(() => getServiceRequestById(requestId), [requestId]);
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const request = data?.data || data || {};

  async function quote(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      await quoteServiceRequest(requestId, {
        amount: formData.get('amount'),
        pricingType: formData.get('pricingType'),
        validUntil: formData.get('validUntil'),
        notes: formData.get('notes'),
      });
      setStatus({ message: 'Quote sent to farmer.', tone: 'success' });
      reload();
    } catch (quoteError) {
      setStatus({ message: quoteError.message || 'Unable to send quote.', tone: 'error' });
    }
  }

  async function act(action, success) {
    try {
      await action(requestId);
      setStatus({ message: success, tone: 'success' });
      reload();
    } catch (actionError) {
      setStatus({ message: actionError.message || 'Unable to update request.', tone: 'error' });
    }
  }

  return (
    <>
      <PageHeader eyebrow="Request detail" title={request.listing?.title || 'Review farmer request'} text="Provider request actions are limited to provider-owned service requests." />
      {loading ? <LoadingState title="Loading request" /> : null}
      {error ? <ErrorState text={error} /> : null}
      {!loading && !error ? (
        <section className="two-column">
          <InfoCard title="Request summary" text={request.needDescription}>
            <p>Status: {humanize(request.status)}</p>
            <p>Farmer: {request.farmer?.name || 'Farmer'}</p>
            <p>Farm location: {request.farmLocation || 'Not listed'}</p>
            <p>Budget: {formatMoney(request.budget, 'Budget pending')}</p>
            {request.quote ? <p>Current quote: {formatMoney(request.quote.amount)} - {humanize(request.quote.pricingType)}</p> : null}
            {request.farmer?.id ? <Link className="secondary-button" to={`/provider/messages?recipientId=${encodeURIComponent(request.farmer.id)}&requestId=${encodeURIComponent(requestId)}`}>Message farmer</Link> : null}
          </InfoCard>
          <form className="info-card compact-form" onSubmit={quote}>
            <h2>Send quote</h2>
            <label>Amount<input type="number" name="amount" min="1" step="1" required /></label>
            <label>Pricing<select name="pricingType" defaultValue="fixed"><option value="fixed">Fixed</option><option value="per_hour">Per hour</option><option value="per_day">Per day</option><option value="per_acre">Per acre</option></select></label>
            <label>Valid until<input type="date" name="validUntil" /></label>
            <label className="wide-field">Notes<textarea name="notes" rows="4" /></label>
            <div className="card-actions">
              <button className="primary-button" type="submit">Send quote</button>
              <button className="secondary-button" type="button" onClick={() => act(declineServiceRequest, 'Request declined.')}>Decline</button>
              <button className="secondary-button" type="button" onClick={() => act(completeServiceRequest, 'Request marked complete.')}>Mark complete</button>
            </div>
          </form>
        </section>
      ) : null}
      <StatusMessage message={status.message} tone={status.tone} />
    </>
  );
}
