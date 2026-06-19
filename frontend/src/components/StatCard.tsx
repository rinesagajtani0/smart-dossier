import './StatCard.css';

interface StatCardProps {
  label: string;
  value: number;
  tone?: 'default' | 'danger' | 'warning';
}

export function StatCard({ label, value, tone = 'default' }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}
