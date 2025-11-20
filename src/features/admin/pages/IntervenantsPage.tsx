import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import type { Intervenant } from '../../../services/intervenantService';
import adminService from '../adminService';

const IntervenantsPage: React.FC = () => {
    const [items, setItems] = useState<Intervenant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const toast = useRef<Toast>(null);

    const load = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllIntervenants();
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

    const getStatutValidationTag = (statut: number) => {
        switch (statut) {
            case 0:
                return <Tag value="En attente" severity="warning" />;
            case 1:
                return <Tag value="Validé" severity="success" />;
            case 2:
                return <Tag value="Rejeté" severity="danger" />;
            default:
                return <Tag value="Inconnu" severity="info" />;
        }
    };

    const dateBodyTemplate = (rowData: any, field: string) => {
        if (!rowData[field]) return '-';
        const date = new Date(rowData[field]);
        return date.toLocaleDateString('fr-FR');
    };

    const actionsBodyTemplate = (rowData: Intervenant) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-info p-button-text"
                    tooltip="Voir les détails"
                    onClick={() => {
                        // TODO: Implémenter la vue des détails
                        console.log('Voir détails:', rowData);
                    }}
                />
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center min-h-screen">
                <ProgressSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <Message severity="error" text={error} />
            </div>
        );
    }

    return (
        <div className="p-4">
            <Toast ref={toast} />

            <Toolbar
                className="mb-4"
                left={
                    <div className="flex gap-2">
                        <Button
                            label="Actualiser"
                            icon="pi pi-refresh"
                            onClick={load}
                            className="p-button-outlined"
                        />
                    </div>
                }
                right={
                    <div className="flex gap-2">
                        <Button
                            label="Intervenants en attente"
                            icon="pi pi-clock"
                            className="p-button-outlined p-button-warning"
                            onClick={() => window.location.href = '/admin/intervenants/en-attente'}
                        />
                    </div>
                }
            />

            <Card>
                <h1 className="text-2xl font-bold mb-4">Tous les Intervenants</h1>

                <DataTable
                    value={items}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    className="p-datatable-sm"
                    emptyMessage="Aucun intervenant trouvé"
                    filterDisplay="row"
                    responsiveLayout="scroll"
                >
                    <Column
                        field="id_intervenant"
                        header="ID"
                        sortable
                        style={{ minWidth: '80px' }}
                    />
                    <Column
                        field="nom_intervenant"
                        header="Nom"
                        sortable
                        filter
                        filterPlaceholder="Rechercher..."
                        style={{ minWidth: '150px' }}
                    />
                    <Column
                        field="prenom_intervenant"
                        header="Prénoms"
                        sortable
                        filter
                        filterPlaceholder="Rechercher..."
                        style={{ minWidth: '150px' }}
                    />
                    <Column
                        field="email_login"
                        header="Email"
                        sortable
                        filter
                        filterPlaceholder="Rechercher..."
                        style={{ minWidth: '200px' }}
                    />
                    <Column
                        field="telephone"
                        header="Téléphone"
                        sortable
                        body={(rowData) => rowData.telephone || '-'}
                        style={{ minWidth: '120px' }}
                    />
                    <Column
                        field="ville"
                        header="Ville"
                        sortable
                        filter
                        filterPlaceholder="Rechercher..."
                        body={(rowData) => rowData.ville || '-'}
                        style={{ minWidth: '120px' }}
                    />
                    <Column
                        field="disponibilite"
                        header="Disponibilité"
                        sortable
                        body={(rowData) => {
                            if (rowData.disponibilite === true || rowData.disponibilite === 1) {
                                return <Tag value="Disponible" severity="success" />;
                            } else {
                                return <Tag value="Indisponible" severity="secondary" />;
                            }
                        }}
                        style={{ minWidth: '120px' }}
                    />
                    <Column
                        field="statut_validation"
                        header="Statut"
                        sortable
                        body={(rowData) => getStatutValidationTag(rowData.statut_validation)}
                        style={{ minWidth: '120px' }}
                    />
                    <Column
                        field="date_creation"
                        header="Date de création"
                        sortable
                        body={(rowData) => dateBodyTemplate(rowData, 'date_creation')}
                        style={{ minWidth: '150px' }}
                    />
                    <Column
                        header="Actions"
                        body={actionsBodyTemplate}
                        style={{ minWidth: '100px' }}
                    />
                </DataTable>
            </Card>
        </div>
    );
};

export default IntervenantsPage;
