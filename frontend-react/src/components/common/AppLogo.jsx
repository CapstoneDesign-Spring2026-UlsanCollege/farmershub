import { Link } from 'react-router-dom';

export function AppLogo({ to = '/', label = 'FarmersHub' }) {
  return (
    <Link className="app-logo" to={to} aria-label={label}>
      <img src={`${import.meta.env.BASE_URL}logo.png`} alt="FarmersHub logo" />
      <span>FarmersHub</span>
    </Link>
  );
}
