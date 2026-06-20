import { NavLink } from 'react-router-dom';
import { usePermissions } from '../auth/usePermissions';
import { ROUTE_PERMISSIONS } from '../auth/permissions';
import { RoleSwitcher } from './RoleSwitcher';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/', label: 'Workflow', end: true },
  { to: '/procedure-generator', label: 'Procedure Generator', end: false },
  { to: '/document-upload', label: 'Document Upload', end: false },
  { to: '/nlp-extraction', label: 'NLP Extraction', end: false },
  { to: '/case-memory', label: 'Case Memory', end: false },
  { to: '/delay-prediction', label: 'Delay Prediction', end: false },
  { to: '/prevent-delay', label: 'Prevent Delay', end: false },
  { to: '/dashboard', label: 'Dashboard', end: false },
  { to: '/roles', label: 'Roles', end: false },
];

export function Sidebar() {
  const { canAny } = usePermissions();
  // Reads the same ROUTE_PERMISSIONS map the route guards use, so a nav
  // item is never visible for a role that would just get redirected away.
  const visibleItems = NAV_ITEMS.filter((item) => canAny(ROUTE_PERMISSIONS[item.to] ?? []));

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">Smart Dossier AI</div>
      <nav className="sidebar__nav" aria-label="Main navigation">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <RoleSwitcher />
    </aside>
  );
}
