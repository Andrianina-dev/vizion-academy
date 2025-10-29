import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import { getIdEcoleConnectee } from '../services/ecoleService';

const API_URL = import.meta.env.VITE_API_URL;

interface Intervenant {
  nom_intervenant: string;
  prenom_intervenant: string;
  domaines: string; // {informatique,devops}
  titre: string;
  nom_ecole: string;
}

interface FavorisIntervenantProps {
  ecoleId?: string;
}

const FavorisIntervenant: React.FC<FavorisIntervenantProps> = ({ ecoleId }) => {
  const [intervenants, setIntervenants] = useState<Intervenant[]>([]);
  const [loading, setLoading] = useState(true);

  const getEcoleConnecteeId = (): string => {
    return ecoleId || getIdEcoleConnectee() || '';
  };

  useEffect(() => {
    const id = getEcoleConnecteeId();
    if (!id) return;

    setLoading(true);
    axios.get(`${API_URL}/api/intervenants/favoris/${id}`)
      .then(res => setIntervenants(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [ecoleId]);

  // Supprimer les accolades pour l'affichage
  const domainesBodyTemplate = (rowData: Intervenant) => {
    return rowData.domaines.replace(/^{|}$/g, ''); // supprime { et }
  };

  return (
    <div className="p-4">
      <h2>Intervenants déjà collaborés</h2>
      <DataTable 
        value={intervenants} 
        paginator 
        rows={5} 
        loading={loading} 
        emptyMessage="Aucun intervenant trouvé"
      >
        <Column field="nom_intervenant" header="Nom" sortable />
        <Column field="prenom_intervenant" header="Prénom" sortable />
        <Column field="domaines" header="Domaines" body={domainesBodyTemplate} sortable />
        <Column field="titre" header="Mission" sortable />
        <Column field="nom_ecole" header="École" sortable />
      </DataTable>
    </div>
  );
};

export default FavorisIntervenant;
