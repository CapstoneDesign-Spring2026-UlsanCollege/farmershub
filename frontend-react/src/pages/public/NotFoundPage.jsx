import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/common/States.jsx';

export function NotFoundPage() {
  return (
    <main className="not-found">
      <EmptyState
        title="Route not found"
        text="This React migration keeps role routes explicit. Return to login and open the correct role workspace."
      />
      <Link className="secondary-button" to="/login">Go to login</Link>
    </main>
  );
}
