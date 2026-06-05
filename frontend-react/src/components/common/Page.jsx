export function PageHeader({ eyebrow, title, text, actions, className = '' }) {
  return (
    <section className={`page-header ${className}`}>
      <div>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {text ? <p>{text}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </section>
  );
}

export function MetricCard({ label, value, text, icon = null, tone = 'green' }) {
  return (
    <article className={`metric-card metric-card-${tone}`}>
      {icon ? <span className="metric-icon">{icon}</span> : null}
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {text ? <p>{text}</p> : null}
      </div>
    </article>
  );
}

export function InfoCard({ title, text, children, className = '', actions = null }) {
  return (
    <article className={`info-card ${className}`}>
      {title || actions ? (
        <div className="info-card-head">
          <div>
            {title ? <h2>{title}</h2> : null}
            {text ? <p>{text}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </article>
  );
}
