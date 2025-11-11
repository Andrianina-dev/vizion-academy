import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getUserTickets } from '../../features/support/supportService';
import type { SupportTicket } from '../../features/support/types';

const statusBodyTemplate = (rowData: SupportTicket) => {
  const getSeverity = (status: string) => {
    switch (status) {
      case 'ouvert':
        return 'info';
      case 'en_cours':
        return 'warning';
      case 'résolu':
        return 'success';
      case 'fermé':
        return 'danger';
      default:
        return 'info';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'ouvert': 'Ouvert',
      'en_cours': 'En cours',
      'résolu': 'Résolu',
      'fermé': 'Fermé',
    };
    return labels[status] || status;
  };

  return (
    <Tag
      value={getStatusLabel(rowData.statut)}
      severity={getSeverity(rowData.statut)}
      className="text-sm"
    />
  );
};

const dateBodyTemplate = (dateString: string) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return format(date, 'PPpp', { locale: fr });
};

const actionBodyTemplate = (rowData: SupportTicket) => {
  return (
    <Button
      icon="pi pi-eye"
      className="p-button-rounded p-button-text"
      onClick={() => {
        // TODO: Implémenter la navigation vers les détails du ticket
        console.log('View ticket:', rowData.id_ticket);
      }}
      tooltip="Voir les détails"
      tooltipOptions={{ position: 'top' }}
    />
  );
};

const SupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const data = await getUserTickets();
        setTickets(data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  return (
    <Card title="Mes demandes de support" className="mt-4">
      {tickets.length === 0 ? (
        <div className="text-center p-4">
          <p>Aucun ticket de support trouvé.</p>
          <p>Créez votre première demande en utilisant le formulaire ci-dessus.</p>
        </div>
      ) : (
        <DataTable
          value={tickets}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} tickets"
          responsiveLayout="scroll"
          loading={loading}
          emptyMessage="Aucun ticket trouvé"
          className="p-datatable-striped"
        >
          <Column field="subject" header="Sujet" sortable filter filterPlaceholder="Rechercher par sujet" />
          <Column 
            field="status" 
            header="Statut" 
            body={statusBodyTemplate} 
            sortable 
            style={{ width: '150px' }} 
          />
          <Column 
            field="createdAt" 
            header="Date de création" 
            body={(rowData) => dateBodyTemplate(rowData.createdAt)} 
            sortable 
            style={{ width: '200px' }} 
          />
          <Column 
            field="updatedAt" 
            header="Dernière mise à jour" 
            body={(rowData) => dateBodyTemplate(rowData.updatedAt || rowData.createdAt)} 
            sortable 
            style={{ width: '200px' }} 
          />
          <Column 
            body={actionBodyTemplate} 
            style={{ width: '80px', textAlign: 'center' }} 
          />
        </DataTable>
      )}
    </Card>
  );
};

export default SupportTickets;
