import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { getIntervenantConnecte } from '../services/intervenantService';

interface Facture {
  id_facture: string;
  titre_mission: string;
  nom_ecole: string;
  montant: number;
  date_creation: string;
  date_paiement: string | null;
  statut: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const FactureListIntervenant: React.FC = () => {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [factureSelected, setFactureSelected] = useState<Facture | null>(null);
  const [factureHTML, setFactureHTML] = useState<string>('');
  const [displaySidebar, setDisplaySidebar] = useState(false);

  useEffect(() => {
    let ran = false; // StrictMode guard
    const fetchFactures = async () => {
      try {
        const intervenant = getIntervenantConnecte();
        const intervenantId = intervenant?.id_intervenant;
        if (!intervenantId) {
          setLoading(false);
          return;
        }
        if (ran) return; ran = true;
        // Tenter de générer automatiquement une facture depuis la dernière mission (idempotent côté backend)
        try {
          await fetch(`${API_URL}/api/factures/intervenant/${intervenantId}/generate-latest`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
        } catch {}

        // Puis récupérer la liste des factures
        const res = await fetch(`${API_URL}/api/factures/intervenant/${intervenantId}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) setFactures(data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFactures();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatMontant = (montant: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);

  const statutTemplate = (rowData: Facture) => {
    const normalized = (rowData.statut || '').toLowerCase();
    const severity =
      normalized === 'payée' || normalized === 'payee' ? 'success' :
      rowData.statut === 'en attente' ? 'warning' :
      rowData.statut === 'en validation' ? 'info' :
      'secondary';
    return <Tag value={rowData.statut} severity={severity} />;
  };

  const isValidId = (id: any) => (typeof id === 'string' && id.length > 0) || (typeof id === 'number' && id > 0);

  const openSidebar = async (facture: Facture) => {
    if (!isValidId(facture.id_facture)) return;
    setFactureSelected(facture);
    setDisplaySidebar(true);

    try {
      const res = await fetch(`${API_URL}/api/factures/preview/${facture.id_facture}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setFactureHTML(data.html);
      else setFactureHTML('<p>Impossible de charger l\'aperçu.</p>');
    } catch (error) {
      setFactureHTML('<p>Erreur de connexion au serveur.</p>');
    }
  };

  const downloadPDF = (id: string) => {
    if (!isValidId(id)) return;
    window.open(`${API_URL}/api/factures/download/${id}`, '_blank');
  };

  return (
    <div className="card">
      <h2 className="mb-4 text-900 font-bold">Mes Factures</h2>

      <DataTable value={factures} paginator rows={10} loading={loading} emptyMessage="Aucune facture">
        <Column field="id_facture" header="ID" sortable />
        <Column field="titre_mission" header="Mission" sortable />
        <Column field="nom_ecole" header="École" sortable />
        <Column field="montant" header="Montant" body={(row) => formatMontant(row.montant)} sortable />
        <Column field="date_creation" header="Date création" body={(row) => formatDate(row.date_creation)} sortable />
        <Column field="date_paiement" header="Date paiement" body={(row) => formatDate(row.date_paiement)} sortable />
        <Column field="statut" header="Statut" body={statutTemplate} sortable />
        <Column
          header="Actions"
          body={(row) => (
            <div className="flex gap-2">
              <Button label="Aperçu" icon="pi pi-eye" onClick={() => openSidebar(row)} disabled={!isValidId(row.id_facture)} />
              <Button label="PDF" icon="pi pi-file-pdf" severity="danger" onClick={() => downloadPDF(row.id_facture)} disabled={!isValidId(row.id_facture)} />
            </div>
          )}
        />
      </DataTable>

      {/* Sidebar pour l’aperçu avec HTML Laravel */}
      <Sidebar visible={displaySidebar} position="right" onHide={() => setDisplaySidebar(false)} baseZIndex={1000} style={{ width: '600px' }}>
        {factureSelected && (
          <div className="p-4" style={{ overflowY: 'auto', maxHeight: '90vh' }}>
            <h3 className="mb-4">Facture #{factureSelected.id_facture}</h3>
            <div dangerouslySetInnerHTML={{ __html: factureHTML }} />

            <div className="mt-4 flex justify-content-end">
              <Button label="Télécharger PDF" icon="pi pi-file-pdf" severity="danger" onClick={() => downloadPDF(factureSelected.id_facture)} />
            </div>
          </div>
        )}
      </Sidebar>
    </div>
  );
};

export default FactureListIntervenant;
