import './FeatureHighlightCard.css';

interface FeatureHighlightCardProps {
  icon: string;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureHighlightCard({ icon, title, description, delay = 0 }: FeatureHighlightCardProps) {
  return (
    <div className="feature-highlight-card" style={{ '--entrance-delay': `${delay}ms` } as React.CSSProperties}>
      <span className="feature-highlight-card__icon" aria-hidden="true">
        {icon}
      </span>
      <h3 className="feature-highlight-card__title">{title}</h3>
      <p className="feature-highlight-card__description">{description}</p>
    </div>
  );
}
