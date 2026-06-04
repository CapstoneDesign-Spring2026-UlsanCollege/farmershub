import { Outlet } from 'react-router-dom';
import { AppLogo } from '../components/common/AppLogo.jsx';

export function PublicLayout() {
  return (
    <main className="public-screen">
      <header className="public-header">
        <AppLogo to="/" />
        <nav>
          <a href="https://capstonedesign-spring2026-ulsancollege.github.io/farmershub/">Static reference</a>
        </nav>
      </header>
      <Outlet />
    </main>
  );
}
