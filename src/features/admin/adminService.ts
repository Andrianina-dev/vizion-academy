import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

// Configuration de base d'Axios pour les requêtes API
console.log('URL de l\'API:', import.meta.env.VITE_API_URL);

// Déclaration des interfaces
declare module 'axios' {
  interface InternalAxiosRequestConfig<D = any> {
    _retry?: boolean;
  }
}

interface AdminCredentials {
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

interface RegisterAdminData {
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
  statut?: 'en attente' | 'validé' | 'rejeté' | 'payée' | 'annulee';
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

class AdminService {
  private api: AxiosInstance;
  private _admin: AdminUser | null = null;
  private _isAuthenticated = false;
  private _message: string = '';

  constructor() {
    // Configuration de l'instance Axios
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL ?
        `${import.meta.env.VITE_API_URL}/api` :
        'http://localhost:8000/api',
      withCredentials: true,
      // Ne pas définir les en-têtes par défaut ici, ils seront gérés par l'intercepteur
      headers: {},
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
      withXSRFToken: true,
      // Désactiver la transformation automatique des réponses
      transformResponse: (data) => data,
      // Ne pas lancer d'erreur pour les statuts HTTP >= 400
      validateStatus: (status) => status < 500
    });

    // Configuration des intercepteurs
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Intercepteur de requête
    this.api.interceptors.request.use(
      (config) => {
        // Créer un nouvel objet headers pour éviter les modifications directes
        const headers: Record<string, any> = {
          ...config.headers,
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        };

        // Ajouter le token CSRF si disponible
        if (!config.url?.includes('/login')) {
          const token = this.getCookie('XSRF-TOKEN');
          if (token) {
            headers['X-XSRF-TOKEN'] = token;
          }
        }

        // Supprimer les en-têtes problématiques pour CORS
        delete headers['Cache-Control'];
        delete headers['Pragma'];

        console.log('Envoi de la requête vers:', config.url, {
          method: config.method,
          withCredentials: config.withCredentials,
          headers: headers
        });

        return config;
      },
      (error) => {
        console.error('Erreur dans l\'intercepteur de requête:', error);
        return Promise.reject(error);
      }
    );

    // Intercepteur de réponse
    this.api.interceptors.response.use(
      (response) => {
        // Mettre à jour le token CSRF si présent dans la réponse
        const newToken = response.headers['x-xsrf-token'];
        if (newToken) {
          document.cookie = `XSRF-TOKEN=${newToken}; path=/; samesite=strict` + (window.location.protocol === 'https:' ? '; secure' : '');
        }
        return response;
      },
      (error) => {
        if (error.response) {
          console.error('Erreur de réponse:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            headers: error.response.headers
          });

          // Si l'erreur est 401 (non autorisé), déconnecter l'utilisateur
          if (error.response.status === 401) {
            this._isAuthenticated = false;
            this._admin = null;
          }
        } else if (error.request) {
          console.error('Aucune réponse reçue:', error.request);
        } else {
          console.error('Erreur lors de la configuration de la requête:', error.message);
        }
        return Promise.reject(error);
      }
    );

    // Intercepteur de réponse principal
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // Ne pas logger les réponses de requêtes de vérification de session
        if (!response.config.url?.includes('/admin/me')) {
          console.log('Réponse reçue:', {
            url: response.config.url,
            status: response.status,
            data: response.data
          });
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        console.error('Erreur de réponse:', {
          url: originalRequest?.url,
          method: originalRequest?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });

        // Gestion des erreurs 401 (Non autorisé)
        if (error.response?.status === 401) {
          const currentPath = window.location.pathname;

          // Ne pas rediriger pour les requêtes de connexion ou de vérification de session
          if (originalRequest?.url?.includes('/admin/login') ||
            originalRequest?.url?.includes('/admin/me')) {
            return Promise.reject(error);
          }

          // Si on est déjà sur la page de connexion, on ne fait rien
          if (currentPath === '/admin/login') {
            return Promise.reject(error);
          }

          // Éviter les boucles de redirection
          if (!originalRequest?._retry) {
            console.log('Session expirée ou non authentifié, déconnexion...');
            originalRequest._retry = true;

            // Réinitialiser l'état d'authentification
            this.resetAuthState();

            // Rediriger vers la page de connexion
            if (!currentPath.includes('/login')) {
              sessionStorage.setItem('redirectAfterLogin', currentPath);
              window.location.href = '/admin/login';
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Getters
  get admin(): AdminUser | null {
    return this._admin;
  }

  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  get message(): string {
    return this._message;
  }

  // Méthodes d'authentification
  async login(credentials: AdminCredentials): Promise<{ admin: AdminUser }> {
    try {
      console.log('Tentative de connexion avec les identifiants:', credentials.email);

      // Nettoyer l'état précédent
      this._isAuthenticated = false;
      this._admin = null;

      const response = await this.api.post('/admin/login', {
        email: credentials.email,
        password: credentials.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        withCredentials: true
      });

      console.log('Réponse complète de connexion:', response);

      if (!response.data) {
        throw new Error('Réponse du serveur invalide');
      }

      // Parse the response data if it's a string
      const responseData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

      // Vérifier si la réponse contient un objet admin valide
      if (responseData && responseData.success && responseData.authenticated && responseData.admin) {
        const adminData = responseData.admin;

        console.log('Connexion réussie, utilisateur:', {
          id: adminData.id,
          email: adminData.email,
          role: adminData.role
        });

        // Mettre à jour l'état de l'authentification
        this._admin = adminData;
        this._isAuthenticated = true;
        this._message = responseData.message || 'Connexion réussie';

        // Stocker les informations de session
        localStorage.setItem('adminToken', 'authenticated');
        localStorage.setItem('adminData', JSON.stringify(adminData));

        return { admin: adminData };
      }

      // Si on arrive ici, le format de la réponse est inattendu
      console.error('Format de réponse inattendu ou données manquantes:', response.data);
      throw new Error('Format de réponse du serveur inattendu');

    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      this._isAuthenticated = false;
      this._admin = null;

      if (axios.isAxiosError(error)) {
        console.error('Détails de l\'erreur Axios:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        });

        if (error.response) {
          const errorMessage = error.response.data?.message ||
            error.response.data?.error ||
            (error.response.status === 401 ? 'Email ou mot de passe incorrect' :
              `Erreur lors de la connexion (${error.response.status})`);
          this._message = errorMessage;
          throw new Error(errorMessage);
        } else if (error.request) {
          throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion.');
        }
      }

      throw error instanceof Error ? error : new Error('Une erreur inattendue est survenue');
    }
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  async getCurrentUser(forceRefresh = false): Promise<AdminUser | null> {
    console.log('getCurrentUser appelé, chemin actuel:', window.location.pathname, { forceRefresh });

    if (typeof window === 'undefined') {
      console.log('Côté serveur, pas de vérification de session');
      return null;
    }

    // Si on a déjà un admin en mémoire et qu'on ne force pas le rafraîchissement
    if (this._admin && !forceRefresh) {
      console.log('Utilisation de l\'utilisateur en mémoire');
      return this._admin;
    }

    // Vérifier d'abord si on a des données en cache (sauf si on force le rafraîchissement)
    if (!forceRefresh) {
      const cachedAdmin = localStorage.getItem('adminData');
      if (cachedAdmin) {
        try {
          const adminData = JSON.parse(cachedAdmin);
          this._admin = adminData;
          this._isAuthenticated = true;
          console.log('Utilisation des données utilisateur en cache');
          return adminData;
        } catch (e) {
          console.error('Erreur lors du parsing des données en cache', e);
          localStorage.removeItem('adminData');
        }
      }
    }


    try {
      console.log('Vérification de l\'authentification...');

      // Préparer la requête avec le minimum d'en-têtes nécessaires
      const config = {
        withCredentials: true,
        // Ne pas lancer d'erreur pour les réponses 401
        validateStatus: (status: number) => status < 500
      };

      console.log('Envoi de la requête GET vers /admin/me');

      const response = await this.api.get('/admin/me', config);

      console.log('Réponse de l\'API /admin/me:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      if (response.status === 200 && response.data) {
        // Gérer à la fois les réponses avec et sans propriété 'authenticated'
        const responseData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

        if ((responseData.authenticated || responseData.admin) && responseData.admin) {
          this._isAuthenticated = true;
          this._admin = responseData.admin;

          // Mettre à jour le cache local
          localStorage.setItem('adminData', JSON.stringify(this._admin));

          console.log('Utilisateur authentifié avec succès');
          return this._admin;
        }
      }

      // Si la session a expiré ou est invalide
      if (response.status === 401) {
        console.log('Session expirée ou invalide');
        localStorage.removeItem('adminToken');
      }

      console.log('Aucun utilisateur authentifié ou données manquantes dans la réponse');
      this._isAuthenticated = false;
      this._admin = null;
      return null;
    } catch (error: any) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', error);

      // En cas d'erreur réseau, on ne déconnecte pas l'utilisateur
      if (error.code === 'ERR_NETWORK') {
        console.log('Erreur réseau, maintien de la session');
        return this._admin; // Retourne l'utilisateur en cache si disponible
      }

      this._isAuthenticated = false;
      this._admin = null;
      localStorage.removeItem('adminToken');
      return null;
    }
  }

  resetAuthState() {
    this._isAuthenticated = false;
    this._admin = null;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/admin/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      this.resetAuthState();
      document.cookie = 'laravel_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'XSRF-TOKEN=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  }

  // Autres méthodes du service
  async registerAdmin(adminData: RegisterAdminData): Promise<{ message: string }> {
    try {
      const response = await this.api.post('/admin/register', adminData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'administrateur:', error);
      throw error;
    }
  }

  async getPaiementsEnAttente(): Promise<PaiementEnAttente[]> {
    try {
      console.log('Récupération des paiements en attente...');

      // Vérifier si l'utilisateur est authentifié
      if (!this.isAuthenticated) {
        console.log('Utilisateur non authentifié, tentative de rafraîchissement de la session...');
        await this.getCurrentUser(true); // Forcer le rafraîchissement de la session
      }

      // Utiliser l'instance axios configurée avec les intercepteurs
      const response = await this.api.get('/factures/en-attente', {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        withCredentials: true
      });

      console.log('Réponse des paiements en attente:', response.data);

      if (!response.data) {
        console.warn('Réponse vide du serveur');
        return [];
      }

      // Vérifier si la réponse est une chaîne et essayer de la parser
      let responseData = response.data;
      if (typeof responseData === 'string') {
        try {
          const jsonStart = responseData.indexOf('{');
          const jsonEnd = responseData.lastIndexOf('}') + 1;
          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            responseData = responseData.substring(jsonStart, jsonEnd);
          }
          responseData = JSON.parse(responseData);
        } catch (e) {
          console.error('Erreur lors du parsing de la réponse JSON:', e, 'Données reçues:', responseData);
          throw new Error('Format de réponse invalide reçu du serveur');
        }
      }

      // Vérifier si la réponse contient une erreur
      if (responseData.error || (responseData.success === false && responseData.message)) {
        console.error('Erreur dans la réponse:', responseData);
        throw new Error(responseData.message || 'Erreur lors de la récupération des paiements');
      }

      // Gérer différents formats de réponse
      let paiements: PaiementEnAttente[] = [];

      if (Array.isArray(responseData)) {
        // Si la réponse est directement un tableau
        paiements = responseData;
      } else if (responseData && typeof responseData === 'object') {
        // Si la réponse est un objet avec une propriété 'data'
        if (Array.isArray(responseData.data)) {
          paiements = responseData.data;
        } else if (responseData.success && Array.isArray(responseData.data)) {
          paiements = responseData.data;
        } else if (responseData.paiements && Array.isArray(responseData.paiements)) {
          // Format alternatif de réponse
          paiements = responseData.paiements;
        }
      }

      console.log('Données des paiements en attente extraites:', paiements);

      // S'assurer que les données correspondent à l'interface PaiementEnAttente
      const paiementsValides = paiements.filter((paiement: PaiementEnAttente) =>
        paiement.id_facture &&
        paiement.intervenant &&
        paiement.mission
      );

      console.log(`Nombre de paiements en attente valides: ${paiementsValides.length}`);
      return paiementsValides;

    } catch (error: any) {
      console.error('Erreur lors de la récupération des paiements en attente:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; statusText: string; data: any } };
        if (axiosError.response) {
          console.error('Détails de l\'erreur:', {
            status: axiosError.response.status,
            statusText: axiosError.response.statusText,
            data: axiosError.response.data
          });
        }
      }
      return [];
    }
  }

  async validerPaiement(idFacture: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Validation du paiement ${idFacture} via updateStatut...`);
      const response = await this.api.patch(`/factures/${idFacture}/statut`,
        { statut: 'payée' },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          withCredentials: true
        }
      );

      let responseData: any = response.data;
      if (typeof responseData === 'string') {
        try {
          responseData = JSON.parse(responseData);
        } catch {
          // ignore parse error, keep raw
        }
      }

      if (response.status === 200 && responseData && responseData.success) {
        console.log('Statut de la facture mis à jour avec succès:', responseData);
        return {
          success: true,
          message: responseData.message || 'Paiement validé avec succès'
        };
      }

      const message = responseData?.message || 'Réponse inattendue du serveur';
      console.warn('Réponse inattendue ou échec:', response.status, responseData);
      return { success: false, message };

    } catch (error: any) {
      console.error('Erreur lors de la validation du paiement (updateStatut):', error);
      let errorMessage = 'Une erreur est survenue lors de la validation du paiement';

      if (axios.isAxiosError(error)) {
        if (error.response) {
          const responseData = error.response.data as any;
          // Essayer d'extraire un message
          if (typeof responseData === 'string') {
            try {
              const parsed = JSON.parse(responseData);
              errorMessage = parsed?.message || errorMessage;
            } catch {
              errorMessage = errorMessage;
            }
          } else {
            errorMessage = (responseData && (responseData.message || responseData.error)) || errorMessage;
          }

          if (error.response.status === 401) {
            this.resetAuthState();
          }
        } else if (error.request) {
          errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
        }
      }

      return { success: false, message: errorMessage };
    }
  }

  async rejeterPaiement(idFacture: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Rejet du paiement ${idFacture}...`);
      const response = await this.api.post(`/admin/paiements/${idFacture}/rejeter`);

      // Vérifier si la réponse contient les données attendues
      if (response.data && typeof response.data === 'object') {
        console.log('Paiement rejeté avec succès:', response.data);
        return {
          success: true,
          message: response.data.message || 'Paiement rejeté avec succès'
        };
      }

      // Si la réponse n'est pas au format attendu
      console.warn('Réponse inattendue du serveur:', response);
      return {
        success: false,
        message: 'Réponse inattendue du serveur'
      };

    } catch (error: any) {
      console.error('Erreur lors du rejet du paiement:', error);

      // Gestion des erreurs spécifiques
      let errorMessage = 'Une erreur est survenue lors du rejet du paiement';

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Erreur avec une réponse du serveur
          const responseData = error.response.data;
          errorMessage = responseData.message || errorMessage;

          // Si le token a expiré, on déconnecte l'utilisateur
          if (error.response.status === 401) {
            this.resetAuthState();
            // L'erreur sera capturée par l'intercepteur pour la redirection
          }
        } else if (error.request) {
          // La requête a été faite mais aucune réponse n'a été reçue
          errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
        }
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  }
}

// Créer et exporter une seule instance du service
const adminService = new AdminService();
export default adminService;
