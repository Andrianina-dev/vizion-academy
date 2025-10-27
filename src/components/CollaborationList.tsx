import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Avatar } from 'primereact/avatar';
import { Card } from 'primereact/card';
import { getIdEcoleConnectee } from '../services/ecoleService';

interface Collaboration {
    mission_id: string;
    intervenant_id: string;
    ecole_id: string;
    nom_ecole: string;
    nom_intervenant: string;
    prenom_intervenant: string;
    titre_mission: string;
    montant: number;
}

const API_URL = import.meta.env.VITE_API_URL;

const CollaborationList: React.FC = () => {
    const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
    const [loading, setLoading] = useState(true);

    // Récupérer l'ID de l'école connectée
    const getEcoleConnecteeId = (): string => {
        return getIdEcoleConnectee() || '';
    };

    // Charger les collaborations de l'école connectée
    useEffect(() => {
        const fetchCollaborations = async () => {
            const ecoleId = getEcoleConnecteeId();
            
            if (!ecoleId) {
                console.error('Aucun ID école trouvé');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/collaborations/intervenant/ecole/${ecoleId}`);
                const data = await response.json();
                console.log('Réponse collaborations:', data);

                if (data.success) {
                    setCollaborations(data.data || []);
                } else {
                    console.error('Erreur API:', data.message);
                    setCollaborations([]);
                }
            } catch (error) {
                console.error("Erreur lors du chargement de l'historique :", error);
                setCollaborations([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCollaborations();
    }, []);

    // ✅ Affichage du montant formaté
    const montantTemplate = (rowData: Collaboration) => (
        <Tag
            value={rowData.montant.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR'
            })}
            severity="success"
            rounded
        />
    );

    // ✅ Affichage de l'intervenant avec avatar
    const intervenantTemplate = (rowData: Collaboration) => (
        <div className="flex items-center gap-3">
            <Avatar
                label={rowData.prenom_intervenant.charAt(0)}
                size="large"
                className="bg-indigo-500 text-white"
                shape="circle"
            />
            <div>
                <span className="font-medium text-gray-900">
                    {rowData.prenom_intervenant} {rowData.nom_intervenant}
                </span>
                <div className="text-gray-500 text-sm">ID : {rowData.intervenant_id}</div>
            </div>
        </div>
    );

    // ✅ Affichage du titre de mission
    const missionTemplate = (rowData: Collaboration) => (
        <div>
            <span className="font-semibold text-indigo-600">{rowData.titre_mission}</span>
            <div className="text-sm text-gray-500">Mission ID : {rowData.mission_id}</div>
        </div>
    );

    // ✅ Affichage du nom de l'école (optionnel car toutes les collaborations sont de la même école)
    const ecoleTemplate = (rowData: Collaboration) => (
        <Tag value={rowData.nom_ecole} severity="info" />
    );

    return (
        <Card className="shadow-lg p-5 rounded-2xl bg-white">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    Historique des collaborations
                </h2>
                <span className="text-sm text-gray-500">
                    {collaborations.length} collaboration(s) enregistrée(s)
                </span>
            </div>

            <DataTable
                value={collaborations}
                loading={loading}
                paginator
                rows={7}
                stripedRows
                responsiveLayout="scroll"
                className="shadow-sm"
                emptyMessage="Aucune collaboration trouvée pour cette école"
            >
                <Column header="Intervenant" body={intervenantTemplate} />
                <Column header="Mission" body={missionTemplate} />
                <Column header="École" body={ecoleTemplate} />
                <Column header="Montant" body={montantTemplate} />
            </DataTable>
        </Card>
    );
};

export default CollaborationList;