import './StatCard.css';

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  tone?: 'default' | 'danger' | 'warning' | 'legal';
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const TREND_ARROW: Record<'up' | 'down' | 'neutral', string> = {
  up: '▲',
  down: '▼',
  neutral: '–',
};

export function StatCard({ label, value, suffix = '', tone = 'default', icon, trend }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      {(icon || trend) && (
        <div className="stat-card__top">
          {icon && (
            <span className="stat-card__icon" aria-hidden="true">
              {icon}
            </span>
          )}
          {trend && (
            <span className={`stat-card__trend stat-card__trend--${trend}`}>{TREND_ARROW[trend]}</span>
          )}
        </div>
      )}
      <span className="stat-card__value">
        {value}
        {suffix}
      </span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}
