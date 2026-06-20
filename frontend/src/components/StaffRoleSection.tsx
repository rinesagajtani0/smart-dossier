import { formatAlbanianDate } from '../utils/date';
import { RoleCapabilityCard } from './RoleCapabilityCard';
import type { StaffDossier, StaffWorkbench } from '../services/roleService';
import './StaffRoleSection.css';

interface StaffRoleSectionProps {
  dossiers: StaffDossier[];
  selectedDossier: StaffDossier | undefined;
  onSelectDossier: (id: number) => void;
  workbench: StaffWorkbench | null;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'not set';
  return formatAlbanianDate(value);
}

function riskClass(riskLevel: string): string {
  return `roles-page__risk roles-page__risk--${riskLevel}`;
}

export function StaffRoleSection({ dossiers, selectedDossier, onSelectDossier, workbench }: StaffRoleSectionProps) {
  return (
    <div className="staff-role-section">
      <h2 className="staff-role-section__title">Work Queue</h2>
      <section className="roles-page__split">
        <div className="roles-page__panel">
          <div className="roles-page__panel-header">
            <h3>Open Dossiers</h3>
            <span>{dossiers.length} dossiers</span>
          </div>
          <div className="roles-page__list">
            {dossiers.slice(0, 10).map((dossier) => (
              <button
                className={
                  selectedDossier?.id === dossier.id
                    ? 'roles-page__list-item roles-page__list-item--active'
                    : 'roles-page__list-item'
                }
                key={dossier.id}
                onClick={() => onSelectDossier(dossier.id)}
                type="button"
              >
                <span>
                  <strong>{dossier.trackingCode}</strong>
                  {dossier.title}
                </span>
                <span className={riskClass(dossier.riskLevel)}>{dossier.riskLevel}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="roles-page__panel">
          <div className="roles-page__panel-header">
            <h3>Next Action</h3>
            <span>{workbench?.dossier.phase ?? 'Select dossier'}</span>
          </div>
          {workbench && (
            <div className="roles-page__workbench">
              <div>
                <h4 className="roles-page__workbench-action">{workbench.nextAction.label}</h4>
                <p>{workbench.nextAction.reason}</p>
              </div>
              <div className="roles-page__details-grid">
                <span>Institution</span>
                <strong>{workbench.dossier.institution}</strong>
                <span>Deadline</span>
                <strong>{formatDate(workbench.dossier.deadline)}</strong>
                <span>Critical point</span>
                <strong>{workbench.processStep?.criticalPoint ? 'Yes' : 'No'}</strong>
                <span>Required docs</span>
                <strong>{workbench.processStep?.requiredDocuments.join(', ') || 'none'}</strong>
              </div>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="staff-role-section__toolkit-title">Staff Toolkit</h2>
        <div className="staff-role-section__toolkit-grid">
          <RoleCapabilityCard
            icon="🧾"
            title="NLP Extraction"
            description="Review structured fields and confidence scores extracted from uploaded documents."
            to="/nlp-extraction"
            linkLabel="Open NLP Extraction →"
          />
          <RoleCapabilityCard
            icon="🗂"
            title="Case Memory"
            description="Compare a dossier against similar historical cases, including outcomes and delay reasons."
            to="/case-memory"
            linkLabel="Open Case Memory →"
          />
          <RoleCapabilityCard
            icon="📈"
            title="Delay Prediction"
            description="Estimate delay risk and the likely bottleneck phase for any dossier."
            to="/delay-prediction"
            linkLabel="Open Delay Prediction →"
          />
          <RoleCapabilityCard
            icon="✉️"
            title="Letter Generation"
            description="Generate a ready-to-send administrative letter as part of a prevent-delay plan."
            to="/prevent-delay"
            linkLabel="Open Letter Generation →"
          />
          <RoleCapabilityCard
            icon="⚖"
            title="Legal Review"
            description="Review and act on legal-change impact for the selected dossier."
            to={selectedDossier ? `/dossiers/${selectedDossier.id}` : '/'}
            linkLabel="Open Legal Review →"
          />
        </div>
      </section>
    </div>
  );
}
