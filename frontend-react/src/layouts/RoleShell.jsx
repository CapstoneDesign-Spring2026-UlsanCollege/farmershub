import { LogOut } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AppLogo } from '../components/common/AppLogo.jsx';
import { roleHomePath } from '../auth/roleRedirect.js';
import { useAuth } from '../auth/useAuth.js';

export function RoleShell({ roleLabel, homePath, navItems, className }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className={`role-shell ${className}`}>
      <aside className="role-sidebar">
        <AppLogo to={roleHomePath(role)} />
        <p className="role-label">{roleLabel}</p>
        <nav className="role-nav" aria-label={`${roleLabel} navigation`}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === homePath}>
              <Icon aria-hidden="true" size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="role-main">
        <header className="role-topbar">
          <div>
            <span>{roleLabel}</span>
            <strong>{user?.fullName || user?.name || user?.email || 'FarmersHub member'}</strong>
          </div>
          <button className="icon-button" type="button" onClick={handleLogout} aria-label="Log out" title="Log out">
            <LogOut size={18} />
          </button>
        </header>
        <div className="role-content">
          <Outlet />
        </div>
      </section>
    </div>
  );
}
