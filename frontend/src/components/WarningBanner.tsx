import type { ReactNode } from 'react';
import './WarningBanner.css';

type WarningTone = 'high' | 'medium';

interface WarningBannerProps {
  tone: WarningTone;
  children: ReactNode;
}

export function WarningBanner({ tone, children }: WarningBannerProps) {
  return (
    <div className={`warning-banner warning-banner--${tone}`} role="alert">
      <span className="warning-banner__icon" aria-hidden="true">
        ⚠
      </span>
      <span className="warning-banner__message">{children}</span>
    </div>
  );
}
