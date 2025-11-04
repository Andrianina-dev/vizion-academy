import axios from 'axios';
import { getIntervenantConnecte } from './intervenantService';

const API_URL = import.meta.env.VITE_API_URL;

export interface Mission {
  id_mission: string;
  ecole: string;
  date: string;
  taux_horaire: number;
  heures: number;
  intitule: string;
  total: number;
  tauxHoraire?: number;
  nombreHeures?: number;
}

export interface Paiement {
  id_facture: string;
  virement: string;
  date_estimee: string;
  motif: string;
  statut: 'en attente' | 'validé' | 'bloqué';
  mission: Mission;
  motifBlocage?: string;
}

export const fetchPaiementsEnAttente = async (): Promise<Paiement[]> => {
  const intervenant = getIntervenantConnecte();
  if (!intervenant?.id_intervenant) {
    throw new Error('Intervenant non connecté');
  }

  const response = await axios.get<{ success: boolean; data: Paiement[] }>(
    `${API_URL}/api/paiements/intervenant/${intervenant.id_intervenant}/pending`,
    { withCredentials: true }
  );

  if (!response.data.success) {
    throw new Error('Erreur lors de la récupération des paiements');
  }

  return response.data.data || [];
};

export const getStatusSeverity = (statut: string) => {
  switch (statut) {
    case 'validé': return 'success';
    case 'bloqué': return 'danger';
    case 'en attente': return 'warning';
    default: return 'info';
  }
};

export const getStatusIcon = (statut: string) => {
  switch (statut) {
    case 'validé': return 'pi pi-check-circle';
    case 'bloqué': return 'pi pi-exclamation-triangle';
    case 'en attente': return 'pi pi-clock';
    default: return 'pi pi-info-circle';
  }
};

export const formatMontant = (montant: number | string | undefined): string => {
  if (montant === undefined || montant === null) return '0.00';
  const num = typeof montant === 'string' ? parseFloat(montant) : montant;
  return isNaN(num) ? '0.00' : num.toFixed(2);
};
