export function StatusBadge({ label, tone = 'green', icon = null }) {
  if (!label) return null;
  return (
    <span className={`status-badge status-badge-${tone}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
}
