import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Facture } from '../../services/factureService';
import { fetchFactures, downloadFacturePdf } from '../../services/factureService';

const statuses = [
  { label: 'Tous les statuts', value: null },
  { label: 'Payée', value: 'payée' },
  { label: 'En attente', value: 'en attente' },
  { label: 'En validation', value: 'en validation' },
];

const FacturesList: React.FC = () => {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState({
    statut: null as string | null,
    dateDebut: null as Date | null,
    dateFin: null as Date | null,
  });

  useEffect(() => {
    loadFactures();
  }, [filters]);

  const loadFactures = async () => {
    try {
      setLoading(true);
      const data = await fetchFactures({
        statut: filters.statut as any,
        dateDebut: filters.dateDebut ? format(filters.dateDebut, 'yyyy-MM-dd') : undefined,
        dateFin: filters.dateFin ? format(filters.dateFin, 'yyyy-MM-dd') : undefined,
      });
      setFactures(data);
    } catch (error) {
      console.error('Erreur lors du chargement des factures :', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (factureId: string) => {
    try {
      await downloadFacturePdf(factureId);
    } catch (error) {
      console.error('Erreur lors du téléchargement :', error);
    }
  };

  const statusBodyTemplate = (rowData: Facture) => {
    const getSeverity = (status: string) => {
      switch (status) {
        case 'payée':
          return 'success';
        case 'en attente':
          return 'warning';
        case 'en validation':
          return 'info';
        default:
          return null;
      }
    };

    return <Tag value={rowData.statut} severity={getSeverity(rowData.statut)} />;
  };

  const actionBodyTemplate = (rowData: Facture) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-download"
          className="p-button-rounded p-button-outlined p-button-sm"
          onClick={() => handleDownload(rowData.id_facture)}
          tooltip="Télécharger la facture"
        />
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  };

  return (
    <div className="card">
      <div className="flex justify-content-between align-items-center mb-4">
        <h2>Mes Factures</h2>
        <div className="flex gap-2">
          <Dropdown
            value={filters.statut}
            options={statuses}
            onChange={(e) => setFilters({ ...filters, statut: e.value })}
            placeholder="Filtrer par statut"
            className="w-15rem"
          />
          <span className="p-float-label">
            <Calendar
              value={filters.dateDebut}
              onChange={(e) => setFilters({ ...filters, dateDebut: e.value as Date })}
              dateFormat="dd/mm/yy"
              showIcon
              placeholder="Date de début"
              className="w-15rem"
            />
          </span>
          <span className="p-float-label">
            <Calendar
              value={filters.dateFin}
              onChange={(e) => setFilters({ ...filters, dateFin: e.value as Date })}
              dateFormat="dd/mm/yy"
              showIcon
              placeholder="Date de fin"
              className="w-15rem"
            />
          </span>
        </div>
      </div>

      <DataTable
        value={factures}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} factures"
        emptyMessage="Aucune facture trouvée"
      >
        <Column field="reference" header="Référence" sortable />
        <Column field="titre_mission" header="Mission" sortable />
        <Column field="nom_ecole" header="École" sortable />
        <Column 
          field="date_creation" 
          header="Date de création" 
          body={(data) => formatDate(data.date_creation)}
          sortable 
        />
        <Column 
          field="montant" 
          header="Montant" 
          body={(data) => `${data.montant.toFixed(2)} €`} 
          sortable 
        />
        <Column 
          field="statut" 
          header="Statut" 
          body={statusBodyTemplate} 
          sortable 
        />
        <Column 
          body={actionBodyTemplate} 
          style={{ width: '6rem', textAlign: 'center' }} 
        />
      </DataTable>
    </div>
  );
};

export default FacturesList;
