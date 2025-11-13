import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AdminUser } from '../adminService';
import adminService from '../adminService';

interface AuthContextType {
  isAuthenticated: boolean;
  admin: AdminUser | null;
  login: (email: string, password: string) => Promise<AdminUser>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérification de la session au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await adminService.getCurrentUser();
        const currentPath = window.location.pathname;

        if (currentUser) {
          setAdmin(currentUser);

          // Si on est sur la page de login, rediriger vers le tableau de bord
          if (currentPath === '/admin/login') {
            const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/admin';
            sessionStorage.removeItem('redirectAfterLogin');
            window.location.href = redirectPath;
          }
        } else {
          // Si pas d'utilisateur connecté et pas sur la page de login
          if (!currentPath.includes('login')) {
            // Ne pas rediriger si on est sur la racine ou une route non-admin
            if (currentPath === '/' || !currentPath.startsWith('/admin/')) {
              return;
            }
            sessionStorage.setItem('redirectAfterLogin', currentPath);
            window.location.href = '/admin/login';
          }
        }
      } catch (error) {
        console.error('Erreur de vérification de session:', error);
        const currentPath = window.location.pathname;
        // En cas d'erreur, ne rediriger que si nécessaire
        if (!currentPath.includes('login') && currentPath.startsWith('/admin/')) {
          sessionStorage.setItem('redirectAfterLogin', currentPath);
          window.location.href = '/admin/login';
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AdminUser> => {
    setLoading(true);
    setError(null);

    try {
      const result = await adminService.login({ email, password });
      if (!result || !result.admin) {
        throw new Error('Aucune donnée admin reçue');
      }
      setAdmin(result.admin);

      // Rediriger vers la page précédente ou le tableau de bord
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/admin';
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectPath;
      }

      return result.admin;
    } catch (error) {
      console.error('Échec de la connexion:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Une erreur est survenue lors de la connexion';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await adminService.logout();
      setAdmin(null);
      setError(null);
      // Redirection vers la page de connexion après déconnexion
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Même en cas d'erreur, on déconnecte l'utilisateur côté frontend
      setAdmin(null);
      setError('Une erreur est survenue lors de la déconnexion');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated: !!admin,
    admin,
    login,
    logout,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
