import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { GlobalShortcuts } from './components/Common/GlobalShortcuts';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { LeadDetail } from './pages/LeadDetail';
import { Pipeline } from './pages/Pipeline';
import { Settings } from './pages/Settings';
import { Sidebar } from './components/Dashboard/Sidebar';
import { Header } from './components/Dashboard/Header';

const AppLayout = () => (
  <div className="app-container">
    <Sidebar />
    <div className="main-content">
      <Header />
      <div className="page-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/:id" element={<LeadDetail />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
    <GlobalShortcuts />
  </div>
);

const App = () => (
  <BrowserRouter>
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/*" element={<AppLayout />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  </BrowserRouter>
);

export default App;