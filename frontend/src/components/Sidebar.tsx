import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/', label: 'Workflow', end: true },
  { to: '/dashboard', label: 'Dashboard', end: false },
  { to: '/roles', label: 'Roles', end: false },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">Smart Dossier AI</div>
      <nav className="sidebar__nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
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
    </aside>
  );
}
