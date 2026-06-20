import './ProcedureResultSkeleton.css';

export function ProcedureResultSkeleton() {
  return (
    <div className="procedure-result-skeleton" aria-hidden="true">
      <div className="procedure-result-skeleton__block procedure-result-skeleton__block--title" />
      <div className="procedure-result-skeleton__block procedure-result-skeleton__block--title" />
      <div className="procedure-result-skeleton__block" />
      <div className="procedure-result-skeleton__block" />

      <div className="procedure-result-skeleton__full">
        <div className="procedure-result-skeleton__block procedure-result-skeleton__block--row" />
        <div className="procedure-result-skeleton__block procedure-result-skeleton__block--row" />
        <div className="procedure-result-skeleton__block procedure-result-skeleton__block--row" />
      </div>
    </div>
  );
}
