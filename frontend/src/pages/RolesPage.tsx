import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { Link } from 'react-router-dom';
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
import { formatAlbanianDate } from '../utils/date';
import { BOTTLENECK_LABELS } from '../utils/phase';
import { usePermissions } from '../auth/usePermissions';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { StaffRoleSection } from '../components/StaffRoleSection';
import { RoleCapabilityCard } from '../components/RoleCapabilityCard';
import { CitizenTrackingTimeline } from '../components/CitizenTrackingTimeline';
import './RolesPage.css';

type RoleTab = 'staff' | 'manager' | 'citizen';

const ROLE_META: Record<RoleTab, { label: string; icon: string; tagline: string }> = {
  staff: { label: 'Staff', icon: '🧑‍💼', tagline: 'Operational queue, extraction tools, and case support.' },
  manager: { label: 'Manager', icon: '📊', tagline: 'Oversight, bottlenecks, and escalation decisions.' },
  citizen: { label: 'Citizen', icon: '🧾', tagline: 'Plain-language application status and next steps.' },
};

// This page bundles three demo views behind one route — gate which tab a
// role can open instead of splitting it into three routes (that would
// change existing structure beyond access control).
const TAB_PERMISSION: Record<RoleTab, 'view-staff-tools' | 'view-manager-reports' | 'track-dossier'> = {
  staff: 'view-staff-tools',
  manager: 'view-manager-reports',
  citizen: 'track-dossier',
};

function citizenTrackingErrorMessage(err: unknown): string {
  if (err instanceof ApiError && err.status === 404) {
    return 'No dossier found for that tracking code. Double-check the code and try again.';
  }
  return err instanceof Error ? err.message : 'Could not find tracking code.';
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'not set';
  return formatAlbanianDate(value);
}

// The citizen tracking API folds missing-document detail into a plain-
// language sentence rather than a raw field list (see presentCitizenDossier
// on the backend) — parse that sentence back into a list for display
// instead of asking the backend to change its contract.
function parseMissingDocuments(citizenMessage: string): string[] {
  const prefix = 'Action needed: please provide ';
  if (!citizenMessage.startsWith(prefix)) return [];
  return citizenMessage
    .slice(prefix.length)
    .replace(/\.$/, '')
    .split(', ')
    .filter(Boolean)
    .map(humanizeFieldName);
}

// Some missing-field entries are raw camelCase keys (e.g. "applicantName")
// rather than document names — present them in plain language instead of
// showing a technical field key to a citizen.
function humanizeFieldName(value: string): string {
  if (!/^[a-z]+[A-Z]/.test(value)) return value;
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}

function entranceDelay(index: number): CSSProperties {
  return { '--entrance-delay': `${index * 60}ms` } as CSSProperties;
}

export function RolesPage() {
  const { can } = usePermissions();
  const availableTabs = useMemo(
    () => (['staff', 'manager', 'citizen'] as RoleTab[]).filter((tab) => can(TAB_PERMISSION[tab])),
    [can],
  );
  const [activeRole, setActiveRole] = useState<RoleTab>(() => availableTabs[0] ?? 'citizen');
  const [staffDossiers, setStaffDossiers] = useState<StaffDossier[]>([]);
  const [selectedDossierId, setSelectedDossierId] = useState<number | null>(null);
  const [workbench, setWorkbench] = useState<StaffWorkbench | null>(null);
  const [managerDashboard, setManagerDashboard] = useState<ManagerDashboard | null>(null);
  const [trackingCode, setTrackingCode] = useState('EXP-001');
  const [accessCode, setAccessCode] = useState('TR10244');
  const [citizenTracking, setCitizenTracking] = useState<CitizenTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { stats: dashboardStats } = useDashboardStats();

  const selectedDossier = useMemo(
    () => staffDossiers.find((dossier) => dossier.id === selectedDossierId) ?? staffDossiers[0],
    [selectedDossierId, staffDossiers],
  );

  // If the role switches mid-view and the current tab is no longer
  // available, fall back to the first tab the new role can see instead of
  // rendering an unauthorized one — derived, not stored, so switching the
  // tab itself still works normally via setActiveRole.
  const safeActiveRole = availableTabs.includes(activeRole) ? activeRole : availableTabs[0] ?? 'citizen';

  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      setLoading(true);
      setError(null);
      try {
        const [dossiers, manager] = await Promise.all([getStaffDossiers(), getManagerDashboard()]);

        if (!mounted) return;
        setStaffDossiers(dossiers);
        setSelectedDossierId(dossiers[0]?.id ?? null);
        setManagerDashboard(manager);
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
      setCitizenTracking(await getCitizenTracking(trackingCode.trim(), accessCode.trim()));
    } catch (err) {
      setCitizenTracking(null);
      setError(citizenTrackingErrorMessage(err));
    }
  }

  // Escalations are derived on the frontend, not a backend field: any
  // high-risk dossier within two days of its deadline (or already past it)
  // needs a manager to step in, not just monitoring.
  const escalations = useMemo(
    () =>
      (managerDashboard?.highRiskDossiers ?? []).filter(
        (dossier) => dossier.daysUntilDeadline != null && dossier.daysUntilDeadline <= 2,
      ),
    [managerDashboard],
  );

  return (
    <div className="roles-page">
      <header className="roles-page__header">
        <div className="roles-page__heading">
          <span className="roles-page__eyebrow">Role-Based Experience</span>
          <h1>Role Views</h1>
          <p>See exactly what a Citizen, Staff member, and Manager each experience in this app.</p>
        </div>
        <div className="roles-page__tabs" aria-label="Role views">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              className={safeActiveRole === tab ? 'roles-page__tab roles-page__tab--active' : 'roles-page__tab'}
              onClick={() => setActiveRole(tab)}
              type="button"
            >
              <span aria-hidden="true">{ROLE_META[tab].icon}</span>
              {ROLE_META[tab].label}
            </button>
          ))}
        </div>
      </header>

      <p className="roles-page__tagline">{ROLE_META[safeActiveRole].tagline}</p>

      {loading && <p className="roles-page__status">Loading role data...</p>}
      {error && <p className="roles-page__status roles-page__status--error">{error}</p>}

      {!loading && safeActiveRole === 'staff' && (
        <StaffRoleSection
          dossiers={staffDossiers}
          selectedDossier={selectedDossier}
          onSelectDossier={setSelectedDossierId}
          workbench={workbench}
        />
      )}

      {!loading && safeActiveRole === 'manager' && managerDashboard && (
        <section className="roles-page__manager">
          <div className="roles-page__manager-links">
            <RoleCapabilityCard
              icon="📊"
              title="Dashboard Overview"
              description="Real-time totals, bottlenecks, and risk across all dossiers."
              to="/dashboard"
              linkLabel="Open Dashboard →"
            />
            <RoleCapabilityCard
              icon="🗂"
              title="Case Memory"
              description="Compare a dossier against similar historical cases and outcomes."
              to="/case-memory"
              linkLabel="Open Case Memory →"
            />
            <RoleCapabilityCard
              icon="🛡"
              title="Delay Prevention"
              description="Review staff recommendations and prevention plans before they go out."
              to="/prevent-delay"
              linkLabel="Open Delay Prevention →"
            />
            <RoleCapabilityCard
              icon="⚖"
              title="Legal Impact Dashboard"
              description="See how a legal change propagates through the workflow and how many dossiers need review."
              to="/legal-impact"
              linkLabel="Open Legal Impact →"
            />
          </div>

          <div className="roles-page__section" style={entranceDelay(1)}>
            <h2 className="roles-page__section-title">Performance Overview</h2>
            <div className="roles-page__metrics">
              <div>
                <strong>{managerDashboard.totals.dossiers}</strong>
                <span>Total Dossiers</span>
              </div>
              <div>
                <strong>{managerDashboard.totals.highRisk}</strong>
                <span>High Risk Dossiers</span>
              </div>
              <div>
                <strong>{managerDashboard.totals.delayed}</strong>
                <span>Delayed Dossiers</span>
              </div>
              <div>
                <strong>{managerDashboard.totals.deadlinesThisWeek}</strong>
                <span>Deadlines This Week</span>
              </div>
            </div>
          </div>

          <div className="roles-page__section" style={entranceDelay(2)}>
            <h2 className="roles-page__section-title">Bottleneck Monitoring</h2>
            <div className="roles-page__panel">
              <div className="roles-page__bottleneck-list">
                {Object.entries(BOTTLENECK_LABELS).map(([phase, label]) => {
                  const count = dashboardStats?.byPhase[phase] ?? 0;
                  const total = dashboardStats?.totalDossiers ?? 0;
                  return (
                    <div className="roles-page__bottleneck-row" key={phase}>
                      <span className="roles-page__bottleneck-label">{label}</span>
                      <div className="roles-page__bottleneck-track">
                        <div
                          className="roles-page__bottleneck-fill"
                          style={{ width: total ? `${(count / total) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="roles-page__bottleneck-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="roles-page__section" style={entranceDelay(3)}>
            <h2 className="roles-page__section-title">
              Escalations
              {escalations.length > 0 && <span className="roles-page__section-badge">{escalations.length}</span>}
            </h2>
            <div className="roles-page__panel roles-page__panel--escalation">
              {escalations.length === 0 && <p>No dossier currently needs escalation — all deadlines have headroom.</p>}
              <div className="roles-page__list">
                {escalations.map((dossier) => (
                  <Link to={`/dossiers/${dossier.id}`} className="roles-page__row roles-page__row--escalation" key={dossier.id}>
                    <span>
                      <strong>{dossier.trackingCode}</strong> {dossier.title}
                    </span>
                    <span className="roles-page__escalation-flag">
                      {dossier.daysUntilDeadline != null && dossier.daysUntilDeadline < 0
                        ? `${Math.abs(dossier.daysUntilDeadline)}d overdue`
                        : `${dossier.daysUntilDeadline}d left`}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="roles-page__section" style={entranceDelay(4)}>
            <h2 className="roles-page__section-title">Risk Monitoring</h2>
            <div className="roles-page__panel">
              <p className="roles-page__panel-label">Highest-Risk Dossiers</p>
              <div className="roles-page__list">
                {managerDashboard.highRiskDossiers.slice(0, 6).map((dossier) => (
                  <Link to={`/dossiers/${dossier.id}`} className="roles-page__row" key={dossier.id}>
                    <span>
                      <strong>{dossier.trackingCode}</strong> {dossier.title}
                    </span>
                    <span>
                      {dossier.daysUntilDeadline != null ? `${dossier.daysUntilDeadline}d to deadline` : 'no deadline'}
                    </span>
                  </Link>
                ))}
                {managerDashboard.highRiskDossiers.length === 0 && <p>No high-risk dossiers right now.</p>}
              </div>

              {dashboardStats && (
                <>
                  <p className="roles-page__panel-label">Workload Distribution</p>
                  <div className="roles-page__workload-track">
                    <div
                      className="roles-page__workload-segment roles-page__workload-segment--low"
                      style={{
                        width: `${dashboardStats.totalDossiers ? (dashboardStats.byRisk.low / dashboardStats.totalDossiers) * 100 : 0}%`,
                      }}
                    />
                    <div
                      className="roles-page__workload-segment roles-page__workload-segment--medium"
                      style={{
                        width: `${dashboardStats.totalDossiers ? (dashboardStats.byRisk.medium / dashboardStats.totalDossiers) * 100 : 0}%`,
                      }}
                    />
                    <div
                      className="roles-page__workload-segment roles-page__workload-segment--high"
                      style={{
                        width: `${dashboardStats.totalDossiers ? (dashboardStats.byRisk.high / dashboardStats.totalDossiers) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="roles-page__workload-legend">
                    <span>Low {dashboardStats.byRisk.low}</span>
                    <span>Medium {dashboardStats.byRisk.medium}</span>
                    <span>High {dashboardStats.byRisk.high}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="roles-page__section" style={entranceDelay(5)}>
            <h2 className="roles-page__section-title">Recommended Focus</h2>
            <div className="roles-page__panel">
              {managerDashboard.recommendedFocus ? (
                <div className="roles-page__focus">
                  <strong>{managerDashboard.recommendedFocus.trackingCode}</strong>
                  <span>{managerDashboard.recommendedFocus.title}</span>
                  <p>{managerDashboard.recommendedFocus.missingFields.join(', ') || 'No missing fields'}</p>
                  <Link to={`/dossiers/${managerDashboard.recommendedFocus.id}`} className="roles-page__focus-link">
                    Review dossier →
                  </Link>
                </div>
              ) : (
                <p>No dossier currently needs urgent focus.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {!loading && safeActiveRole === 'citizen' && (
        <section className="roles-page__citizen">
          <div className="roles-page__panel">
            <div className="roles-page__panel-header">
              <h2>My Application</h2>
              <span>Try EXP-001 / TR10244</span>
            </div>
            <form className="roles-page__search" onSubmit={handleCitizenSearch}>
              <input
                value={trackingCode}
                onChange={(event) => setTrackingCode(event.target.value)}
                aria-label="Tracking code"
                placeholder="Tracking code"
              />
              <input
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value)}
                aria-label="Access code"
                placeholder="Access code"
              />
              <button type="submit">Track</button>
            </form>
          </div>

          {citizenTracking && (
            <>
              <div className="roles-page__citizen-summary">
                <div className="roles-page__citizen-summary-card" style={entranceDelay(0)}>
                  <span className="roles-page__label">Application</span>
                  <strong>{citizenTracking.dossier.trackingCode}</strong>
                  <span className="roles-page__citizen-summary-sub">{citizenTracking.dossier.title}</span>
                </div>
                <div className="roles-page__citizen-summary-card" style={entranceDelay(1)}>
                  <span className="roles-page__label">Currently With</span>
                  <strong>{citizenTracking.dossier.institution}</strong>
                  <span className="roles-page__citizen-summary-sub">Deadline {formatDate(citizenTracking.dossier.deadline)}</span>
                </div>
                <div className="roles-page__citizen-summary-card" style={entranceDelay(2)}>
                  <span className="roles-page__label">Next Step</span>
                  <strong>{citizenTracking.dossier.nextStep}</strong>
                </div>
              </div>

              <div className="roles-page__panel roles-page__panel--timeline" style={entranceDelay(1)}>
                <div className="roles-page__panel-header">
                  <h3>Application Progress</h3>
                </div>
                <CitizenTrackingTimeline
                  phase={citizenTracking.dossier.phase}
                  status={citizenTracking.dossier.status}
                />
              </div>

              <div className="roles-page__citizen-grid">
                <div className="roles-page__panel" style={entranceDelay(2)}>
                  <p className="roles-page__label">Alerts</p>
                  <p>
                    {citizenTracking.dossier.publicRiskLabel === 'may be delayed'
                      ? 'Your application has an active risk alert — see Prevention Guidance below.'
                      : 'No active alerts for your application right now.'}
                  </p>
                </div>

                <div className="roles-page__panel" style={entranceDelay(3)}>
                  <p className="roles-page__label">Delay Prediction</p>
                  <p>
                    Your application is currently <strong>{citizenTracking.dossier.publicRiskLabel}</strong>.
                  </p>
                  <Link to="/delay-prediction" className="roles-page__citizen-link">
                    View detailed delay prediction →
                  </Link>
                </div>

                <div className="roles-page__panel" style={entranceDelay(4)}>
                  <p className="roles-page__label">Prevention Guidance</p>
                  {(() => {
                    const missingDocs = parseMissingDocuments(citizenTracking.dossier.citizenMessage);
                    return missingDocs.length > 0 ? (
                      <ul className="roles-page__citizen-list">
                        {missingDocs.map((doc) => (
                          <li key={doc}>{doc}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No documents are missing.</p>
                    );
                  })()}
                  <Link to="/prevent-delay" className="roles-page__citizen-link">
                    Get prevention guidance →
                  </Link>
                </div>
              </div>
            </>
          )}

          <RoleCapabilityCard
            icon="📤"
            title="Upload Documents"
            description="Attach supporting documents to your application."
            to="/document-upload"
            linkLabel="Upload Documents →"
          />
        </section>
      )}
    </div>
  );
}
