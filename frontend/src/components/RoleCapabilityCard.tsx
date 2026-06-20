import { Link } from 'react-router-dom';
import './RoleCapabilityCard.css';

interface RoleCapabilityCardProps {
  icon: string;
  title: string;
  description: string;
  to: string;
  linkLabel: string;
}

export function RoleCapabilityCard({ icon, title, description, to, linkLabel }: RoleCapabilityCardProps) {
  return (
    <div className="role-capability-card">
      <span className="role-capability-card__icon" aria-hidden="true">
        {icon}
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      <Link to={to} className="role-capability-card__link">
        {linkLabel}
      </Link>
    </div>
  );
}
