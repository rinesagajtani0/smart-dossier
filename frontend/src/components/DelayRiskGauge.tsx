import { useEffect, useState } from 'react';
import type { RiskLevel } from '../types/dossier';
import './DelayRiskGauge.css';

interface DelayRiskGaugeProps {
  percent: number;
  riskLevel: RiskLevel;
}

const RISK_COLOR: Record<RiskLevel, string> = {
  low: '#15803d',
  medium: '#b45309',
  high: '#b91c1c',
};

const SIZE = 140;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function DelayRiskGauge({ percent, riskLevel }: DelayRiskGaugeProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));
  const targetOffset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;

  // Mount at "empty" and animate to the real value next frame, so the ring
  // sweeps in instead of appearing already full — the CSS transition on
  // stroke-dashoffset does the actual easing.
  const [offset, setOffset] = useState(CIRCUMFERENCE);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOffset(targetOffset));
    return () => cancelAnimationFrame(frame);
  }, [targetOffset]);

  return (
    <div className="delay-risk-gauge">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--code-bg)" strokeWidth={STROKE} />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={RISK_COLOR[riskLevel]}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          className="delay-risk-gauge__fill"
        />
      </svg>
      <div className="delay-risk-gauge__center">
        <span className="delay-risk-gauge__value">{clamped}%</span>
        <span className="delay-risk-gauge__label">Delay Probability</span>
      </div>
    </div>
  );
}
