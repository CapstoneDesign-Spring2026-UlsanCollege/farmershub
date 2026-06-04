import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { roleHomePath } from './roleRedirect.js';
import { useAuth } from './useAuth.js';

export function RoleRoute({ allowedRoles, children }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={roleHomePath(role)} replace />;
  }

  return children || <Outlet />;
}
