import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Valider le token en arrière-plan
  const validateTokenInBackground = async () => {
    try {
      await adminService.getCurrentUser();
    } catch (error) {
      console.error('Erreur lors de la validation du token:', error);
      // En cas d'erreur, on nettoie l'état d'authentification
      setAdmin(null);
      setIsAuthenticated(false);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      
      // Si l'utilisateur est sur une page protégée, on le redirige vers la page de connexion
      const currentPath = location.pathname;
      if (currentPath.startsWith('/admin/') && 
          !currentPath.includes('login') && 
          !currentPath.includes('register')) {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        navigate('/admin/login', { replace: true });
      }
    }
  };

  // Vérification de la session au chargement
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      const currentPath = location.pathname;
      console.log('Vérification de l\'authentification...', { path: currentPath });
      
      try {
        setLoading(true);
        
        // Ne pas vérifier l'authentification si on est déjà sur la page de login ou register
        if (currentPath === '/admin/login' || currentPath === '/admin/register') {
          // Si l'utilisateur est déjà authentifié, rediriger vers le dashboard
          const token = localStorage.getItem('adminToken');
          const cachedAdmin = localStorage.getItem('adminData');
          if (token && cachedAdmin) {
            try {
              const adminData = JSON.parse(cachedAdmin);
              setAdmin(adminData);
              setIsAuthenticated(true);
              navigate('/admin/dashboard', { replace: true });
            } catch (e) {
              console.error('Erreur lors du parsing des données en cache', e);
              localStorage.removeItem('adminData');
            }
          }
          setLoading(false);
          return;
        }

        // Vérifier d'abord le cache local avant de faire un appel réseau
        const cachedAdmin = localStorage.getItem('adminData');
        if (cachedAdmin) {
          try {
            const adminData = JSON.parse(cachedAdmin);
            setAdmin(adminData);
            setIsAuthenticated(true);
            console.log('Utilisation des données utilisateur en cache');
            
            // Si on est sur la racine admin, rediriger vers le tableau de bord
            if (currentPath === '/admin' || currentPath === '/admin/') {
              const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/admin/dashboard';
              sessionStorage.removeItem('redirectAfterLogin');
              navigate(redirectPath, { replace: true });
            }
            
            // Valider le token avec le serveur en arrière-plan
            validateTokenInBackground();
            return;
          } catch (e) {
            console.error('Erreur lors du parsing des données en cache', e);
            localStorage.removeItem('adminData');
          }
        }

        // Vérifier l'utilisateur actuel
        const currentUser = await adminService.getCurrentUser();
        if (!isMounted) return;

        console.log('Utilisateur actuel:', currentUser);
        
        if (currentUser) {
          console.log('Utilisateur connecté détecté');
          setAdmin(currentUser);
          setIsAuthenticated(true);

          // Si on est sur la racine admin, rediriger vers le tableau de bord
          if (currentPath === '/admin' || currentPath === '/admin/') {
            const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/admin/dashboard';
            console.log('Redirection vers:', redirectPath);
            sessionStorage.removeItem('redirectAfterLogin');
            navigate(redirectPath, { replace: true });
          }
        } else {
          console.log('Aucun utilisateur connecté');
          setIsAuthenticated(false);
          
          // Rediriger vers la page de login si on est sur une page protégée
          if (currentPath.startsWith('/admin/')) {
            console.log('Redirection vers /admin/login');
            sessionStorage.setItem('redirectAfterLogin', currentPath);
            navigate('/admin/login', { replace: true });
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        if (!isMounted) return;
        
        // En cas d'erreur, on considère que l'utilisateur n'est pas authentifié
        setIsAuthenticated(false);
        setAdmin(null);
        
        const currentPath = location.pathname;
        if (currentPath.startsWith('/admin/') && !currentPath.includes('login') && !currentPath.includes('register')) {
          console.log('Erreur d\'authentification, redirection vers /admin/login');
          sessionStorage.setItem('redirectAfterLogin', currentPath);
          navigate('/admin/login', { replace: true });
        }
      } finally {
        if (isMounted) {
          console.log('Fin de la vérification d\'authentification');
          setLoading(false);
        }
      }
    };

    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [location.pathname, navigate]);

  const login = async (email: string, password: string): Promise<AdminUser> => {
    try {
      setLoading(true);
      setError(null);
      const { admin } = await adminService.login({ email, password });
      
      // Stocker le token en local storage pour la persistance
      localStorage.setItem('adminToken', 'logged-in');
      
      setAdmin(admin);
      setIsAuthenticated(true);
      
      // Rediriger vers la page demandée ou le tableau de bord par défaut
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/admin/dashboard';
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath, { replace: true });
      
      return admin;
    } catch (error: any) {
      // En cas d'erreur, supprimer le token
      localStorage.removeItem('adminToken');
      setError(error.message || 'Erreur lors de la connexion');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await adminService.logout();
    } finally {
      // Supprimer le token de connexion
      localStorage.removeItem('adminToken');
      
      // Réinitialiser l'état d'authentification
      setAdmin(null);
      setIsAuthenticated(false);
      
      // Rediriger vers la page de connexion
      navigate('/admin/login', { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      admin,
      login,
      logout,
      loading,
      error,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
