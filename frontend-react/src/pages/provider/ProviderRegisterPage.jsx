import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../auth/useAuth.js';
import { StatusMessage } from '../../components/common/States.jsx';

export function ProviderRegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setBusy(true);
    setStatus({ message: 'Creating provider account...', tone: 'info' });
    try {
      await register({
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        role: 'provider',
      }, { expectedRole: 'provider', persistSession: true });
      setStatus({ message: 'Provider account created. Preparing your workspace...', tone: 'success' });
      window.setTimeout(() => navigate('/provider/onboarding', { replace: true }), 500);
    } catch (error) {
      setStatus({ message: error.message || 'Unable to create provider account.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-panel provider-auth-panel">
      <div className="auth-copy">
        <span className="eyebrow">Provider registration</span>
        <h1>Create provider account</h1>
        <p>Provider registration creates a provider role, separate from farmers and customers.</p>
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <label>Full name<input name="fullName" required /></label>
        <label>Email<input type="email" name="email" required /></label>
        <label>Phone<input name="phone" /></label>
        <label>Address<input name="address" /></label>
        <label>Password<input type="password" name="password" minLength={6} required /></label>
        <button className="primary-button" type="submit" disabled={busy}>
          <UserPlus size={18} />
          <span>{busy ? 'Creating' : 'Create provider account'}</span>
        </button>
        <StatusMessage message={status.message} tone={status.tone} />
      </form>
    </section>
  );
}
