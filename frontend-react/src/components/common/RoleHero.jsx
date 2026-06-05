export function RoleHero({ eyebrow, title, text, actions, visual, aside, className = '', style }) {
  return (
    <section className={`role-hero ${className}`} style={style}>
      <div className="role-hero-copy">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {text ? <p>{text}</p> : null}
        {actions ? <div className="hero-actions">{actions}</div> : null}
      </div>
      {visual ? <div className="role-hero-visual">{visual}</div> : null}
      {aside ? <div className="role-hero-aside">{aside}</div> : null}
    </section>
  );
}
