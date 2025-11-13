import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import adminService from '../adminService';
import type { PaiementEnAttente } from '../adminService';
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
            setPaiements(data || []); // S'assurer que data est toujours un tableau
            
            if (data.length === 0) {
                console.log('Aucun paiement en attente trouvé');
            }
        } catch (error: any) {
            console.error('Erreur lors du chargement des paiements:', error);
            
            // Ne pas afficher d'erreur si c'est une erreur 401 (non autorisé)
            if (error?.response?.status === 401) {
                console.log('Non autorisé, redirection vers la page de connexion...');
                // L'intercepteur s'occupera de la redirection
                return;
            }
            
            // Pour les autres erreurs, on affiche un message à l'utilisateur
            const errorMessage = error.response?.data?.message || 'Impossible de charger les paiements. Veuillez réessayer plus tard.';
            setError(errorMessage);
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
                <div className="flex flex-column justify-content-center align-items-center" style={{ height: '50vh' }}>
                    <ProgressSpinner />
                    <p className="mt-3">Chargement des paiements en attente...</p>
                </div>
            )}
            
            {error && (
                <div className="p-4">
                    <div className="p-4 border-round border-1 border-red-500 bg-red-100 text-red-700">
                        <i className="pi pi-exclamation-triangle mr-2"></i>
                        {error}
                    </div>
                    <Button 
                        label="Réessayer" 
                        icon="pi pi-refresh" 
                        className="mt-3" 
                        onClick={fetchPaiements}
                    />
                </div>
            )}
            
            {!loading && !error && paiements.length === 0 && (
                <div className="p-4 text-center">
                    <i className="pi pi-check-circle text-6xl text-green-500 mb-3"></i>
                    <h3 className="text-2xl font-medium mb-2">Aucun paiement en attente</h3>
                    <p className="text-gray-600 mb-4">Tous les paiements ont été traités.</p>
                    <Button 
                        label="Actualiser" 
                        icon="pi pi-refresh" 
                        className="p-button-outlined" 
                        onClick={fetchPaiements}
                    />
                </div>
            )}
            
            {!loading && !error && paiements.length > 0 && (
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
