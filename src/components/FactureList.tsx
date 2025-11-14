import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { getIdEcoleConnectee } from '../services/ecoleService';

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

const FactureList: React.FC = () => {
    const [factures, setFactures] = useState<Facture[]>([]);
    const [loading, setLoading] = useState(true);
    const [factureSelected, setFactureSelected] = useState<Facture | null>(null);
    const [factureHTML, setFactureHTML] = useState<string>('');
    const [displaySidebar, setDisplaySidebar] = useState(false);

    useEffect(() => {
        const fetchFactures = async () => {
            try {
                const ecoleId = getIdEcoleConnectee();
                if (!ecoleId) {
                    setLoading(false);
                    return;
                }
                const res = await fetch(`${API_URL}/api/factures/ecole/${ecoleId}`, {
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

    const openSidebar = async (facture: Facture) => {
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
        window.open(`${API_URL}/api/factures/download/${id}`, '_blank');
    };

    return (
        <div className="card">
            <h2 className="mb-4 text-900 font-bold">Factures</h2>

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
                            <Button
                                icon="pi pi-eye"
                                className="p-button-sm p-button-info"
                                onClick={() => openSidebar(row)}
                                tooltip="Aperçu"
                                tooltipOptions={{ position: 'top' }}
                            />
                            <Button
                                icon="pi pi-file-pdf"
                                className="p-button-sm p-button-danger"
                                onClick={() => downloadPDF(row.id_facture)}
                                tooltip="Télécharger PDF"
                                tooltipOptions={{ position: 'top' }}
                            />
                            {row.statut === 'à payer' && (
                                <Button
                                    icon="pi pi-money-bill"
                                    className="p-button-sm p-button-success"
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                            // Mettre à jour le statut dans la base de données
                                            console.log('Mise à jour du statut de la facture', row.id_facture);
                                            const response = await fetch(`${API_URL}/api/factures/${row.id_facture}/statut`, {
                                                method: 'PATCH',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Accept': 'application/json',
                                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                                                },
                                                credentials: 'include',
                                                body: JSON.stringify({ statut: 'en attente' })
                                            });

                                            console.log('Réponse du serveur:', response.status, await response.text().catch(e => e));

                                            if (!response.ok) {
                                                throw new Error('Erreur lors de la mise à jour du statut');
                                            }

                                            // Mettre à jour l'interface utilisateur après confirmation du serveur
                                            const updatedFactures = factures.map(f =>
                                                f.id_facture === row.id_facture
                                                    ? { ...f, statut: 'en attente' }
                                                    : f
                                            );
                                            setFactures(updatedFactures);

                                        } catch (error) {
                                            console.error('Erreur lors de la mise à jour du statut:', error);
                                            alert('Erreur lors de la mise à jour du statut. Veuillez réessayer.');
                                        }
                                    }}
                                    tooltip={`Payer la facture pour ${row.nom_ecole}`}
                                    tooltipOptions={{ position: 'top' }}
                                />
                            )}
                        </div>
                    )}
                    style={{ width: '180px' }}
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

export default FactureList;
