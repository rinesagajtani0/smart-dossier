import type { CSSProperties } from 'react';
import { useCountUp } from '../hooks/useCountUp';
import './AnimatedStatCard.css';

interface AnimatedStatCardProps {
  icon: string;
  label: string;
  value: number;
  suffix?: string;
  caption?: string;
  delay?: number;
}

export function AnimatedStatCard({ icon, label, value, suffix = '', caption, delay = 0 }: AnimatedStatCardProps) {
  const animatedValue = useCountUp(value);

  return (
    <div className="animated-stat-card" style={{ '--entrance-delay': `${delay}ms` } as CSSProperties}>
      <span className="animated-stat-card__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="animated-stat-card__value">
        {animatedValue}
        {suffix}
      </span>
      <span className="animated-stat-card__label">{label}</span>
      {caption && <span className="animated-stat-card__caption">{caption}</span>}
    </div>
  );
}
