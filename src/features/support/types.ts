export interface SupportTicket {
  id_ticket: string;
  ecole_id: string;
  sujet: string;
  messages: string;
  reponse?: string;
  statut: 'ouvert' | 'en_cours' | 'résolu' | 'fermé';
  date_creation: string;
  date_reponse?: string;
  repondu_par?: string;
}

export interface CreateSupportTicketDto {
  subject: string;
  message: string;
  status?: 'ouvert' | 'en_cours' | 'résolu' | 'fermé';
}
