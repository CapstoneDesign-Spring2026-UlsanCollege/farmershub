import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../auth/useAuth.js';
import { StatusMessage } from '../../components/common/States.jsx';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState('farmer');
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setStatus({ message: 'Creating account...', tone: 'info' });
    const formData = new FormData(event.currentTarget);
    try {
      await register({
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        password: formData.get('password'),
        role,
        phone: formData.get('phone'),
        address: formData.get('address'),
      }, { expectedRole: role });
      setStatus({ message: 'Account created. Sign in with the same role to continue.', tone: 'success' });
      window.setTimeout(() => navigate('/login'), 800);
    } catch (error) {
      setStatus({ message: error.message || 'Unable to create account.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-panel">
      <div className="auth-copy">
        <span className="eyebrow">Role-aware signup</span>
        <h1>Create a customer or farmer account</h1>
        <p>Provider accounts use the separate Provider Portal registration route.</p>
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
        <label>Full name<input name="fullName" required /></label>
        <label>Email address<input name="email" type="email" required /></label>
        <label>Phone<input name="phone" type="tel" /></label>
        <label>Address<input name="address" /></label>
        <label>Password<input name="password" type="password" minLength={6} required /></label>
        <button className="primary-button" type="submit" disabled={busy}>
          <UserPlus size={18} />
          <span>{busy ? 'Creating' : 'Create account'}</span>
        </button>
        <StatusMessage message={status.message} tone={status.tone} />
        <div className="auth-links">
          <Link to="/login">Back to login</Link>
          <Link to="/provider/register">Create provider account</Link>
        </div>
      </form>
    </section>
  );
}
