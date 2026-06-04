import { Link } from 'react-router-dom';
import { formatMoney, getId, humanize } from '../../../utils/format.js';

export function ListingLine({ listing, onToggle }) {
  return (
    <article className="line-item">
      <div>
        <strong>{listing.title}</strong>
        <span>{humanize(listing.category)} - {listing.pricingType === 'quote_required' ? 'Quote required' : formatMoney(listing.price)}</span>
      </div>
      <div className="card-actions">
        <span className={listing.isActive ? 'status-chip' : 'status-chip warn'}>{listing.isActive ? 'Active' : 'Inactive'}</span>
        <Link className="secondary-button" to={`/provider/listings/${encodeURIComponent(getId(listing))}/edit`}>Edit</Link>
        {onToggle ? (
          <button className="secondary-button" type="button" onClick={() => onToggle(listing)}>
            {listing.isActive ? 'Deactivate' : 'Activate'}
          </button>
        ) : null}
      </div>
    </article>
  );
}
