import type { CreateSupportTicketDto, SupportTicket } from './types';
import { API_URL } from '../../config/constants';
import axios from 'axios';

const API_BASE_URL = `${API_URL}/api/support`;

// Configuration d'axios pour inclure les credentials
axios.defaults.withCredentials = true;

/**
 * Crée un nouveau ticket de support
 */
export const createSupportTicket = async (data: CreateSupportTicketDto): Promise<SupportTicket> => {
  try {
    const response = await axios.post<SupportTicket>(
      `${API_BASE_URL}/tickets`, 
      {
        sujet: data.subject,
        messages: data.message,
        statut: 'ouvert' // Le statut par défaut
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du ticket de support:', error);
    throw error;
  }
};

/**
 * Récupère la liste des tickets de l'utilisateur connecté
 */
/**
 * Récupère la liste des tickets de l'utilisateur connecté
 */
export const getUserTickets = async (): Promise<SupportTicket[]> => {
  try {
    const response = await axios.get<SupportTicket[]>(`${API_BASE_URL}/tickets`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    throw error;
  }
};

/**
 * Récupère les détails d'un ticket spécifique
 */
/**
 * Récupère un ticket par son ID
 */
export const getTicketById = async (ticketId: string): Promise<SupportTicket> => {
  try {
    const response = await axios.get<SupportTicket>(`${API_BASE_URL}/tickets/${ticketId}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du ticket ${ticketId}:`, error);
    throw error;
  }
};

/**
 * Met à jour un ticket existant
 */
/**
 * Met à jour un ticket existant
 */
export const updateTicket = async (
  ticketId: string,
  updates: Partial<SupportTicket>
): Promise<SupportTicket> => {
  try {
    const response = await axios.put<SupportTicket>(
      `${API_BASE_URL}/tickets/${ticketId}`,
      {
        // Mapper les champs si nécessaire
        reponse: updates.reponse,
        statut: updates.statut,
        messages: updates.messages
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
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
/**
 * Ajoute une réponse à un ticket
 */
export const addTicketResponse = async (
  ticketId: string,
  message: string
): Promise<SupportTicket> => {
  try {
    // On utilise updateTicket pour ajouter une réponse
    return await updateTicket(ticketId, {
      reponse: message,
      statut: 'en_cours' // Mise à jour du statut
    });
  } catch (error) {
    console.error(`Erreur lors de l'ajout d'une réponse au ticket ${ticketId}:`, error);
    throw error;
  }
};
