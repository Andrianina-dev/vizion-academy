// services/ecoleService.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

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

export const loginEcole = async (data: LoginData): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/api/ecole/login`, data, { // ← Changé l'URL
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    // Stocker l'école connectée localement
    if (response.data.success && response.data.ecole) {
      localStorage.setItem('ecole_connectee', JSON.stringify(response.data.ecole));
    }

    return response.data;
  } catch (error: any) {
    console.error('Erreur login:', error);
    throw error.response?.data?.message || 'Erreur de connexion';
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