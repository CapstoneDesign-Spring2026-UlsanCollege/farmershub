import { useLocation } from 'react-router-dom';

export function AnimatedRouteShell({ children }) {
  const location = useLocation();
  return (
    <div className="animated-route-shell" key={location.pathname}>
      {children}
    </div>
  );
}
