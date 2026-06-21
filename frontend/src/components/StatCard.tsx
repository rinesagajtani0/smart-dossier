import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import './StatCard.css';

interface StatCardProps {
  label: string;
  value: number;
  tone?: 'default' | 'danger' | 'warning' | 'legal';
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  delay?: number;
}

const TREND_ARROW: Record<'up' | 'down' | 'neutral', string> = {
  up: '▲',
  down: '▼',
  neutral: '–',
};

export function StatCard({ label, value, tone = 'default', icon, trend, delay = 0 }: StatCardProps) {
  const animatedValue = useAnimatedCounter(value);

  return (
    <div
      className={`stat-card stat-card--${tone}`}
      style={{ '--entrance-delay': `${delay}ms` } as React.CSSProperties}
    >
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
      <span className="stat-card__value">{animatedValue}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}
