import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Power } from 'lucide-react';
import { roleHomePath } from '../../auth/roleRedirect.js';
import { useAuth } from '../../auth/useAuth.js';
import { StatusMessage } from '../../components/common/States.jsx';

export function ProviderLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setBusy(true);
    setStatus({ message: 'Signing into Provider Portal...', tone: 'info' });
    try {
      const response = await login({ email: formData.get('email'), password: formData.get('password'), role: 'provider' });
      const user = response.user || response.data?.user || response.data;
      if (user?.role !== 'provider') {
        setStatus({ message: `Provider Portal access requires a provider account. This account is ${user?.role || 'unknown'}.`, tone: 'error' });
        return;
      }
      navigate(roleHomePath('provider'), { replace: true });
    } catch (error) {
      setStatus({ message: error.message || 'Unable to sign in.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-panel provider-auth-panel">
      <div className="auth-copy">
        <span className="eyebrow">Provider Portal</span>
        <h1>Sign in as a farm service provider</h1>
        <p>Provider accounts manage service listings, farmer requests and provider-to-farmer messages only.</p>
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <label>Email address<input type="email" name="email" autoComplete="email" required /></label>
        <label>Password<input type="password" name="password" autoComplete="current-password" required /></label>
        <button className="primary-button" type="submit" disabled={busy}><Power size={18} /><span>{busy ? 'Signing in' : 'Sign in'}</span></button>
        <StatusMessage message={status.message} tone={status.tone} />
        <div className="auth-links">
          <Link to="/provider/register">Create provider account</Link>
          <Link to="/login">Customer or farmer login</Link>
        </div>
      </form>
    </section>
  );
}
