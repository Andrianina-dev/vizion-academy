import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import adminService from '../adminService';
import type { AdminUser, AdminCredentials } from '../adminService';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = useCallback(async () => {
    // Vérifier d'abord si un token existe dans le localStorage
    const token = localStorage.getItem('admin_token');
    
    // Si pas de token, on considère que l'utilisateur n'est pas connecté
    if (!token) {
      setUser(null);
      setLoading(false);
      
      // Rediriger vers la page de connexion si on est sur une page protégée
      if (location.pathname.startsWith('/admin/') && 
          !['/admin', '/admin/login', '/admin/register'].includes(location.pathname)) {
        navigate('/admin/login', { replace: true });
      }
      return false;
    }

    try {
      const userData = await adminService.getCurrentUser();
      setUser(userData);
      
      // Rediriger vers le tableau de bord si on est sur la page de connexion
      if (['/admin', '/admin/login'].includes(location.pathname)) {
        navigate('/admin/dashboard', { replace: true });
      }
      return true;
    } catch (error) {
      // En cas d'erreur, on supprime le token et on redirige
      localStorage.removeItem('admin_token');
      setUser(null);
      
      // Rediriger vers la page de connexion si on est sur une page protégée
      if (location.pathname.startsWith('/admin/') && 
          !['/admin', '/admin/login', '/admin/register'].includes(location.pathname)) {
        navigate('/admin/login', { replace: true });
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const credentials: AdminCredentials = { email, password };
      const { admin, token } = await adminService.login(credentials);
      
      // Stocker le token dans le localStorage
      if (token) {
        localStorage.setItem('admin_token', token);
      }
      
      setUser(admin);
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      console.error('Échec de la connexion:', error);
      // Nettoyer le token en cas d'échec
      localStorage.removeItem('admin_token');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await adminService.logout();
      // Nettoyer le token lors de la déconnexion
      localStorage.removeItem('admin_token');
      setUser(null);
      navigate('/admin/login', { replace: true });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Nettoyer quand même le token en cas d'erreur
      localStorage.removeItem('admin_token');
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
