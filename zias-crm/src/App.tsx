//App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
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
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      {/* AuthProvider wraps EVERYTHING */}
      <AuthProvider>
        <Routes>
          {/* Login is INSIDE AuthProvider, but NOT inside ProtectedRoute */}
          <Route path="/login" element={<Login />} />
          
          {/* These routes are protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<AppLayout />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;