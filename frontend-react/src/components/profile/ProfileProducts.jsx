import { Link } from 'react-router-dom';
import { ProductCard } from '../common/ProductCard.jsx';
import { EmptyState } from '../common/States.jsx';
import { getId } from '../../utils/format.js';

export function ProfileProducts({ title = 'Products', products = [], detailPath, farmerPath, allowCustomerActions = false, emptyText, action }) {
  return (
    <section className="profile-section">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          <p>{products.length ? 'Fresh listings connected to this profile.' : emptyText}</p>
        </div>
        {action?.to ? <Link className="secondary-button" to={action.to}>{action.label}</Link> : null}
      </div>
      {products.length ? (
        <div className="card-grid profile-card-grid">
          {products.map((product) => (
            <ProductCard
              key={getId(product)}
              product={product}
              detailPath={detailPath}
              farmerPath={farmerPath}
              allowCustomerActions={allowCustomerActions}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No products listed yet" text={emptyText || 'Products will appear here when the backend returns listings.'} />
      )}
    </section>
  );
}
