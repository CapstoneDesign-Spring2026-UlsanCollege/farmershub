import { ArrowUpRight, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SidebarPromoCard({ title, text, actionLabel, to, tone = 'green' }) {
  return (
    <article className={`sidebar-promo-card sidebar-promo-${tone}`}>
      <span className="sidebar-promo-icon"><Sprout size={22} /></span>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      {to && actionLabel ? (
        <Link className="sidebar-promo-link" to={to}>
          <span>{actionLabel}</span>
          <ArrowUpRight size={15} />
        </Link>
      ) : null}
    </article>
  );
}
