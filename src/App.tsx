import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import DashboardIntervenant from './pages/DashboardIntervenant/DashboardIntervenant';
import SupportPage from './pages/Support/SupportPage';
import SiteVitrine from './pages/VitrinePublique/siteVitrine'; // Importez le SiteVitrine
import LoginIntervenant from './pages/Login/LoginIntervenant';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

function App() {
  return (
    <PrimeReactProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SiteVitrine />} />        {/* Site vitrine en premier */}
          <Route path="/login" element={<Login />} />         {/* Page login déplacée */}
          <Route path="/login-intervenant" element={<LoginIntervenant />} /> {/* Login Intervenant */}
          <Route path="/dashboard" element={<Dashboard />} /> {/* Dashboard */}
          <Route path="/dashboard-intervenant" element={<DashboardIntervenant />} />
          <Route path="/support" element={<SupportPage />} /> {/* Page de support */}
        </Routes>
      </BrowserRouter>
    </PrimeReactProvider> 
  );
}

export default App;