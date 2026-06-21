import type { CSSProperties } from 'react';
import './MiniBarChart.css';

interface MiniBarChartProps {
  title: string;
  icon?: string;
  data: Record<string, number>;
}

export function MiniBarChart({ title, icon, data }: MiniBarChartProps) {
  const entries = Object.entries(data);
  const max = Math.max(1, ...entries.map(([, value]) => value));

  return (
    <div className="mini-bar-chart">
      <h3 className="mini-bar-chart__title">
        {icon && <span aria-hidden="true">{icon}</span>} {title}
      </h3>

      {entries.length === 0 ? (
        <p className="mini-bar-chart__empty">No data yet.</p>
      ) : (
        <ul className="mini-bar-chart__list">
          {entries.map(([label, value], index) => (
            <li
              key={label}
              className="mini-bar-chart__row"
              style={{ '--bar-delay': `${index * 80}ms` } as CSSProperties}
            >
              <span className="mini-bar-chart__label">{label}</span>
              <div className="mini-bar-chart__track">
                <div
                  className="mini-bar-chart__fill"
                  style={{ '--target-width': `${(value / max) * 100}%` } as CSSProperties}
                />
              </div>
              <span className="mini-bar-chart__value">{value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
