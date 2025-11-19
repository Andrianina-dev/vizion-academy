import axios from 'axios';
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const API_URLS = `${API_BASE}/api/intervenants`;

export const IntervenantService = {
  async getAll() {
    const response = await axios.get(API_URLS);
    return response.data.data; // ← Laravel retourne souvent sous data.data
  }
};

export interface IntervenantLoginData {
  email: string;
  mot_de_passe: string;
}

export interface Intervenant {
  id_intervenant: string;
  nom_intervenant: string;
  prenom_intervenant: string;
  email_login: string;
}

export interface IntervenantLoginResponse {
  success: boolean;
  message: string;
  intervenant?: Intervenant;
}

export const loginIntervenant = async (
  data: IntervenantLoginData
): Promise<IntervenantLoginResponse> => {
  const response = await axios.post(`${API_BASE}/api/intervenant/login`, data, {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });

  if (response.data?.success && response.data?.intervenant) {
    localStorage.setItem('intervenant_connecte', JSON.stringify(response.data.intervenant));
  }

  return response.data;
};

export const getIntervenantConnecte = (): Intervenant | null => {
  const raw = localStorage.getItem('intervenant_connecte');
  return raw ? JSON.parse(raw) : null;
};

export interface NewIntervenantData {
  nom_intervenant: string;
  prenom_intervenant: string;
  email_login: string;
  mot_de_passe: string;
  telephone?: string;
  specialite?: string;
  bio_intervenant?: string;
  domaines?: string[];
  langues?: string[];
  ville?: string;
  diplome?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string[]>;
}

/**
 * Ajoute un nouvel intervenant
 * @param data Données de l'intervenant à créer
 * @returns Réponse de l'API
 */
export const addIntervenant = async (data: NewIntervenantData): Promise<ApiResponse> => {
  try {
    // Préparer les données pour l'API
    const requestData = {
      nom_intervenant: data.nom_intervenant,
      prenom_intervenant: data.prenom_intervenant,
      email_login: data.email_login,
      mot_de_passe: data.mot_de_passe,
      telephone: data.telephone || '',
      specialite: data.specialite || '',
      bio_intervenant: data.bio_intervenant || '',
      domaines: data.domaines || [],
      langues: data.langues || [],
      ville: data.ville || '',
      diplome: data.diplome || ''
    };

    const response = await axios.post(`${API_BASE}/api/intervenants`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de l\'ajout de l\'intervenant:', error);

    // Gestion des erreurs de validation
    if (error.response?.status === 422) {
      return {
        success: false,
        message: error.response.data.message || 'Erreur de validation',
        errors: error.response.data.errors
      };
    }

    // Autres erreurs
    return {
      success: false,
      message: error.response?.data?.message || `Une erreur est survenue lors de l'ajout de l'intervenant: ${error.message}`
    };
  }
};
