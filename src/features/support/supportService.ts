import type { CreateSupportTicketDto, SupportTicket } from './types';
import { API_URL } from '../../config/constants';
import axios from 'axios';

const API_BASE_URL = `${API_URL}/api`;

// Configuration simple d'axios
const axiosInstance = axios.create({
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Fonction utilitaire pour récupérer l'ID de l'école connectée
export const getEcoleConnecteeId = (): string => {
  const ecoleData = localStorage.getItem('ecole_connectee');
  if (!ecoleData) {
    throw new Error('Aucune école connectée');
  }
  const ecole = JSON.parse(ecoleData);
  if (!ecole?.id_ecole) {
    console.error('Données de l\'école invalides:', ecole);
    throw new Error('Données de l\'école invalides');
  }
  return ecole.id_ecole;
};

/**
 * Crée un nouveau ticket de support
 */
/**
 * Crée un nouveau ticket de support
 */
export const createSupportTicket = async (data: CreateSupportTicketDto): Promise<SupportTicket> => {
  try {
    // Récupérer l'ID de l'école connectée
    const ecoleId = getEcoleConnecteeId();
    
    const response = await axiosInstance.post(
      `${API_BASE_URL}/support/tickets`,
      {
        ecole_id: ecoleId,
        sujet: data.subject,
        message: data.message
      }
    );

    if (response.data?.success) {
      return response.data.data;
    }

    throw new Error(response.data?.message || 'Échec de la création du ticket de support');
  } catch (error: any) {
    console.error('Erreur lors de la création du ticket de support:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

/**
 * Récupère la liste des tickets de l'utilisateur connecté
 */
export const getUserTickets = async (): Promise<SupportTicket[]> => {
  try {
    // Récupérer l'ID de l'école connectée
    const ecoleId = getEcoleConnecteeId();
    
    const response = await axiosInstance.get(
      `${API_BASE_URL}/support/ecole/mes-tickets/${ecoleId}`
    );

    if (response.data?.success) {
      return response.data.data || [];
    }

    throw new Error(response.data?.message || 'Échec de la récupération des tickets');
  } catch (error: any) {
    console.error('Erreur lors de la récupération des tickets:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

/**
 * Récupère un ticket par son ID
 */
export const getTicketById = async (ticketId: string): Promise<SupportTicket> => {
  try {
    const response = await axiosInstance.get<SupportTicket>(`${API_BASE_URL}/support/tickets/${ticketId}`);

    if (!response.data) {
      throw new Error('Échec de la récupération du ticket');
    }

    return response.data;
  } catch (error: any) {
    console.error(`Erreur lors de la récupération du ticket ${ticketId}:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

/**
 * Met à jour un ticket existant
 */
export const updateTicket = async (
  ticketId: string,
  updates: Partial<SupportTicket>
): Promise<SupportTicket> => {
  try {
    const response = await axiosInstance.put<SupportTicket>(
      `${API_BASE_URL}/support/tickets/${ticketId}`,
      updates
    );
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du ticket ${ticketId}:`, error);
    throw error;
  }
};

/**
 * Ajoute une réponse à un ticket
 */
export const addTicketResponse = async (
  ticketId: string,
  message: string
): Promise<SupportTicket> => {
  try {
    const response = await axiosInstance.post<SupportTicket>(
      `${API_BASE_URL}/support/tickets/${ticketId}/response`,
      { message }
    );
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de l'ajout d'une réponse au ticket ${ticketId}:`, error);
    throw error;
  }
};
