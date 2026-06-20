import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { WorkflowPage } from './pages/WorkflowPage';
import { ProcedureGeneratorPage } from './pages/ProcedureGeneratorPage';
import { DocumentUploadPage } from './pages/DocumentUploadPage';
import { NlpExtractionPage } from './pages/NlpExtractionPage';
import { CaseMemoryPage } from './pages/CaseMemoryPage';
import { DelayPredictionPage } from './pages/DelayPredictionPage';
import { PreventDelayPage } from './pages/PreventDelayPage';
import { DashboardPage } from './pages/DashboardPage';
import { DossierDetailPage } from './pages/DossierDetailPage';
import { RolesPage } from './pages/RolesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<WorkflowPage />} />
          <Route path="procedure-generator" element={<ProcedureGeneratorPage />} />
          <Route path="document-upload" element={<DocumentUploadPage />} />
          <Route path="nlp-extraction" element={<NlpExtractionPage />} />
          <Route path="case-memory" element={<CaseMemoryPage />} />
          <Route path="delay-prediction" element={<DelayPredictionPage />} />
          <Route path="prevent-delay" element={<PreventDelayPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="dossiers/:id" element={<DossierDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
