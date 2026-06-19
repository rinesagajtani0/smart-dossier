import { NavLink } from 'react-router-dom';
import './Navbar.css';

export function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand">
          Smart Dossier
        </NavLink>
        <nav className="navbar__links">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'navbar__link navbar__link--active' : 'navbar__link')}
            end
          >
            Dashboard
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
