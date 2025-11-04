import axios from 'axios';
import { getIntervenantConnecte } from './intervenantService';

const API_URL = import.meta.env.VITE_API_URL;

export interface ProfilIntervenant {
  id_intervenant: string;
  nom: string;
  prenom: string;
  email: string;
  bio: string;
  competences: string;
  domaines: string[];
  langues: string[];
  ville: string;
  diplome: string;
  photo_url: string;
  cv_url: string;
  documents_url: string[];
  date_creation: string;
}

export const fetchProfil = async (): Promise<ProfilIntervenant> => {
  const intervenant = getIntervenantConnecte();
  if (!intervenant?.id_intervenant) {
    throw new Error('Intervenant non connecté');
  }

  const response = await axios.get<{ success: boolean; data: ProfilIntervenant }>(
    `${API_URL}/api/intervenants/${intervenant.id_intervenant}/profil`,
    { withCredentials: true }
  );

  if (!response.data.success) {
    throw new Error('Erreur lors de la récupération du profil');
  }

  return response.data.data;
};

export const updateProfil = async (data: Partial<ProfilIntervenant>): Promise<ProfilIntervenant> => {
  const intervenant = getIntervenantConnecte();
  if (!intervenant?.id_intervenant) {
    throw new Error('Intervenant non connecté');
  }

  const response = await axios.put<{ success: boolean; data: ProfilIntervenant }>(
    `${API_URL}/api/intervenants/${intervenant.id_intervenant}/profil`,
    data,
    { withCredentials: true }
  );

  if (!response.data.success) {
    throw new Error('Erreur lors de la mise à jour du profil');
  }

  return response.data.data;
};

export const uploadPhotoProfil = async (file: File): Promise<string> => {
  const intervenant = getIntervenantConnecte();
  if (!intervenant?.id_intervenant) {
    throw new Error('Intervenant non connecté');
  }

  const formData = new FormData();
  formData.append('photo_intervenant', file);

  const response = await axios.post<{ success: boolean; photo_url: string }>(
    `${API_URL}/api/intervenants/${intervenant.id_intervenant}/photo-profil`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    }
  );

  if (!response.data.success) {
    throw new Error('Erreur lors du téléchargement de la photo');
  }

  return response.data.photo_url;
};
