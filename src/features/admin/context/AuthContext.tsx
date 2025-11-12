import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AdminUser } from '../adminService';
import adminService, { type IAdminService } from '../adminService';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  admin: AdminUser | null;
  login: (email: string, password: string) => Promise<void>;
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

  // Pas de vérification de session au chargement
  useEffect(() => {
    setLoading(false);
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
