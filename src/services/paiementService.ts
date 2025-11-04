import axios from 'axios';
import { getIntervenantConnecte } from './intervenantService';

const API_URL = import.meta.env.VITE_API_URL || 'https://facts-yet-kijiji-meeting.trycloudflare.com';

export interface MissionType {
  id_mission: string;
  ecole: string;
  date: string;
  taux_horaire: number;
  heures: number;
  intitule: string;
  total: number;
  duree?: number;
}

export interface Paiement {
  id_facture: string;
  virement: string;
  date_estimee: string;
  motif: string;
  statut: 'en attente' | 'validé' | 'bloqué' | 'en validation';
  mission: MissionType;
  motifBlocage?: string;
  montant?: number;
  date_creation?: string;
}

/**
 * Récupère les paiements en attente de l'intervenant connecté
 */
export const fetchPaiementsEnAttente = async (): Promise<Paiement[]> => {
  const intervenant = getIntervenantConnecte();
  if (!intervenant?.id_intervenant) {
    throw new Error('Intervenant non connecté');
  }

  try {
    const response = await axios.get<{ success: boolean; data: Paiement[] }>(
      `${API_URL}/api/paiements/intervenant/${intervenant.id_intervenant}/pending`,
      { withCredentials: true }
    );
    return response.data.data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements en attente :', error);
    throw error;
  }
};

/**
 * Récupère l'historique des paiements de l'intervenant
 */
export const fetchHistoriquePaiements = async (): Promise<Paiement[]> => {
  const intervenant = getIntervenantConnecte();
  if (!intervenant?.id_intervenant) {
    throw new Error('Intervenant non connecté');
  }

  try {
    const response = await axios.get<{ success: boolean; data: Paiement[] }>(
      `${API_URL}/api/factures/intervenant/${intervenant.id_intervenant}`,
      { withCredentials: true }
    );
    
    // Transformer les factures en format de paiement pour l'affichage
    return (response.data.data || []).map((facture: any) => ({
      id_facture: facture.id_facture,
      virement: `VIR-${facture.id_facture.replace(/[^0-9]/g, '')}`,
      date_estimee: facture.date_paiement_estimee || '',
      motif: facture.motif || 'Rémunération mission',
      statut: facture.statut,
      montant: facture.montant,
      date_creation: facture.date_creation,
      mission: {
        id_mission: facture.mission_id,
        ecole: facture.nom_ecole || 'Non spécifiée',
        date: facture.date_creation,
        taux_horaire: facture.taux_horaire || 0,
        heures: facture.duree || 0,
        intitule: facture.titre_mission || 'Mission sans titre',
        total: facture.montant || 0
      }
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des paiements :', error);
    throw error;
  }
};
