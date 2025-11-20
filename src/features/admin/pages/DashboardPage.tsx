import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate, useLocation } from 'react-router-dom';
import adminService from '../adminService';
import type { AdminUser } from '../adminService';

const DashboardPage = () => {
  const { admin, logout, isAuthenticated, loading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // État dérivé pour gérer l'affichage du chargement
  const showLoading = loading || !authChecked || !admin;

  useEffect(() => {
    console.log('DashboardPage - État d\'authentification:', {
      isAuthenticated,
      loading,
      hasAdmin: !!admin,
      currentPath: location.pathname
    });

    // Ne pas vérifier l'authentification si déjà vérifiée
    if (authChecked) {
      console.log('Authentification déjà vérifiée');
      return;
    }

    // Si le chargement est terminé
    if (!loading) {
      console.log('Vérification de l\'authentification terminée');

      // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
      if (!isAuthenticated) {
        console.log('Utilisateur non authentifié, redirection vers /admin/login');
        // Ne pas utiliser replace: true pour permettre le retour en arrière
        navigate('/admin/login', {
          state: { from: location.pathname }
        });
        return;
      }

      // Si l'utilisateur est authentifié mais que les données admin ne sont pas encore chargées
      if (isAuthenticated && !admin) {
        console.log('Authentifié mais données admin manquantes, tentative de récupération...');
        // Essayer de récupérer l'utilisateur actuel
        adminService.getCurrentUser()
          .then((currentUser: AdminUser | null) => {
            if (currentUser) {
              console.log('Utilisateur récupéré avec succès');
              setAuthChecked(true);
            } else {
              console.log('Impossible de récupérer les données utilisateur, déconnexion...');
              navigate('/admin/login');
            }
          })
          .catch((error: Error) => {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            navigate('/admin/login');
          });
        return;
      }

      // Tout est bon, on peut afficher le tableau de bord
      console.log('Utilisateur authentifié, affichage du tableau de bord');
      setAuthChecked(true);
    }
  }, [isAuthenticated, loading, admin, navigate, location, authChecked]);

  // Afficher le spinner de chargement pendant le chargement initial
  // ou pendant la vérification de l'authentification
  if (showLoading) {
    console.log('Affichage du spinner de chargement:', {
      loading,
      authChecked,
      hasAdmin: !!admin
    });
    return <LoadingSpinner />;
  }

  // Si on arrive ici, c'est que tout est prêt
  console.log('Rendu du composant AdminDashboard');
  return <AdminDashboard admin={admin} onLogout={(): void => logout()} />;
};


export default DashboardPage;
