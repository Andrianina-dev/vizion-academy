import axios from 'axios';

// Configuration de l'URL de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = API_BASE_URL.endsWith('/')
  ? API_BASE_URL.slice(0, -1)
  : API_BASE_URL;
const IS_DEV = import.meta.env.DEV;
// En dev, utiliser des chemins relatifs pour bénéficier du proxy Vite et éviter CORS
const API_BASE = IS_DEV ? '' : API_URL;

// Bootstrap CSRF cookie (Laravel Sanctum) once per session
let csrfInitialized = false;
const ensureCsrfCookie = async () => {
  if (csrfInitialized) return;
  try {
    await axios.get(`${API_BASE}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
    csrfInitialized = true;
  } catch (e) {
    // Ne pas bloquer, laisser la requête principale échouer si nécessaire
    // Utile pour les backends non-Sanctum
  }
};

export interface Notification {
  id_notification: string;
  type_notification: string;
  messages: string;
  date_creation: string;
  lu: boolean;
  utilisateur_id: string;
  utilisateur_type: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

/**
 * Récupère les notifications avec pagination et filtres
 */
export const fetchNotifications = async (params: {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  unread_only?: boolean;
  user_id: string;
  user_type: string;
}): Promise<PaginatedResponse<Notification>> => {
  try {
    await ensureCsrfCookie();
    // Paramètres de requête
    const queryParams = new URLSearchParams();

    // Ajouter les paramètres de base
    if (params.user_id) queryParams.append('user_id', params.user_id);
    if (params.user_type) queryParams.append('user_type', params.user_type);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
    if (params.unread_only !== undefined) queryParams.append('unread_only', params.unread_only.toString());

    // Construire l'URL avec les paramètres de requête
    const url = `${API_BASE}/api/notifications`;
    console.log('Tentative de récupération des notifications depuis:', url);

    const response = await axios.get(url, {
      params: {
        user_id: params.user_id,
        user_type: params.user_type,
        sort_by: params.sort_by || 'date_creation',
        sort_order: params.sort_order || 'desc',
        per_page: params.per_page || 10,
        page: params.page || 1,
        unread_only: params.unread_only || false
      },
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Vérifier si la réponse contient directement les données
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        pagination: {
          total: response.data.length,
          per_page: params.per_page || 10,
          current_page: params.page || 1,
          last_page: 1,
          from: 1,
          to: response.data.length
        }
      };
    }

    // Si la réponse suit le format avec data et pagination
    if (response.data && Array.isArray(response.data.data)) {
      return {
        data: response.data.data,
        pagination: response.data.pagination || {
          total: response.data.data.length,
          per_page: params.per_page || 10,
          current_page: params.page || 1,
          last_page: 1,
          from: 1,
          to: response.data.data.length
        }
      };
    }

    throw new Error('Format de réponse inattendu de l\'API');
  } catch (error: any) {
    console.error('Erreur lors de la récupération des notifications :', error);
    // Si l'erreur est un 403 (non autorisé), relancer pour que l'UI affiche une notification
    if (error?.response?.status === 403) {
      throw error;
    }
    // Retourner un objet vide pour les autres cas d'erreur
    return {
      data: [],
      pagination: {
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0
      }
    };
  }
};

/**
 * Marque une notification comme lue
 */
export const marquerCommeLue = async (notificationId: string): Promise<boolean> => {
  try {
    await ensureCsrfCookie();
    const response = await axios.post<{ success: boolean }>(
      `${API_BASE}/api/notifications/${notificationId}/marquer-lue`,
      {},
      {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.success || false;
  } catch (error) {
    console.error('Erreur lors du marquage de la notification comme lue :', error);
    throw error;
  }
};

/**
 * Marque toutes les notifications comme lues pour un utilisateur
 */
export const marquerToutesCommeLues = async (userId: string, userType: string): Promise<number> => {
  try {
    await ensureCsrfCookie();
    const response = await axios.post<{ count: number }>(
      `${API_BASE}/api/notifications/tout-marquer-lu`,
      {
        user_id: userId,
        user_type: userType
      },
      {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    // Retourner le nombre de notifications mises à jour
    return response.data?.count || 0;
  } catch (error) {
    console.error('Erreur lors du marquage de toutes les notifications comme lues :', error);
    throw error;
  }
};
