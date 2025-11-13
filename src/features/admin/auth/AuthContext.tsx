import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import adminService from '../adminService';
import type { AdminUser } from '../adminService';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AdminUser>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      const userData = await adminService.getCurrentUser();
      
      if (userData) {
        setUser(userData);
        return true;
      }
      
      // Si pas d'utilisateur connecté
      setUser(null);
      return false;
      
    } catch (error) {
      console.error('Erreur de vérification de session:', error);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate, location.pathname]);

  // Effet pour gérer la vérification d'authentification
  useEffect(() => {
    // Liste des chemins qui ne nécessitent pas d'authentification
    const publicPaths = ['/admin/login', '/admin/register', '/admin/forgot-password'];
    
    // Ne rien faire si on est sur une page publique
    if (publicPaths.includes(location.pathname)) {
      // Si l'utilisateur est déjà connecté et accède à une page publique,
      // on le redirige vers le tableau de bord
      if (user) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        setLoading(false);
      }
      return;
    }
    
    // Si on n'est pas sur une route admin, ne rien faire
    if (!location.pathname.startsWith('/admin')) {
      setLoading(false);
      return;
    }
    
    // Vérifier l'authentification uniquement si on n'a pas d'utilisateur
    // et qu'on est sur une route protégée
    if (!user) {
      const verifyAuth = async () => {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated && !publicPaths.includes(location.pathname)) {
          navigate('/admin/login', { 
            replace: true,
            state: { from: location.pathname }
          });
        }
      };
      
      verifyAuth();
    }
  }, [checkAuth, location.pathname, user]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Tentative de connexion avec:', email);
      
      // Réinitialiser l'état d'authentification
      setUser(null);
      
      // Appel au service de connexion
      console.log('Appel à adminService.login avec email:', email);
      const result = await adminService.login({ email, password });
      console.log('Réponse du service de connexion:', result);
      
      if (!result || !result.admin) {
        console.error('Aucune donnée utilisateur reçue dans la réponse');
        throw new Error('Aucune donnée utilisateur reçue');
      }
      
      // Mettre à jour l'état utilisateur
      setUser(result.admin);
      console.log('Utilisateur connecté avec succès:', result.admin.email);
      
      // Forcer une vérification d'authentification complète
      console.log('Vérification de l\'authentification...');
      await checkAuth();
      
      console.log('Connexion réussie, retour de l\'utilisateur connecté');
      return result.admin;
      
    } catch (error: any) {
      console.error('Échec de la connexion:', error);
      
      // Réinitialiser l'état utilisateur en cas d'erreur
      setUser(null);
      
      // Gestion des erreurs spécifiques
      let errorMessage = 'Échec de la connexion';
      if (error.response) {
        // Erreur du serveur (4xx, 5xx)
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        // Pas de réponse du serveur
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
      } else if (error.message) {
        // Erreur personnalisée
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      console.log('Déconnexion en cours...');
      
      // Appeler le service de déconnexion
      await adminService.logout();
      console.log('Déconnexion réussie côté serveur');
      
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // On continue même en cas d'erreur pour s'assurer que l'utilisateur est bien déconnecté côté client
    } finally {
      // Réinitialiser l'état utilisateur
      setUser(null);
      
      // Nettoyer le stockage local si nécessaire
      localStorage.removeItem('is_authenticated');
      
      // Rediriger vers la page de connexion avec un message
      console.log('Redirection vers la page de connexion');
      navigate('/admin/login', { 
        replace: true,
        state: { 
          message: 'Vous avez été déconnecté avec succès.',
          from: location.pathname // Conserver la page actuelle pour une éventuelle reconnexion
        }
      });
      
      // Forcer un rechargement de la page pour s'assurer que tout est bien réinitialisé
      // Cela peut aider à éviter des problèmes d'état résiduel
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
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
