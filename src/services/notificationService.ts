import axios from 'axios';
import { getIntervenantConnecte } from './intervenantService';

const API_URL = import.meta.env.VITE_API_URL || 'https://facts-yet-kijiji-meeting.trycloudflare.com';

export interface Notification {
  id_notification: string;
  type: string;
  message: string;
  date_creation: string;
  lue: boolean;
  lien?: string;
}

/**
 * Récupère les notifications non lues de l'intervenant connecté
 */
export const fetchNotifications = async (): Promise<Notification[]> => {
  const intervenant = getIntervenantConnecte();
  if (!intervenant?.id_intervenant) {
    throw new Error('Intervenant non connecté');
  }

  try {
    const response = await axios.get<{ success: boolean; data: Notification[] }>(
      `${API_URL}/api/intervenants/${intervenant.id_intervenant}/notifications`,
      { withCredentials: true }
    );
    return response.data.data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications :', error);
    throw error;
  }
};

/**
 * Marque une notification comme lue
 */
export const marquerCommeLue = async (notificationId: string): Promise<boolean> => {
  try {
    const response = await axios.post<{ success: boolean }>(
      `${API_URL}/api/notifications/${notificationId}/marquer-lue`,
      {},
      { withCredentials: true }
    );
    return response.data.success;
  } catch (error) {
    console.error('Erreur lors du marquage de la notification comme lue :', error);
    throw error;
  }
};

/**
 * Marque toutes les notifications comme lues
 */
export const marquerToutesCommeLues = async (): Promise<number> => {
  try {
    const response = await axios.post<{ success: boolean; message: string }>(
      `${API_URL}/api/notifications/tout-marquer-lu`,
      {},
      { withCredentials: true }
    );
    
    // Extraire le nombre de notifications marquées comme lues depuis le message
    const match = response.data.message.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 0;
  } catch (error) {
    console.error('Erreur lors du marquage de toutes les notifications comme lues :', error);
    throw error;
  }
};
