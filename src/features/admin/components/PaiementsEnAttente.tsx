import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import adminService from '../adminService';
import type { PaiementEnAttente } from '../adminService';

const PaiementsEnAttente: React.FC = () => {
    const [factures, setFactures] = useState<PaiementEnAttente[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const toast = useRef<Toast>(null);

    // Charger les factures au montage du composant
    useEffect(() => {
        const chargerFactures = async () => {
            try {
                setLoading(true);
                setError('');

                // La méthode getPaiementsEnAttente renvoie déjà uniquement les paiements en attente
                const paiements = await adminService.getPaiementsEnAttente();

                setFactures(paiements);

                if (paiements.length === 0) {
                    setError('Aucun paiement en attente trouvé.');
                    if (toast.current) {
                        toast.current.show({
                            severity: 'info',
                            summary: 'Information',
                            detail: 'Aucun paiement en attente pour le moment',
                            life: 3000
                        });
                    }
                }
            } catch (error: any) {
                console.error('Erreur lors du chargement des paiements en attente:', error);
                const errorMessage = error?.message || 'Une erreur est survenue lors du chargement des paiements';
                setError(errorMessage);

                if (toast.current) {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: errorMessage,
                        life: 5000
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        chargerFactures();
    }, []);

    // Formatage du montant
    const formatMontant = (montant: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(montant);
    };

    // Formatage de la date
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
        } catch (e) {
            return 'Date invalide';
        }
    };

    // Template pour la colonne de l'intervenant
    const intervenantTemplate = (rowData: PaiementEnAttente) => {
        return (
            <div>
                <div className="font-medium">
                    {rowData.intervenant?.nom} {rowData.intervenant?.prenom}
                </div>
                <div className="text-sm text-gray-500">
                    {rowData.intervenant?.email || 'Email non disponible'}
                </div>
            </div>
        );
    };

    // Template pour la colonne de la mission
    const missionTemplate = (rowData: PaiementEnAttente) => {
        return (
            <div>
                <div className="font-medium">
                    {rowData.mission?.intitule || 'Sans titre'}
                </div>
                <div className="text-sm text-gray-500">
                    {rowData.mission?.ecole || 'École non spécifiée'}
                </div>
            </div>
        );
    };

    // Template pour la colonne du montant
    const montantTemplate = (rowData: PaiementEnAttente) => {
        return formatMontant(rowData.montant || 0);
    };

    // Template pour la colonne de la date
    const dateTemplate = (rowData: PaiementEnAttente) => {
        return formatDate(rowData.date_demande || new Date().toISOString());
    };

    // Template pour la colonne du statut
    const statutTemplate = (rowData: PaiementEnAttente) => {
        const raw = (rowData.statut as string) || 'en attente';
        // Normalize to accented display values
        const value =
            raw === 'payée' || raw === 'validé' ? 'payée' :
                raw === 'annulée' || raw === 'annulee' || raw === 'rejeté' ? 'annulée' :
                    raw;
        const severity = value === 'payée' ? 'success' : value === 'annulée' ? 'danger' : 'warning';
        return <Tag value={value} severity={severity as any} rounded />;
    };

    // Action: confirmation via pop-up puis validation
    const actionTemplate = (rowData: PaiementEnAttente) => {
        const performValidate = async () => {
            try {
                setProcessingId(rowData.id_facture);
                const res = await adminService.validerPaiement(rowData.id_facture);
                if (res.success) {
                    setFactures(prev => prev.map(f =>
                        f.id_facture === rowData.id_facture
                            ? { ...f, statut: 'payée' as any }
                            : f
                    ));
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Validé',
                        detail: res.message || 'Paiement validé avec succès',
                        life: 3000
                    });
                } else {
                    throw new Error(res.message || 'Échec de la validation');
                }
            } catch (e: any) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: e?.message || 'Erreur lors de la validation',
                    life: 4000
                });
            } finally {
                setProcessingId(null);
            }
        };

        const onValidateClick = () => {
            confirmDialog({
                message: 'Confirmer la validation de ce paiement ?',
                // title, icon and buttons
                header: 'Confirmation',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Valider',
                rejectLabel: 'Annuler',
                accept: performValidate
            });
        };

        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-check"
                    label="Valider"
                    className="p-button-success p-button-sm"
                    loading={processingId === rowData.id_facture}
                    onClick={onValidateClick}
                />
            </div>
        );
    };

    // Gestion du rafraîchissement
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="p-4">
            <Toast ref={toast} position="top-right" />
            <ConfirmDialog />

            <div className="flex justify-content-between align-items-center mb-4">
                <h2 className="m-0">
                    <i className="pi pi-credit-card mr-2"></i>
                    Factures en attente de paiement
                </h2>
                <Button
                    icon="pi pi-refresh"
                    label="Rafraîchir"
                    className="p-button-outlined"
                    onClick={handleRefresh}
                    disabled={loading}
                />
            </div>

            {loading ? (
                <div className="flex justify-content-center p-5">
                    <ProgressSpinner />
                </div>
            ) : error ? (
                <div className="p-4 border-round-lg bg-red-50 border-1 border-red-200">
                    <div className="flex align-items-center">
                        <i className="pi pi-exclamation-circle text-red-600 mr-3" style={{ fontSize: '1.5rem' }}></i>
                        <p className="m-0">{error}</p>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <DataTable
                        value={factures}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} factures"
                        emptyMessage="Aucune facture en attente trouvée"
                        loading={loading}
                        responsiveLayout="scroll"
                        stripedRows
                        dataKey="id_facture"
                    >
                        <Column field="id_facture" header="N° Facture" sortable style={{ minWidth: '120px' }} />
                        <Column
                            field="intervenant"
                            header="Intervenant"
                            body={intervenantTemplate}
                            sortable
                            sortField="intervenant.nom"
                            style={{ minWidth: '200px' }}
                        />
                        <Column
                            field="mission"
                            header="Mission"
                            body={missionTemplate}
                            style={{ minWidth: '250px' }}
                        />
                        <Column
                            field="montant"
                            header="Montant"
                            body={montantTemplate}
                            sortable
                            style={{ minWidth: '120px', textAlign: 'right' }}
                        />
                        <Column
                            field="date_demande"
                            header="Date de demande"
                            body={dateTemplate}
                            sortable
                            style={{ minWidth: '150px' }}
                        />
                        <Column
                            field="statut"
                            header="Statut"
                            body={statutTemplate}
                            sortable
                            style={{ minWidth: '140px' }}
                        />
                        <Column
                            header="Action"
                            body={actionTemplate}
                            style={{ minWidth: '140px', textAlign: 'center' }}
                        />
                    </DataTable>
                </div>
            )}
        </div>
    );
};

export default PaiementsEnAttente;