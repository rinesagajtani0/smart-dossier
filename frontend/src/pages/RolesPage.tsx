import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  getCitizenTracking,
  getManagerDashboard,
  getStaffDossiers,
  getStaffWorkbench,
  type CitizenTracking,
  type ManagerDashboard,
  type StaffDossier,
  type StaffWorkbench,
} from '../services/roleService';
import { ApiError } from '../services/apiClient';
import './RolesPage.css';

type RoleTab = 'staff' | 'manager' | 'citizen';

function citizenTrackingErrorMessage(err: unknown): string {
  if (err instanceof ApiError && err.status === 404) {
    return 'No dossier found for that tracking code. Double-check the code and try again.';
  }
  return err instanceof Error ? err.message : 'Could not find tracking code.';
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'not set';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function riskClass(riskLevel: string): string {
  return `roles-page__risk roles-page__risk--${riskLevel}`;
}

export function RolesPage() {
  const [activeRole, setActiveRole] = useState<RoleTab>('staff');
  const [staffDossiers, setStaffDossiers] = useState<StaffDossier[]>([]);
  const [selectedDossierId, setSelectedDossierId] = useState<number | null>(null);
  const [workbench, setWorkbench] = useState<StaffWorkbench | null>(null);
  const [managerDashboard, setManagerDashboard] = useState<ManagerDashboard | null>(null);
  const [trackingCode, setTrackingCode] = useState('EXP-001');
  const [citizenTracking, setCitizenTracking] = useState<CitizenTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedDossier = useMemo(
    () => staffDossiers.find((dossier) => dossier.id === selectedDossierId) ?? staffDossiers[0],
    [selectedDossierId, staffDossiers],
  );

  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      setLoading(true);
      setError(null);
      try {
        const [dossiers, manager, citizen] = await Promise.all([
          getStaffDossiers(),
          getManagerDashboard(),
          getCitizenTracking(trackingCode),
        ]);

        if (!mounted) return;
        setStaffDossiers(dossiers);
        setSelectedDossierId(dossiers[0]?.id ?? null);
        setManagerDashboard(manager);
        setCitizenTracking(citizen);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Could not load role data.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadInitialData();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadWorkbench() {
      if (!selectedDossier?.id) return;
      try {
        const data = await getStaffWorkbench(selectedDossier.id);
        if (mounted) setWorkbench(data);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Could not load workbench.');
      }
    }

    void loadWorkbench();
    return () => {
      mounted = false;
    };
  }, [selectedDossier?.id]);

  async function handleCitizenSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      setCitizenTracking(await getCitizenTracking(trackingCode.trim()));
    } catch (err) {
      setCitizenTracking(null);
      setError(citizenTrackingErrorMessage(err));
    }
  }

  return (
    <div className="roles-page">
      <header className="roles-page__header">
        <div>
          <h1>Role Views</h1>
          <p>Demo access for civil servants, managers, and citizens without authentication.</p>
        </div>
        <div className="roles-page__tabs" aria-label="Role views">
          <button className={activeRole === 'staff' ? 'roles-page__tab roles-page__tab--active' : 'roles-page__tab'} onClick={() => setActiveRole('staff')} type="button">
            Staff
          </button>
          <button className={activeRole === 'manager' ? 'roles-page__tab roles-page__tab--active' : 'roles-page__tab'} onClick={() => setActiveRole('manager')} type="button">
            Manager
          </button>
          <button className={activeRole === 'citizen' ? 'roles-page__tab roles-page__tab--active' : 'roles-page__tab'} onClick={() => setActiveRole('citizen')} type="button">
            Citizen
          </button>
        </div>
      </header>

      {loading && <p className="roles-page__status">Loading role data...</p>}
      {error && <p className="roles-page__status roles-page__status--error">{error}</p>}

      {!loading && activeRole === 'staff' && (
        <section className="roles-page__split">
          <div className="roles-page__panel">
            <div className="roles-page__panel-header">
              <h2>Staff Work Queue</h2>
              <span>{staffDossiers.length} dossiers</span>
            </div>
            <div className="roles-page__list">
              {staffDossiers.slice(0, 10).map((dossier) => (
                <button
                  className={selectedDossier?.id === dossier.id ? 'roles-page__list-item roles-page__list-item--active' : 'roles-page__list-item'}
                  key={dossier.id}
                  onClick={() => setSelectedDossierId(dossier.id)}
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
              <h2>AI Workbench</h2>
              <span>{workbench?.dossier.phase ?? 'Select dossier'}</span>
            </div>
            {workbench && (
              <div className="roles-page__workbench">
                <div>
                  <p className="roles-page__label">Next action</p>
                  <h3>{workbench.nextAction.label}</h3>
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
                <div>
                  <p className="roles-page__label">AI endpoints used in this role</p>
                  <div className="roles-page__chips">
                    {workbench.aiTools.map((tool) => (
                      <code key={tool}>{tool}</code>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {!loading && activeRole === 'manager' && managerDashboard && (
        <section className="roles-page__manager">
          <div className="roles-page__metrics">
            <div><strong>{managerDashboard.totals.dossiers}</strong><span>Total</span></div>
            <div><strong>{managerDashboard.totals.highRisk}</strong><span>High risk</span></div>
            <div><strong>{managerDashboard.totals.delayed}</strong><span>Delayed</span></div>
            <div><strong>{managerDashboard.totals.deadlinesThisWeek}</strong><span>This week</span></div>
          </div>
          <div className="roles-page__split">
            <div className="roles-page__panel">
              <h2>Bottlenecks</h2>
              {managerDashboard.bottlenecks.map((item) => (
                <div className="roles-page__row" key={item.phase}>
                  <span>{item.phase}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
            <div className="roles-page__panel">
              <h2>Recommended Focus</h2>
              {managerDashboard.recommendedFocus && (
                <div className="roles-page__focus">
                  <strong>{managerDashboard.recommendedFocus.trackingCode}</strong>
                  <span>{managerDashboard.recommendedFocus.title}</span>
                  <p>{managerDashboard.recommendedFocus.missingFields.join(', ') || 'No missing fields'}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {!loading && activeRole === 'citizen' && (
        <section className="roles-page__panel">
          <div className="roles-page__panel-header">
            <h2>Citizen Tracking</h2>
            <span>Try EXP-001</span>
          </div>
          <form className="roles-page__search" onSubmit={handleCitizenSearch}>
            <input value={trackingCode} onChange={(event) => setTrackingCode(event.target.value)} aria-label="Tracking code" />
            <button type="submit">Track</button>
          </form>
          {citizenTracking && (
            <div className="roles-page__citizen-card">
              <strong>{citizenTracking.dossier.trackingCode}</strong>
              <h3>{citizenTracking.dossier.phase}</h3>
              <p>{citizenTracking.dossier.citizenMessage}</p>
              <p>{citizenTracking.dossier.nextStep}</p>
              <div className="roles-page__details-grid">
                <span>Institution</span>
                <strong>{citizenTracking.dossier.institution}</strong>
                <span>Status</span>
                <strong>{citizenTracking.dossier.status}</strong>
                <span>Deadline</span>
                <strong>{formatDate(citizenTracking.dossier.deadline)}</strong>
                <span>Public status</span>
                <strong>{citizenTracking.dossier.publicRiskLabel}</strong>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
