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

// Intercepteur pour ajouter les en-têtes communs aux requêtes
adminApi.interceptors.request.use(
  (config) => {
    // On ne met plus de token Bearer ici, on utilise les cookies de session
    config.headers['Accept'] = 'application/json';
    config.headers['Content-Type'] = 'application/json';
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
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
    // Vérifier si la requête originale existe
    if (!error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const currentPath = window.location.pathname;

    // Si l'erreur est 401
    if (error.response?.status === 401) {
      // Ne pas rediriger pour les requêtes de vérification de session, login ou rafraîchissement
      if (originalRequest.url?.includes('/admin/me') ||
        originalRequest.url?.includes('/admin/login') ||
        originalRequest.url?.includes('refresh') ||
        // Ne pas rediriger pour la racine ou les routes non-admin
        !currentPath.startsWith('/admin/')) {
        return Promise.reject(error);
      }

      // Vérifier si nous sommes déjà sur la page de connexion ou en train de rediriger
      if (currentPath === '/admin/login' ||
        sessionStorage.getItem('redirecting') === 'true') {
        return Promise.reject(error);
      }

      try {
        // Marquer que nous sommes en train de rediriger
        sessionStorage.setItem('redirecting', 'true');

        // Supprimer l'indicateur d'authentification
        localStorage.removeItem('is_authenticated');

        // Stocker l'URL actuelle pour rediriger après la connexion
        if (currentPath !== '/admin/login') {
          sessionStorage.setItem('redirectAfterLogin', currentPath);
        }

        // Rediriger vers la page de connexion
        window.location.href = '/admin/login';
      } catch (e) {
        console.error('Erreur lors de la redirection:', e);
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Intercepteur pour réinitialiser l'état de redirection après une requête réussie
adminApi.interceptors.request.use(config => {
  // Réinitialiser l'état de redirection pour les nouvelles requêtes
  if (sessionStorage.getItem('redirecting') === 'true') {
    sessionStorage.removeItem('redirecting');
  }
  return config;
});

export interface AdminCredentials {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  nom_admin: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface RegisterAdminData {
  nom_admin: string;
  email: string;
  password: string;
  password_confirmation: string;
  is_admin?: boolean;
}

export interface PaiementEnAttente {
  id_facture: string;
  virement: string;
  montant: number;
  date_demande: string;
  statut?: 'en_attente' | 'validé' | 'rejeté';
  intervenant: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  mission: {
    id: string | null;
    intitule: string;
    ecole: string;
  };
}

export interface IAdminService {
  readonly admin: AdminUser | null;
  readonly isAuthenticated: boolean;
  readonly message: string;
  registerAdmin(adminData: RegisterAdminData): Promise<{ message: string }>;
  login(credentials: { email: string; password: string }): Promise<{ admin: AdminUser }>;
  getCurrentUser(): Promise<AdminUser | null>;
  logout(): Promise<void>;
  // Gestion des paiements
  getPaiementsEnAttente(): Promise<PaiementEnAttente[]>;
  validerPaiement(idFacture: string): Promise<{ success: boolean; message: string }>;
  rejeterPaiement(idFacture: string): Promise<{ success: boolean; message: string }>;
  // Ajout des getters manquants
  getAdmin(): AdminUser | null;
  getIsAuthenticated(): boolean;
  getMessage(): string;
}

class AdminService implements IAdminService {
  private api: AxiosInstance;
  private _admin: AdminUser | null = null;
  private _isAuthenticated = false;
  private _message: string = '';

  constructor() {
    this.api = adminApi;
  }

  // Implémentation des getters de l'interface IAdminService
  get admin(): AdminUser | null {
    return this._admin;
  }

  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  get message(): string {
    return this._message;
  }

  // Méthodes supplémentaires requises par l'interface
  getAdmin(): AdminUser | null {
    return this._admin;
  }

  getIsAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  getMessage(): string {
    return this._message;
  }

  // Méthodes de gestion des paiements
  async getPaiementsEnAttente(): Promise<PaiementEnAttente[]> {
    try {
      const response = await this.api.get('/admin/paiements/en-attente');
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements en attente:', error);
      throw error;
    }
  }

  async validerPaiement(idFacture: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.put(`/admin/paiements/${idFacture}/valider`);
      return {
        success: true,
        message: response.data.message || 'Paiement validé avec succès'
      };
    } catch (error: unknown) {
      console.error('Erreur lors de la validation du paiement:', error);

      if (axios.isAxiosError(error)) {
        const message = (error.response?.data as { message?: string })?.message ||
          error.message ||
          'Erreur lors de la validation du paiement';
        return {
          success: false,
          message
        };
      }

      const errorMessage = error instanceof Error
        ? error.message
        : 'Erreur lors de la validation du paiement';

      return {
        success: false,
        message: errorMessage
      };
    }
  }

  async rejeterPaiement(idFacture: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.put(`/admin/paiements/${idFacture}/rejeter`);
      return {
        success: true,
        message: response.data.message || 'Paiement rejeté avec succès'
      };
    } catch (error: unknown) {
      console.error('Erreur lors du rejet du paiement:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Erreur lors du rejet du paiement'
      };
    }
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

  async login(credentials: AdminCredentials): Promise<{ admin: AdminUser }> {
    try {
      console.log('Tentative de connexion avec les identifiants:', credentials.email);

      // Définition de l'interface pour la réponse de l'API
      interface LoginResponse {
        success: boolean;
        admin: AdminUser;
        message: string;
        authenticated: boolean;
      }

      const response = await this.api.post<LoginResponse>('/admin/login', {
        email: credentials.email,
        password: credentials.password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      console.log('Réponse du serveur:', response.data);

      if (!response.data.success || !response.data.authenticated) {
        console.error('Échec de l\'authentification:', response.data.message);
        throw new Error(response.data.message || 'Échec de la connexion');
      }

      if (!response.data.admin) {
        console.error('Aucune donnée admin reçue dans la réponse');
        throw new Error('Erreur d\'authentification: aucune donnée utilisateur reçue');
      }

      console.log('Connexion réussie');

      this._admin = response.data.admin;
      this._isAuthenticated = true;

      return {
        admin: response.data.admin
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Gestion des erreurs de validation ou d'authentification
          if (error.response.status === 401 || error.response.status === 422) {
            const errorMessage = error.response.data?.message || 'Email ou mot de passe incorrect';
            throw new Error(errorMessage);
          }
          // Autres erreurs
          const errorMessage = error.response.data?.message || 'Erreur lors de la connexion';
          throw new Error(errorMessage);
        }
      }
      throw error;
    }
  }

  async getCurrentUser(): Promise<AdminUser | null> {
    try {
      // Interface pour la réponse attendue
      interface CurrentUserResponse {
        success: boolean;
        message?: string;
        admin: AdminUser;
        authenticated: boolean;
      }

      // Utilisation de la méthode PUT comme requis par l'API
      const response = await this.api.put<CurrentUserResponse>('/admin/me', {}, {
        // Ne pas déclencher l'intercepteur pour cette requête
        validateStatus: (status) => status < 500
      });

      // Si la requête a échoué avec une erreur 401, retourner null sans déclencher de redirection
      if (response.status === 401) {
        this._isAuthenticated = false;
        this._admin = null;
        return null;
      }

      // Vérifier si la réponse est valide
      if (!response.data) {
        throw new Error('Réponse du serveur invalide');
      }

      const { success, authenticated, admin } = response.data;

      // Vérifier la réponse
      if (!success || !authenticated || !admin) {
        this._isAuthenticated = false;
        this._admin = null;
        return null;
      }

      // Mettre à jour l'état d'authentification
      this._admin = admin;
      this._isAuthenticated = true;
      return admin;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error instanceof Error ? error.message : 'Erreur inconnue');
      this._isAuthenticated = false;
      this._admin = null;
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/admin/logout');
    } catch (error) {
      // Même en cas d'erreur, on considère que l'utilisateur est déconnecté
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      this._admin = null;
      this._isAuthenticated = false;
    }
  }
}

// Créer l'instance du service
const adminService = new AdminService();

// Exporter l'instance du service
export { adminService };
export default adminService;
