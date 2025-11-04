import axios from 'axios';
import { getIntervenantConnecte } from './intervenantService';

const API_URL = import.meta.env.VITE_API_URL || 'https://facts-yet-kijiji-meeting.trycloudflare.com';

export interface Facture {
  id_facture: string;
  reference: string;
  mission_id: string;
  intervenant_id: string;
  ecole_id: string;
  titre_mission: string;
  nom_ecole: string;
  montant: number;
  montant_journalier?: number;
  montant_calcule?: number;
  duree?: number;
  date_creation: string;
  date_paiement: string | null;
  statut: 'payée' | 'en attente' | 'en validation';
  fichier_pdf?: string;
  missions?: Array<{
    id_mission: string;
    titre: string;
    date_debut: string;
    date_fin: string;
    duree: number;
    taux_horaire: number;
    ecole_nom: string;
  }>;
}

/**
 * Récupère toutes les factures de l'intervenant connecté
 * @param filters Filtres optionnels (statut, date de début, date de fin)
 */
export const fetchFactures = async (filters?: {
  statut?: 'payée' | 'en attente' | 'en validation';
  dateDebut?: string;
  dateFin?: string;
}): Promise<Facture[]> => {
  const intervenant = getIntervenantConnecte();
  if (!intervenant?.id_intervenant) {
    throw new Error('Intervenant non connecté');
  }

  try {
    const params = new URLSearchParams();
    if (filters?.statut) params.append('statut', filters.statut);
    if (filters?.dateDebut) params.append('date_debut', filters.dateDebut);
    if (filters?.dateFin) params.append('date_fin', filters.dateFin);

    const response = await axios.get<{ success: boolean; data: Facture[] }>(
      `${API_URL}/api/factures/intervenant/${intervenant.id_intervenant}?${params.toString()}`,
      { withCredentials: true }
    );

    return response.data.data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des factures :', error);
    throw error;
  }
};

/**
 * Télécharge une facture au format PDF
 * @param factureId ID de la facture à télécharger
 */
export const downloadFacturePdf = async (factureId: string): Promise<void> => {
  try {
    const response = await axios.get(`${API_URL}/api/factures/${factureId}/download`, {
      responseType: 'blob',
      withCredentials: true,
    });

    // Créer un URL pour le blob et déclencher le téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `facture-${factureId}.pdf`);
    document.body.appendChild(link);
    link.click();
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
  } catch (error) {
    console.error('Erreur lors du téléchargement de la facture :', error);
    throw error;
  }
};

/**
 * Récupère les détails d'une facture spécifique
 */
export const getFactureDetails = async (factureId: string): Promise<Facture> => {
  try {
    const response = await axios.get<{ success: boolean; data: Facture }>(
      `${API_URL}/api/factures/${factureId}`,
      { withCredentials: true }
    );
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de la facture :', error);
    throw error;
  }
};
