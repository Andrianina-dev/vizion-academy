import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
// import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import FavorisService from '../services/FavorisService';
import type { IntervenantFavori } from '../services/FavorisService';

interface Props {
    ecoleId: string;
}

const ListeIntervenantsFavoris: React.FC<Props> = ({ ecoleId }) => {
    const [intervenants, setIntervenants] = useState<IntervenantFavori[]>([]);
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        if (ecoleId) loadIntervenants();
    }, [ecoleId]);

    const loadIntervenants = async () => {
        setLoading(true);
        try {
            const response = await FavorisService.getIntervenantsFavoris(ecoleId);
            if (response.success) {
                const data = response.data ?? [];
                // On crée nom_complet et valeurs par défaut
                const formatted = data.map(i => ({
                    ...i,
                    nom_complet: `${i.nom_intervenant} ${i.prenom_intervenant}`,
                    domaines: i.domaines ?? [],
                    langues: i.langues ?? [],
                    is_favori: true,
                    has_collaborated: false
                }));
                setIntervenants(formatted);
            } else {
                toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les favoris', life: 5000 });
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur de connexion au serveur', life: 5000 });
        } finally {
            setLoading(false);
        }
    };

    const photoTemplate = (row: IntervenantFavori) => (
        <img
            src={row.photo_intervenant || '/default-avatar.png'}
            alt={row.nom_complet}
            className="w-3rem h-3rem border-circle shadow-2"
            onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
        />
    );

const domainesTemplate = (row: IntervenantFavori) => (
    <div className="flex flex-wrap gap-1">
        {(row.domaines ?? []).slice(0, 2).map((d, i) => (
            <Tag key={i} value={d} severity="info" className="text-xs" />
        ))}
        {row.domaines && row.domaines.length > 2 && (
            <Tag value={`+${row.domaines.length - 2}`} severity="warning" className="text-xs" />
        )}
    </div>
);

const languesTemplate = (row: IntervenantFavori) => (
    <div className="flex flex-wrap gap-1">
        {(row.langues ?? []).slice(0, 2).map((l, i) => (
            <Tag key={i} value={l} severity="success" className="text-xs" />
        ))}
        {row.langues && row.langues.length > 2 && (
            <Tag value={`+${row.langues.length - 2}`} severity="success" className="text-xs" />
        )}
    </div>
);


    const disponibiliteTemplate = (row: IntervenantFavori) => (
        row.disponibilite ? <Tag value="Disponible" severity="success" /> : <Tag value="Indisponible" severity="danger" />
    );

    return (
        <div className="grid">
            <div className="col-12">
                <Toast ref={toast} />
                <ConfirmDialog />

                <Card title="Mes Intervenants Favoris" className="shadow-2">
                    <DataTable
                        value={intervenants}
                        loading={loading}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        emptyMessage="Aucun intervenant trouvé"
                        removableSort
                        showGridlines
                    >
                        <Column header="Photo" body={photoTemplate} style={{ width: '80px' }} />
                        <Column field="nom_complet" header="Nom" sortable />
                        <Column field="ville" header="Ville" sortable />
                        <Column header="Domaines" body={domainesTemplate} />
                        <Column header="Langues" body={languesTemplate} />
                        <Column header="Disponibilité" body={disponibiliteTemplate} sortable />
                        <Column field="email_login" header="Email" />
                        <Column field="diplome" header="Diplôme" />
                        <Column field="cv" header="CV" />
                        <Column field="video" header="Vidéo" />
                    </DataTable>
                </Card>
            </div>
        </div>
    );
};

export default ListeIntervenantsFavoris;
