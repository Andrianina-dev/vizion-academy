// services/ecoleService.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const IS_DEV = import.meta.env.DEV;
const API_BASE = IS_DEV ? '' : (API_URL?.endsWith('/') ? API_URL.slice(0, -1) : API_URL);

interface LoginData {
  email: string; // ← Changé de id_ecole à email
  mot_de_passe: string;
}

interface Ecole {
  id_ecole: string;
  nom_ecole: string;
  email: string;
  telephone: string;
  adresse: string;
  date_creation: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  ecole?: Ecole;
}

// Création d'école
interface CreateEcoleData {
  nom_ecole: string;
  email: string;
  mot_de_passe: string;
  telephone?: string;
  adresse?: string;
}

interface CreateEcoleResponse {
  success: boolean;
  message: string;
  ecole?: {
    id_ecole: string;
    nom_ecole: string;
    email: string;
  };
}

export const loginEcole = async (data: LoginData): Promise<LoginResponse> => {
  try {
    // Initialiser le cookie CSRF (Sanctum) si nécessaire
    try {
      await axios.get(`${API_BASE}/sanctum/csrf-cookie`, { withCredentials: true });
    } catch { }

    const response = await axios.post(`${API_BASE}/api/ecole/login`, data, { // ← Utiliser base relative en dev
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    // Stocker l'école connectée localement
    if (response.data.success && response.data.ecole) {
      localStorage.setItem('ecole_connectee', JSON.stringify(response.data.ecole));
      // Stocker aussi l'ID en session pour accès rapide durant la session
      try {
        sessionStorage.setItem('ecole_id', response.data.ecole.id_ecole);
      } catch { }
    }

    return response.data;
  } catch (error: any) {
    console.error('Erreur login:', error);
    throw error.response?.data?.message || 'Erreur de connexion';
  }
};

// Créer une école
export const createEcole = async (data: CreateEcoleData): Promise<CreateEcoleResponse> => {
  try {
    console.log('Données envoyées à l\'API:', JSON.stringify(data, null, 2));

    // CSRF si nécessaire
    try {
      await axios.get(`${API_BASE}/sanctum/csrf-cookie`, { withCredentials: true });
    } catch (error) {
      console.error('Erreur CSRF:', error);
    }

    const response = await axios.post(`${API_BASE}/api/ecole`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true,
    });

    console.log('Réponse de l\'API:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Erreur détaillée:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      validationErrors: error.response?.data?.errors,
      url: error.config?.url,
      method: error.config?.method,
      requestData: error.config?.data ? JSON.parse(error.config.data) : null
    });

    // Si c'est une erreur de validation, on extrait les messages d'erreur
    if (error.response?.status === 422) {
      const errorMessages = error.response.data?.errors
        ? Object.entries(error.response.data.errors)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('\n')
        : 'Erreur de validation inconnue';

      throw new Error(`Erreur de validation :\n${errorMessages}`);
    }

    // Pour les autres erreurs, on renvoie un message générique
    throw new Error(error.response?.data?.message || "Une erreur est survenue lors de la création de l'école");
  }
};

// Fonction utilitaire pour récupérer l'école connectée
export const getEcoleConnectee = (): Ecole | null => {
  const ecoleData = localStorage.getItem('ecole_connectee');
  return ecoleData ? JSON.parse(ecoleData) : null;
};

// Fonction utilitaire pour récupérer l'ID de l'école connectée
export const getIdEcoleConnectee = (): string | null => {
  const ecole = getEcoleConnectee();
  return ecole ? ecole.id_ecole : null;
};

// Helper pour récupérer l'ID depuis la session si disponible
export const getIdEcoleSession = (): string | null => {
  try {
    return sessionStorage.getItem('ecole_id');
  } catch {
    return null;
  }
};