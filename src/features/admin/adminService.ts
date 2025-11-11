import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

// Configuration de base d'Axios pour les requêtes API
const adminApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? 
    `${import.meta.env.VITE_API_URL}/api` : 
    'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Configuration pour permettre l'envoi des cookies cross-origin
axios.defaults.withCredentials = true;

// Intercepteur pour ajouter le token d'authentification aux requêtes
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
adminApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Supprimer le token invalide
      localStorage.removeItem('admin_token');
      
      // Rediriger vers la page de connexion si on n'y est pas déjà
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface AdminCredentials {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  nom_admin: string;
  email: string;
  role: string;
}

export interface RegisterAdminData {
  nom_admin: string;
  email: string;
  password: string;
  password_confirmation: string;
  is_admin?: boolean;
}

class AdminService {
  private api: AxiosInstance;

  constructor() {
    this.api = adminApi;
  }

  async registerAdmin(adminData: RegisterAdminData): Promise<{ message: string }> {
    try {
      console.log('Envoi des données d\'inscription:', {
        nom_admin: adminData.nom_admin,
        email: adminData.email,
        password: '[PROTECTED]',
        password_confirmation: '[PROTECTED]'
      });

      const response = await this.api.post('/admin/register', {
        nom_admin: adminData.nom_admin,
        email: adminData.email,
        password: adminData.password,
        password_confirmation: adminData.password_confirmation
      });
      
      console.log('Réponse du serveur:', response.data);
      
      if (response.data.success) {
        return { message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        // Gestion des erreurs de validation 422
        if (error.response.status === 422 && error.response.data.errors) {
          const errors = Object.values(error.response.data.errors).flat().join('\n');
          throw new Error(errors);
        }
        // Autres erreurs
        const errorMessage = error.response.data?.message || 'Erreur lors de l\'inscription';
        throw new Error(errorMessage);
      }
      
      throw error instanceof Error ? error : new Error('Erreur de connexion au serveur');
    }
  }

  async login(credentials: AdminCredentials): Promise<{ admin: AdminUser; token: string }> {
    try {
      console.log('Tentative de connexion avec les identifiants:', credentials.email);
      
      const response = await this.api.post<{
        success: boolean;
        admin: AdminUser;
        token: string;
        message: string;
        authenticated: boolean;
      }>('/admin/login', {
        email: credentials.email,
        password: credentials.password
      }, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      console.log('Réponse du serveur:', response.data);
      
      if (!response.data.success || !response.data.authenticated) {
        console.error('Échec de l\'authentification:', response.data.message);
        throw new Error(response.data.message || 'Échec de la connexion');
      }
      
      if (!response.data.token) {
        console.error('Aucun token reçu dans la réponse');
        throw new Error('Erreur d\'authentification: aucun token reçu');
      }
      
      // Stocker le token dans le localStorage
      localStorage.setItem('admin_token', response.data.token);
      
      // Configurer l'en-tête d'autorisation pour les requêtes futures
      this.api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      console.log('Connexion réussie, token stocké');
      
      return {
        admin: response.data.admin,
        token: response.data.token
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Identifiants invalides';
        throw new Error(errorMessage);
      }
      throw error instanceof Error ? error : new Error('Erreur de connexion au serveur');
    }
  }

  async getCurrentUser(): Promise<AdminUser> {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('Aucun token d\'authentification trouvé');
      }
      
      const response = await this.api.get<{ success: boolean; admin: AdminUser }>('/admin/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.data.success || !response.data.admin) {
        throw new Error('Aucune donnée utilisateur valide reçue');
      }
      
      return response.data.admin;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          // Supprimer le token invalide
          localStorage.removeItem('admin_token');
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'utilisateur');
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/admin/logout');
    } catch (error) {
      // Même en cas d'erreur, on considère que l'utilisateur est déconnecté
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Supprimer le token du stockage local
      localStorage.removeItem('admin');
    }
  }
}

const adminService = new AdminService();

export { adminService };
export default adminService;
