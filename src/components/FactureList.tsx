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

interface Favori {
    id_intervenant: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const FactureList: React.FC = () => {
    const [factures, setFactures] = useState<Facture[]>([]);
    const [favoris, setFavoris] = useState<Favori[]>([]);
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
            } finally {
                setLoading(false);
            }
        };

        fetchFactures();
    }, []);

    // Charger les favoris
    useEffect(() => {
        const fetchFavoris = async () => {
            const ecoleId = getEcoleConnecteeId();
            if (!ecoleId) return;

            try {
                const response = await fetch(`${API_URL}/api/intervenants/favoris/${ecoleId}`);
                const data = await response.json();
                if (data.success) setFavoris(data.data || []);
            } catch (error) {
                console.error('Erreur chargement favoris :', error);
            }
        };

        fetchFavoris();
    }, []);

    // Vérifie si un intervenant est en favoris
    const isFavori = (intervenantId: string) => {
        return favoris.some(f => f.id_intervenant === intervenantId);
    };

    // Ajouter ou retirer un favori
    const toggleFavori = async (intervenantId: string) => {
        const ecoleId = getEcoleConnecteeId();
        if (!ecoleId) return;

        const dejaFavori = isFavori(intervenantId);
        const method = dejaFavori ? 'DELETE' : 'POST';
        const endpoint = dejaFavori
            ? `${API_URL}/api/intervenants/favoris/remove`
            : `${API_URL}/api/intervenants/favoris/add`;

        try {
            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ecole_id: ecoleId, intervenant_id: intervenantId }),
            });

            const data = await response.json();

            if (data.success) {
                // Mise à jour de la liste des favoris localement sans rechargement
                setFavoris(prev =>
                    dejaFavori
                        ? prev.filter(f => f.id_intervenant !== intervenantId)
                        : [...prev, { id_intervenant: intervenantId }]
                );

                toast.current?.show({
                    severity: dejaFavori ? 'warn' : 'success',
                    summary: dejaFavori ? 'Retiré' : 'Ajouté',
                    detail: dejaFavori
                        ? 'Intervenant retiré des favoris'
                        : 'Intervenant ajouté aux favoris',
                    life: 2000,
                });
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: data.message || 'Impossible de modifier les favoris',
                    life: 3000,
                });
            }
        } catch (error) {
            console.error('Erreur lors du toggle favori :', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Problème de connexion avec le serveur',
                life: 3000,
            });
        }
    };

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

    // Étoile jaune cliquable
    const favoriTemplate = (rowData: Facture) => {
        const favori = isFavori(rowData.intervenant_id);
        return (
            <i
                className={`pi ${favori ? 'pi-star-fill' : 'pi-star'} text-yellow-500 cursor-pointer`}
                onClick={() => toggleFavori(rowData.intervenant_id)}
                style={{ fontSize: '1.5rem' }}
                title={favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            />
        );
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
                <Column header="Favori" body={favoriTemplate} />
            </DataTable>
        </div>
    );
};

export default FactureList;
