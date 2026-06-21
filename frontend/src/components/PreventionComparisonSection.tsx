import './PreventionComparisonSection.css';

const WITHOUT_ITEMS = ['Long processing time', 'Missing documents', 'Manual corrections'];
const WITH_ITEMS = ['Faster processing', 'Complete dossiers', 'Reduced delays'];

export function PreventionComparisonSection() {
  return (
    <div className="prevention-comparison">
      <div className="prevention-comparison__card prevention-comparison__card--without">
        <h3>Without Prevention</h3>
        <ul>
          {WITHOUT_ITEMS.map((item) => (
            <li key={item}>
              <span aria-hidden="true">✗</span> {item}
            </li>
          ))}
        </ul>
      </div>

      <span className="prevention-comparison__arrow" aria-hidden="true">
        →
      </span>

      <div className="prevention-comparison__card prevention-comparison__card--with">
        <h3>With AI Prevention</h3>
        <ul>
          {WITH_ITEMS.map((item) => (
            <li key={item}>
              <span aria-hidden="true">✓</span> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
