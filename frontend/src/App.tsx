import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { AuthProvider } from './auth/AuthContext';
import { WorkflowStateProvider } from './state/WorkflowStateProvider';
import { RequireAccess } from './auth/RequireAccess';
import { ROUTE_PERMISSIONS } from './auth/permissions';
import { WorkflowPage } from './pages/WorkflowPage';
import { ProcedureGeneratorPage } from './pages/ProcedureGeneratorPage';
import { DocumentUploadPage } from './pages/DocumentUploadPage';
import { NlpExtractionPage } from './pages/NlpExtractionPage';
import { CaseMemoryPage } from './pages/CaseMemoryPage';
import { DelayPredictionPage } from './pages/DelayPredictionPage';
import { PreventDelayPage } from './pages/PreventDelayPage';
import { DashboardPage } from './pages/DashboardPage';
import { LegalImpactDashboardPage } from './pages/LegalImpactDashboardPage';
import { DossierDetailPage } from './pages/DossierDetailPage';
import { RolesPage } from './pages/RolesPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';

function App() {
  return (
    <AuthProvider>
      <WorkflowStateProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<WorkflowPage />} />
              <Route
                path="procedure-generator"
                element={
                  <RequireAccess permissions={ROUTE_PERMISSIONS['/procedure-generator']}>
                    <ProcedureGeneratorPage />
                  </RequireAccess>
                }
              />
              <Route
                path="document-upload"
                element={
                  <RequireAccess permissions={ROUTE_PERMISSIONS['/document-upload']}>
                    <DocumentUploadPage />
                  </RequireAccess>
                }
              />
              <Route
                path="nlp-extraction"
                element={
                  <RequireAccess permissions={ROUTE_PERMISSIONS['/nlp-extraction']}>
                    <NlpExtractionPage />
                  </RequireAccess>
                }
              />
              <Route
                path="case-memory"
                element={
                  <RequireAccess permissions={ROUTE_PERMISSIONS['/case-memory']}>
                    <CaseMemoryPage />
                  </RequireAccess>
                }
              />
              <Route
                path="delay-prediction"
                element={
                  <RequireAccess permissions={ROUTE_PERMISSIONS['/delay-prediction']}>
                    <DelayPredictionPage />
                  </RequireAccess>
                }
              />
              <Route
                path="prevent-delay"
                element={
                  <RequireAccess permissions={ROUTE_PERMISSIONS['/prevent-delay']}>
                    <PreventDelayPage />
                  </RequireAccess>
                }
              />
              <Route
                path="dashboard"
                element={
                  <RequireAccess permissions={ROUTE_PERMISSIONS['/dashboard']}>
                    <DashboardPage />
                  </RequireAccess>
                }
              />
              <Route
                path="legal-impact"
                element={
                  <RequireAccess permissions={ROUTE_PERMISSIONS['/legal-impact']}>
                    <LegalImpactDashboardPage />
                  </RequireAccess>
                }
              />
              <Route
                path="roles"
                element={
                  <RequireAccess permissions={ROUTE_PERMISSIONS['/roles']}>
                    <RolesPage />
                  </RequireAccess>
                }
              />
              <Route
                path="dossiers/:id"
                element={
                  <RequireAccess permissions={ROUTE_PERMISSIONS['/dossiers/:id']}>
                    <DossierDetailPage />
                  </RequireAccess>
                }
              />
              <Route path="access-denied" element={<AccessDeniedPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </WorkflowStateProvider>
    </AuthProvider>
  );
}

export default App;
