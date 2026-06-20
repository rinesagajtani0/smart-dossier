import { useAuth } from '../auth/useAuth';
import { ALL_ROLES, ROLES } from '../auth/roles';
import type { Role } from '../auth/roles';
import './RoleSwitcher.css';

export function RoleSwitcher() {
  const { role, setRole } = useAuth();

  return (
    <div className="role-switcher">
      <label htmlFor="role-switcher-select">Viewing as</label>
      <select
        id="role-switcher-select"
        value={role}
        onChange={(event) => setRole(event.target.value as Role)}
      >
        {ALL_ROLES.map((id) => (
          <option key={id} value={id}>
            {ROLES[id].label}
          </option>
        ))}
      </select>
    </div>
  );
}
