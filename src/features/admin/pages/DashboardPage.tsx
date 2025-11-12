import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const { admin, logout } = useAuth();

  if (!admin) {
    return <LoadingSpinner />;
  }

  return <AdminDashboard admin={admin} onLogout={logout} />;
};

export default DashboardPage;
