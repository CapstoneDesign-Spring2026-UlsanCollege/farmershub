import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { roleHomePath } from '../../auth/roleRedirect.js';
import { useAuth } from '../../auth/useAuth.js';
import { StatusMessage } from '../../components/common/States.jsx';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [role, setRole] = useState('farmer');
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setStatus({ message: 'Signing in...', tone: 'info' });
    try {
      await login({ ...form, role }, { expectedRole: role });
      const from = location.state?.from;
      const nextPath = from?.startsWith(`/${role}`) ? from : roleHomePath(role);
      navigate(nextPath, { replace: true });
    } catch (error) {
      setStatus({ message: error.message || 'Unable to sign in.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-panel">
      <div className="auth-copy">
        <span className="eyebrow">Safe React migration</span>
        <h1>Sign in to the isolated FarmersHub role app</h1>
        <p>Customer, Farmer and Provider workspaces use one shared session foundation while keeping private layouts separate.</p>
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="segmented-control" role="tablist" aria-label="Account role">
          {['farmer', 'customer'].map((item) => (
            <button
              key={item}
              type="button"
              className={role === item ? 'active' : ''}
              onClick={() => setRole(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <label>
          Email address
          <input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
          />
        </label>
        <button className="primary-button" type="submit" disabled={busy}>
          <LogIn size={18} />
          <span>{busy ? 'Signing in' : 'Sign in'}</span>
        </button>
        <StatusMessage message={status.message} tone={status.tone} />
        <div className="auth-links">
          <Link to="/register">Create customer or farmer account</Link>
          <Link to="/provider/login">Provider portal</Link>
        </div>
      </form>
    </section>
  );
}
