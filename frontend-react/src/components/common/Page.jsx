export function PageHeader({ eyebrow, title, text, actions }) {
  return (
    <section className="page-header">
      <div>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {text ? <p>{text}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </section>
  );
}

export function MetricCard({ label, value, text }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {text ? <p>{text}</p> : null}
    </article>
  );
}

export function InfoCard({ title, text, children }) {
  return (
    <article className="info-card">
      {title ? <h2>{title}</h2> : null}
      {text ? <p>{text}</p> : null}
      {children}
    </article>
  );
}
