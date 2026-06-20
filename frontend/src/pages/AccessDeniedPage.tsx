import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { ROLES } from '../auth/roles';
import './AccessDeniedPage.css';

export function AccessDeniedPage() {
  const { role } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  return (
    <div className="access-denied-page">
      <span className="access-denied-page__icon" aria-hidden="true">
        🚫
      </span>
      <h1>Access Denied</h1>
      <p>
        Your current role (<strong>{ROLES[role].label}</strong>) doesn't have permission to view
        {from ? (
          <>
            {' '}
            <code>{from}</code>
          </>
        ) : (
          ' this page'
        )}
        .
      </p>
      <Link to="/" className="access-denied-page__link">
        ← Back to workflow
      </Link>
    </div>
  );
}
