import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import API_CONFIG from '../config/apiConfig';

// Création d'une instance axios personnalisée
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.getBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour les requêtes
apiClient.interceptors.request.use(
  (config) => {
    // Mettre à jour l'URL de base à chaque requête pour s'assurer qu'elle est à jour
    config.baseURL = API_CONFIG.getBaseUrl();
    
    // Vous pouvez ajouter des en-têtes d'authentification ici si nécessaire
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Gestion des erreurs globales (401, 403, 500, etc.)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Rediriger vers la page de connexion
          window.location.href = '/login';
          break;
        case 403:
          // Accès refusé
          console.error('Accès refusé');
          break;
        case 404:
          console.error('Ressource non trouvée');
          break;
        case 500:
          console.error('Erreur serveur');
          break;
        default:
          console.error(`Erreur ${error.response.status}: ${error.response.data?.message || 'Erreur inconnue'}`);
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('Pas de réponse du serveur');
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Erreur de configuration de la requête', error.message);
    }
    
    return Promise.reject(error);
  }
);

export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.get<T>(url, config);
  return response.data;
};

export const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
};

export const put = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
};

export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
};

export default {
  get,
  post,
  put,
  delete: del,
};
