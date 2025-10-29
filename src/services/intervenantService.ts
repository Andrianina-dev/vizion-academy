import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

const API_URLS = `${API_URL}/api/intervenants`;

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
  const response = await axios.post(`${API_URL}/api/intervenant/login`, data, {
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
