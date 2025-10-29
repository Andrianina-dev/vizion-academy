import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { getIdEcoleConnectee } from '../services/ecoleService';

interface Facture {
    id_facture: string;
    mission_id: string;
    intervenant_id: string;
    ecole_id: string;
    nom_ecole: string;
    titre_mission: string;
    montant: number;
    date_creation: string;
    date_paiement: string | null;
    statut: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const FactureList: React.FC = () => {
    const [factures, setFactures] = useState<Facture[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = React.useRef<Toast>(null);

    const getEcoleConnecteeId = (): string => {
        return getIdEcoleConnectee() || '';
    };

    // Charger les factures
    useEffect(() => {
        const fetchFactures = async () => {
            const ecoleId = getEcoleConnecteeId();
            if (!ecoleId) {
                console.error('Aucun ID école trouvé');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/factures/ecole/${ecoleId}`);
                const data = await response.json();
                if (data.success) setFactures(data.data || []);
            } catch (error) {
                console.error('Erreur chargement factures :', error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les factures',
                    life: 3000,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchFactures();
    }, []);

    // Statut coloré
    const statutTemplate = (rowData: Facture) => {
        const severity =
            rowData.statut === 'payée' ? 'success' :
            rowData.statut === 'en attente' ? 'warning' :
            rowData.statut === 'en validation' ? 'info' :
            'secondary';
        return <Tag value={rowData.statut} severity={severity} />;
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const formatMontant = (montant: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(montant);
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <h2 className="text-900 font-bold mb-4">Les factures</h2>

            <DataTable 
                value={factures} 
                loading={loading} 
                paginator 
                rows={10} 
                responsiveLayout="scroll"
                emptyMessage="Aucune facture trouvée"
            >
                <Column field="id_facture" header="ID Facture" sortable />
                <Column field="titre_mission" header="Mission" sortable />
                <Column 
                    field="date_creation" 
                    header="Date création" 
                    body={(row) => formatDate(row.date_creation)}
                    sortable 
                />
                <Column 
                    field="date_paiement" 
                    header="Date paiement" 
                    body={(row) => formatDate(row.date_paiement)}
                    sortable 
                />
                <Column 
                    field="montant" 
                    header="Montant" 
                    body={(row) => formatMontant(row.montant)}
                    sortable 
                />
                <Column field="statut" header="Statut" body={statutTemplate} sortable />
            </DataTable>
        </div>
    );
};

export default FactureList;
