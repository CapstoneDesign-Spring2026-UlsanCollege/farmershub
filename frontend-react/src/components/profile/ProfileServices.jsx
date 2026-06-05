import { Link } from 'react-router-dom';
import { EmptyState } from '../common/States.jsx';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { formatMoney, getId, humanize } from '../../utils/format.js';

export function ProfileServices({ services = [], emptyText, requestPath, detailPath, action }) {
  return (
    <section className="profile-section">
      <div className="section-heading">
        <div>
          <h2>Services</h2>
          <p>{services.length ? 'Service listings available from this provider.' : emptyText}</p>
        </div>
        {action?.to ? <Link className="secondary-button" to={action.to}>{action.label}</Link> : null}
      </div>
      {services.length ? (
        <div className="service-grid">
          {services.map((service) => {
            const id = getId(service);
            return (
              <article className="service-card profile-service-card" key={id}>
                <StatusBadge label={humanize(service.category || 'Service')} tone="blue" />
                <h2>{service.title || service.name || 'Farm service'}</h2>
                <p>{service.description || 'Service details are pending.'}</p>
                <strong>{service.pricingType === 'quote_required' ? 'Quote required' : formatMoney(service.price)}</strong>
                <small>{service.serviceArea || service.provider?.serviceArea || 'Service area pending'}</small>
                <div className="card-actions">
                  {detailPath ? <Link className="secondary-button" to={detailPath(id)}>Details</Link> : null}
                  {requestPath ? <Link className="primary-button" to={requestPath(id)}>Request service</Link> : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No services listed yet" text={emptyText || 'Services will appear here when provider listings are returned.'} />
      )}
    </section>
  );
}
