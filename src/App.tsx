import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import DashboardIntervenant from './pages/DashboardIntervenant/DashboardIntervenant';
import SupportPage from './pages/Support/SupportPage';
import SiteVitrine from './pages/VitrinePublique/siteVitrine';
import LoginIntervenant from './pages/Login/LoginIntervenant';
import LoginPage from './features/admin/pages/LoginPage';
import AdminDashboard from './features/admin/pages/DashboardPage';
import AdminRegisterPage from './features/admin/pages/AdminRegisterPage';
import PaiementsPage from './features/admin/pages/PaiementsPage';
import { AuthProvider, useAuth } from './features/admin/context/AuthContext';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

// Composant pour les routes protégées
const AdminRoutes = () => {
  // Protected and auth routes defined under Admin provider
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div>Chargement...</div>;
    if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
    return children;
  };

  const AuthRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div>Chargement...</div>;
    if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;
    return children;
  };

  return (
    <AuthProvider>
      <Routes>
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route
          path="/admin/login"
          element={
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          }
        />
        <Route
          path="/admin/register"
          element={
            <AuthRoute>
              <AdminRegisterPage />
            </AuthRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/paiements"
          element={
            <ProtectedRoute>
              <PaiementsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
};

function App() {
  return (
    <PrimeReactProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<SiteVitrine />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login-intervenant" element={<LoginIntervenant />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard-intervenant" element={<DashboardIntervenant />} />
          <Route path="/support" element={<SupportPage />} />

          {/* Routes d'administration, avec provider dédié */}
          {/* On délègue à AdminRoutes pour éviter de monter le provider ailleurs */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* Redirection pour les routes inconnues */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </PrimeReactProvider>
  );
}

export default App;