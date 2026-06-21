import './DashboardSkeleton.css';

export function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton" aria-hidden="true">
      <div className="dashboard-skeleton__stats">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="dashboard-skeleton__block dashboard-skeleton__block--stat" key={index} />
        ))}
      </div>
      <div className="dashboard-skeleton__panels">
        <div className="dashboard-skeleton__block dashboard-skeleton__block--panel" />
        <div className="dashboard-skeleton__block dashboard-skeleton__block--panel" />
      </div>
    </div>
  );
}
