import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

function App() {
  return (
    <PrimeReactProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />               {/* Page login */}
          <Route path="/dashboard" element={<Dashboard />} /> {/* Dashboard */}
        </Routes>
      </BrowserRouter>
    </PrimeReactProvider> 
  );
}

export default App;
