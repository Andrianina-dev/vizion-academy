import React, { useEffect, useRef, useState } from 'react';
import adminService from '../adminService';
import type { IntervenantPending } from '../adminService';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';

const IntervenantsPendingPage: React.FC = () => {
    const [items, setItems] = useState<IntervenantPending[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const toast = useRef<Toast>(null);

    const load = async () => {
        try {
            setLoading(true);
            const data = await adminService.getPendingIntervenants();
            setItems(data);
        } catch (e: any) {
            setError(e?.message || 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const statutBodyTemplate = (rowData: IntervenantPending) => {
        return (
            <Tag
                value={rowData.statut_validation === 0 ? 'En attente' : 'Validé'}
                severity={rowData.statut_validation === 0 ? 'warning' : 'success'}
                icon={rowData.statut_validation === 0 ? 'pi pi-clock' : 'pi pi-check'}
            />
        );
    };

    const actionBodyTemplate = (rowData: IntervenantPending) => {
        const onValidate = () => {
            confirmDialog({
                message: `Confirmez-vous la validation du profil de ${rowData.prenom_intervenant} ${rowData.nom_intervenant} ?`,
                header: 'Confirmer la validation',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Oui',
                rejectLabel: 'Non',
                accept: async () => {
                    try {
                        const res = await adminService.approveIntervenant(rowData.id_intervenant);
                        if (res.success) {
                            toast.current?.show({ severity: 'success', summary: 'Validé', detail: res.message || 'Intervenant validé', life: 3000 });
                            await load();
                        } else {
                            toast.current?.show({ severity: 'warn', summary: 'Échec', detail: res.message || 'Validation échouée', life: 4000 });
                        }
                    } catch (e: any) {
                        toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e?.message || 'Erreur lors de la validation', life: 4000 });
                    }
                }
            });
        };

        const onReject = () => {
            confirmDialog({
                message: `Rejeter le profil de ${rowData.prenom_intervenant} ${rowData.nom_intervenant} ?`,
                header: 'Confirmer le rejet',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Oui',
                rejectLabel: 'Non',
                accept: async () => {
                    try {
                        const res = await adminService.rejectIntervenant(rowData.id_intervenant);
                        if (res.success) {
                            toast.current?.show({ severity: 'success', summary: 'Rejeté', detail: res.message || 'Intervenant rejeté', life: 3000 });
                            await load();
                        } else {
                            toast.current?.show({ severity: 'warn', summary: 'Échec', detail: res.message || 'Rejet échoué', life: 4000 });
                        }
                    } catch (e: any) {
                        toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e?.message || 'Erreur lors du rejet', life: 4000 });
                    }
                }
            });
        };

        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-check"
                    label="Valider"
                    className="p-button-success p-button-sm"
                    onClick={onValidate}
                />
                <Button
                    icon="pi pi-times"
                    label="Rejeter"
                    className="p-button-danger p-button-sm"
                    onClick={onReject}
                />
            </div>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex align-items-center gap-2">
                <i className="pi pi-users text-2xl text-primary"></i>
                <span className="text-xl font-bold text-900">Intervenants en attente</span>
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <Button
                icon="pi pi-refresh"
                label="Actualiser"
                className="p-button-outlined p-button-secondary"
                onClick={load}
                loading={loading}
            />
        );
    };

    const emptyMessage = (
        <div className="flex flex-column align-items-center justify-content-center py-6">
            <i className="pi pi-inbox text-5xl text-400 mb-3"></i>
            <span className="text-600 text-lg">Aucun intervenant en attente de validation</span>
            <p className="text-500 mt-2">Tous les intervenants ont été validés.</p>
        </div>
    );

    return (
        <div className="p-3">
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="grid">
                <div className="col-12">
                    <Card>
                        <Toolbar
                            className="mb-4"
                            left={leftToolbarTemplate}
                            right={rightToolbarTemplate}
                        />

                        {error && (
                            <div className="flex align-items-center mb-4 gap-2">
                                <Message
                                    severity="error"
                                    text={error}
                                    className="w-full"
                                />
                                <Button
                                    icon="pi pi-times"
                                    className="p-button-text p-button-rounded p-button-danger"
                                    onClick={() => setError('')}
                                    aria-label="Fermer le message d'erreur"
                                />
                            </div>
                        )}

                        {loading && items.length === 0 ? (
                            <div className="flex justify-content-center align-items-center py-6">
                                <ProgressSpinner />
                            </div>
                        ) : (
                            <DataTable
                                value={items}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 20, 50]}
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} intervenants"
                                emptyMessage={emptyMessage}
                                loading={loading}
                                className="p-datatable-sm"
                                stripedRows
                            >
                                <Column
                                    field="nom_intervenant"
                                    header="Nom"
                                    sortable
                                    style={{ minWidth: '120px' }}
                                />
                                <Column
                                    field="prenom_intervenant"
                                    header="Prénom"
                                    sortable
                                    style={{ minWidth: '120px' }}
                                />
                                <Column
                                    field="email_login"
                                    header="Email"
                                    sortable
                                    style={{ minWidth: '200px' }}
                                />
                                <Column
                                    field="statut_validation"
                                    header="Statut"
                                    body={statutBodyTemplate}
                                    style={{ minWidth: '130px' }}
                                />
                                <Column
                                    header="Action"
                                    body={actionBodyTemplate}
                                    style={{ minWidth: '120px' }}
                                    alignHeader={'center'}
                                />
                            </DataTable>
                        )}
                    </Card>
                </div>
            </div>

            {/* Statistiques */}
            {items.length > 0 && (
                <div className="grid mt-3">
                    <div className="col-12 md:col-3">
                        <Card className="bg-blue-50 border-1 border-blue-200">
                            <div className="flex justify-content-between align-items-center">
                                <div>
                                    <div className="text-blue-600 font-semibold">Total en attente</div>
                                    <div className="text-2xl font-bold text-blue-700">{items.length}</div>
                                </div>
                                <i className="pi pi-clock text-3xl text-blue-500"></i>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntervenantsPendingPage;