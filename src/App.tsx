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
import { AuthProvider, useAuth } from './features/admin/auth/AuthContext';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

// Composant pour les routes protégées
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>; // Ou un composant de chargement
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// Composant pour les routes d'authentification (login/register)
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>; // Ou un composant de chargement
  }

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <PrimeReactProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<SiteVitrine />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login-intervenant" element={<LoginIntervenant />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard-intervenant" element={<DashboardIntervenant />} />
            <Route path="/support" element={<SupportPage />} />
            
            {/* Routes d'administration */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            
            <Route path="/admin/login" element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            } />
            
            <Route path="/admin/register" element={
              <AuthRoute>
                <AdminRegisterPage />
              </AuthRoute>
            } />
            
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Redirection pour les routes inconnues */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </PrimeReactProvider>
  );
}

export default App;