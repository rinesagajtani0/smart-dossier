import './LegalChangeBadge.css';

export function LegalChangeBadge() {
  return (
    <span className="legal-change-badge" title="This dossier has a recent legal change impact">
      <span aria-hidden="true">⚖</span> Legal Change
    </span>
  );
}
