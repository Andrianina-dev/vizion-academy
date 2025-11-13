import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { adminService, type PaiementEnAttente } from '../adminService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PaiementsEnAttente: React.FC = () => {
    const [paiements, setPaiements] = useState<PaiementEnAttente[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const toast = useRef<Toast>(null);

    const fetchPaiements = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await adminService.getPaiementsEnAttente();
            setPaiements(data);
        } catch (error: any) {
            console.error('Erreur lors du chargement des paiements:', error);
            
            // Ne pas afficher d'erreur si c'est une erreur 401 (non autorisé)
            if (!error?.response || error.response.status !== 401) {
                const errorMessage = error.response?.data?.message || 'Impossible de charger les paiements. Veuillez réessayer plus tard.';
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaiements();
    }, []);

    const showError = (summary: string, detail: string) => {
        toast.current?.show({
            severity: 'error',
            summary,
            detail,
            life: 5000
        });
    };

    const showSuccess = (summary: string, detail: string) => {
        toast.current?.show({
            severity: 'success',
            summary,
            detail,
            life: 3000
        });
    };

    const handleValiderPaiement = async (idFacture: string) => {
        try {
            setLoading(true);
            const result = await adminService.validerPaiement(idFacture);
            
            if (result.success) {
                // Mettre à jour uniquement le statut du paiement dans la liste
                setPaiements(paiements.map(p => 
                    p.id_facture === idFacture 
                        ? { ...p, statut: 'validé' as const } 
                        : p
                ));
                showSuccess('Succès', 'Le statut du paiement a été mis à jour avec succès');
            } else {
                showError('Erreur', result.message || 'Échec de la mise à jour du statut');
            }
        } catch (error) {
            console.error('Erreur lors de la validation du paiement:', error);
            showError('Erreur', 'Une erreur est survenue lors de la mise à jour du statut');
        } finally {
            setLoading(false);
        }
    };

    const handleRejeterPaiement = async (idFacture: string) => {
        try {
            setLoading(true);
            const result = await adminService.rejeterPaiement(idFacture);
            
            if (result.success) {
                // Mettre à jour uniquement le statut du paiement dans la liste
                setPaiements(paiements.map(p => 
                    p.id_facture === idFacture 
                        ? { ...p, statut: 'rejeté' as const } 
                        : p
                ));
                showSuccess('Succès', 'Le statut du paiement a été mis à jour avec succès');
            } else {
                showError('Erreur', result.message || 'Échec de la mise à jour du statut');
            }
        } catch (error) {
            console.error('Erreur lors du rejet du paiement:', error);
            showError('Erreur', 'Une erreur est survenue lors de la mise à jour du statut');
        } finally {
            setLoading(false);
        }
    };

    const actionBodyTemplate = (rowData: PaiementEnAttente) => {
        // Ne pas afficher les boutons si le paiement est déjà traité
        if (rowData.statut && rowData.statut !== 'en_attente') {
            return (
                <span className={`p-tag p-tag-${rowData.statut === 'validé' ? 'success' : 'danger'}`}>
                    {rowData.statut === 'validé' ? 'Validé' : 'Rejeté'}
                </span>
            );
        }

        return (
            <div className="flex gap-2">
                <Button 
                    icon="pi pi-check" 
                    className="p-button-success p-button-sm"
                    onClick={() => handleValiderPaiement(rowData.id_facture)}
                    tooltip="Valider le paiement"
                    tooltipOptions={{ position: 'top' }}
                    disabled={loading}
                />
                <Button 
                    icon="pi pi-times" 
                    className="p-button-danger p-button-sm"
                    onClick={() => handleRejeterPaiement(rowData.id_facture)}
                    tooltip="Rejeter le paiement"
                    tooltipOptions={{ position: 'top' }}
                    disabled={loading}
                />
            </div>
        );
    };

    const statutBodyTemplate = (_: PaiementEnAttente) => {
        return (
            <Button 
                label="En attente" 
                icon="pi pi-clock" 
                className="p-button-warning p-button-sm"
                tooltip="Paiement en attente de validation"
                tooltipOptions={{ position: 'top' }}
                disabled
            />
        );
    };

    const montantBodyTemplate = (rowData: PaiementEnAttente) => {
        return new Intl.NumberFormat('fr-FR', { 
            style: 'currency', 
            currency: 'EUR' 
        }).format(rowData.montant);
    };

    const dateBodyTemplate = (rowData: PaiementEnAttente) => {
        return format(new Date(rowData.date_demande), 'PPP', { locale: fr });
    };

    const intervenantBodyTemplate = (rowData: PaiementEnAttente) => {
        return (
            <div className="flex items-center gap-2">
                <div>
                    <div className="font-medium">{rowData.intervenant.prenom} {rowData.intervenant.nom}</div>
                    <div className="text-sm text-gray-500">{rowData.intervenant.email}</div>
                </div>
            </div>
        );
    };

    const missionBodyTemplate = (rowData: PaiementEnAttente) => {
        return (
            <div>
                <div className="font-medium">{rowData.mission.intitule}</div>
                <div className="text-sm text-gray-500">{rowData.mission.ecole}</div>
            </div>
        );
    };

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <h2 className="text-xl font-bold mb-4">Paiements en attente</h2>
            
            {loading && (
                <div className="flex justify-center items-center h-64">
                    <ProgressSpinner />
                </div>
            )}
            
            {error && (
                <div className="card p-3">
                    <div className="p-3 border-round border-1 border-300 bg-red-50">
                        <div className="text-red-600 font-medium mb-2">Erreur</div>
                        <div className="text-600">{error}</div>
                    </div>
                </div>
            )}
            
            {!loading && !error && (
                <div className="card">
                    <DataTable 
                        value={paiements} 
                        paginator 
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} paiements"
                        emptyMessage="Aucun paiement en attente"
                        className="p-datatable-sm"
                        loading={loading}
                        dataKey="id_facture"
                    >
                        <Column field="intervenant" header="Intervenant" body={intervenantBodyTemplate} sortable />
                        <Column field="mission" header="Mission" body={missionBodyTemplate} sortable />
                        <Column field="montant" header="Montant" body={montantBodyTemplate} sortable />
                        <Column field="virement" header="Référence virement" sortable />
                        <Column field="date_demande" header="Date de demande" body={dateBodyTemplate} sortable />
                        <Column body={statutBodyTemplate} header="Statut" style={{ width: '150px' }} />
                        <Column body={actionBodyTemplate} header="Actions" style={{ width: '180px' }} />
                    </DataTable>
                </div>
            )}
        </div>
    );
};

export default PaiementsEnAttente;
