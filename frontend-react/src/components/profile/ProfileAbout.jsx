export function ProfileAbout({ title = 'About', text, details = [] }) {
  return (
    <article className="info-card profile-about">
      <div className="info-card-head">
        <div>
          <h2>{title}</h2>
          {text ? <p>{text}</p> : null}
        </div>
      </div>
      {details.length ? (
        <dl className="profile-detail-list">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt>{detail.label}</dt>
              <dd>{detail.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  );
}
