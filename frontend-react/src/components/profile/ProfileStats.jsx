export function ProfileStats({ stats = [] }) {
  return (
    <section className="profile-stats">
      {stats.map((stat) => (
        <article key={stat.label}>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
          {stat.text ? <p>{stat.text}</p> : null}
        </article>
      ))}
    </section>
  );
}
