import { MapPin, ShieldCheck } from 'lucide-react';

export function ProfileHeader({
  role,
  name,
  subtitle,
  location,
  avatarUrl,
  coverUrl,
  badge,
  actions,
}) {
  const initials = String(name || 'FH')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'FH';

  return (
    <section className={`profile-hero profile-hero-${role}`} style={coverUrl ? { '--profile-cover': `url("${coverUrl}")` } : undefined}>
      <div className="profile-avatar-large">
        {avatarUrl ? <img src={avatarUrl} alt={name} /> : <span>{initials}</span>}
      </div>
      <div className="profile-hero-copy">
        {badge ? (
          <span className="profile-badge">
            <ShieldCheck size={16} />
            {badge}
          </span>
        ) : null}
        <h1>{name}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
        {location ? (
          <span className="profile-location">
            <MapPin size={16} />
            {location}
          </span>
        ) : null}
      </div>
      {actions ? <div className="profile-actions">{actions}</div> : null}
    </section>
  );
}
