  import React, { useEffect, useState } from 'react';
  import { DataTable } from 'primereact/datatable';
  import { Column } from 'primereact/column';
  import { Dialog } from 'primereact/dialog';
  import { Tooltip } from 'primereact/tooltip';
  import { Card } from 'primereact/card';
  import axios from 'axios';
  import CustomButton from './ui/forms/customButton';
  import { getIdEcoleConnectee } from '../services/ecoleService';

  interface Mission {
    id_mission: string;
    titre: string;
    descriptions_mission: string;
    conditions: string;
    date_debut: string;
    date_fin: string;
    date_creation: string;
    duree: number;
    ecole_id: string;
    intervenant_id: string;
  }

  interface Intervenant {
    id_intervenant: string;
    nom_intervenant: string;
    prenom_intervenant: string;
  }

  interface MissionTableProps {
    ecoleId?: string;
  }

  const MissionTable: React.FC<MissionTableProps> = ({ ecoleId }) => {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [intervenants, setIntervenants] = useState<Intervenant[]>([]);
    const [favoris, setFavoris] = useState<Intervenant[]>([]);
    const [showFavoris, setShowFavoris] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [showDates, setShowDates] = useState(false);
    const [newMission, setNewMission] = useState({
      titre: '',
      descriptions_mission: '',
      conditions: '',
      intervenant_id: '',
      date_debut: '',
      date_fin: '',
      duree: 1
    });

    const API_URL = import.meta.env.VITE_API_URL;

    // Récupérer l'ID de l'école connectée
    const getEcoleConnecteeId = (): string => {
      return ecoleId || getIdEcoleConnectee() || '';
    };

    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Charger les missions de l'école connectée
    useEffect(() => {
      const ecoleConnecteeId = getEcoleConnecteeId();
      
      if (!ecoleConnecteeId) {
        console.error('Aucun ID école trouvé');
        setLoading(false);
        return;
      }

      axios.get(`${API_URL}/api/mission/ecole/${ecoleConnecteeId}`)
        .then((response) => {
          console.log('Réponse missions:', response.data);
          
          if (response.data.success) {
            setMissions(response.data.missions || response.data.data || []);
          } else {
            console.error('Erreur API:', response.data.message);
            setMissions([]);
          }
        })
        .catch((error) => {
          console.error('Erreur chargement missions:', error);
          setMissions([]);
        })
        .finally(() => setLoading(false));
    }, [ecoleId]);

    // Charger les intervenants
    useEffect(() => {
      axios.get(`${API_URL}/api/intervenants`)
        .then((response) => {
          console.log('Réponse intervenants:', response.data);
          setIntervenants(response.data.data || response.data || []);
        })
        .catch((error) => console.error('Erreur chargement intervenants:', error));
    }, []);

    // Charger les intervenants favoris
    const fetchFavoris = () => {
      const ecoleConnecteeId = getEcoleConnecteeId();
      if (!ecoleConnecteeId) return;
      
      axios.get(`${API_URL}/api/intervenants/favoris/${ecoleConnecteeId}`)
        .then((res) => {
          console.log('Réponse favoris:', res.data);
          setFavoris(res.data.data || res.data || []);
        })
        .catch((err) => console.error('Erreur chargement favoris:', err));
    };

    // Gérer le changement de durée
    const handleDureeChange = (value: number) => {
      const updatedMission = { ...newMission, duree: value };
      
      // Si la date de début est définie, calculer la date de fin automatiquement
      if (updatedMission.date_debut) {
        const debut = new Date(updatedMission.date_debut);
        const fin = new Date(debut);
        fin.setDate(fin.getDate() + value - 1);
        updatedMission.date_fin = fin.toISOString().split('T')[0];
      }
      
      setNewMission(updatedMission);
    };

    // Basculer l'affichage des dates
    const toggleDates = () => {
      setShowDates(!showDates);
    };

    // Calculer durée si date_debut et date_fin changent
    const handleDateChange = (field: 'date_debut' | 'date_fin', value: string) => {
      const updatedMission = { ...newMission, [field]: value };

      if (field === 'date_debut' && updatedMission.date_debut) {
        // Recalculer la date de fin si on change la date de début
        const debut = new Date(value);
        const fin = new Date(debut);
        fin.setDate(fin.getDate() + updatedMission.duree - 1);
        updatedMission.date_fin = fin.toISOString().split('T')[0];
      }

      if (updatedMission.date_debut && updatedMission.date_fin) {
        // Calculer la durée si les deux dates sont renseignées
        const debut = new Date(updatedMission.date_debut);
        const fin = new Date(updatedMission.date_fin);
        const diff = Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        updatedMission.duree = diff > 0 ? diff : 1;
      }

      setNewMission(updatedMission);
    };

    // Création de mission - CORRIGÉE
    const handleCreateMission = () => {
      const ecoleConnecteeId = getEcoleConnecteeId();
      
      if (!ecoleConnecteeId) {
        console.error('Aucun ID école trouvé pour créer la mission');
        return;
      }

      // Payload CORRECT - SANS id_mission et SANS nom_ecole
      const payload = {
        titre: newMission.titre,
        descriptions_mission: newMission.descriptions_mission,
        conditions: newMission.conditions,
        intervenant_id: newMission.intervenant_id,
        ecole_id: ecoleConnecteeId,
        date_debut: newMission.date_debut || null,
        date_fin: newMission.date_fin || null,
        duree: newMission.duree
      };

      console.log('Payload création mission:', payload);

      // REQUÊTE SQL CORRECTE (pour debug)
      const sqlQuery = `
        INSERT INTO mission (
          titre, 
          descriptions_mission, 
          conditions,
          intervenant_id,
          ecole_id,
          date_debut, 
          date_fin, 
          duree
        ) VALUES (
          '${payload.titre.replace(/'/g, "''")}',
          ${payload.descriptions_mission ? `'${payload.descriptions_mission.replace(/'/g, "''")}'` : 'NULL'},
          ${payload.conditions ? `'${payload.conditions.replace(/'/g, "''")}'` : 'NULL'},
          '${payload.intervenant_id}',
          '${payload.ecole_id}',
          ${payload.date_debut ? `'${payload.date_debut}'` : 'NULL'},
          ${payload.date_fin ? `'${payload.date_fin}'` : 'NULL'},
          ${payload.duree}
        )
      `;

      console.log('📋 REQUÊTE SQL EXÉCUTÉE:');
      console.log(sqlQuery);
      console.log('----------------------------------------');

      // Utiliser le BON ENDPOINT
      axios.post(`${API_URL}/api/declaration/mission/ecole`, payload)
        .then((response) => {
          console.log('Réponse création mission:', response.data);
          if (response.data.success) {
            // Recharger les missions après création
            const ecoleConnecteeId = getEcoleConnecteeId();
            axios.get(`${API_URL}/api/mission/ecole/${ecoleConnecteeId}`)
              .then((res) => {
                if (res.data.success) {
                  setMissions(res.data.missions || res.data.data || []);
                }
              });
            
            setShowDialog(false);
            setNewMission({
              titre: '',
              descriptions_mission: '',
              conditions: '',
              intervenant_id: '',
              date_debut: '',
              date_fin: '',
              duree: 1
            });
            setShowDates(false);
            
            // Message de succès
            console.log('✅ Mission créée avec succès!');
          } else {
            console.error('❌ Erreur création mission:', response.data.message);
          }
        })
        .catch((error) => {
          if (error.response) {
            console.error('❌ Erreur backend:', error.response.data);
          } else {
            console.error('❌ Erreur création mission:', error);
          }
        });
    };

    const dialogFooter = (
      <div className="flex justify-content-end gap-2 mt-4">
        <CustomButton
          label="Annuler"
          severity="secondary"
          onClick={() => setShowDialog(false)}
        />
        <CustomButton
          label="Déclarer la Mission"
          style={{ backgroundColor: '#6c5dd3', color: 'white', borderColor: '#6c5dd3' }}
          onClick={handleCreateMission}
          disabled={!newMission.intervenant_id || !newMission.titre || !newMission.duree}
        />
      </div>
    );

    // Template pour afficher la date de création
    const dateCreationTemplate = (rowData: Mission) => {
      return formatDate(rowData.date_creation);
    };

    return (
      <div className="card">
        <div className="flex justify-content-between align-items-center mb-4">
          <h2 className="text-2xl font-bold text-900">
            Missions de l'école
          </h2>
          <div className="flex align-items-center gap-3">
            <CustomButton
              label="Déclarer une Mission"
              icon="pi pi-plus"
              style={{ backgroundColor: '#6c5dd3', color: 'white', borderColor: '#6c5dd3' }}
              onClick={() => setShowDialog(true)}
            />
            <i
              className="pi pi-star text-yellow-500 text-xl cursor-pointer"
              data-pr-tooltip="Voir les intervenants favoris"
              onClick={() => {
                fetchFavoris();
                setShowFavoris(true);
              }}
            ></i>
            <Tooltip target=".pi-star" />
          </div>
        </div>

        <DataTable
          value={missions}
          loading={loading}
          paginator
          rows={10}
          responsiveLayout="scroll"
          className="shadow-1 border-round-lg"
          emptyMessage="Aucune mission trouvée"
        >
          <Column field="titre" header="Titre" sortable />
          <Column field="descriptions_mission" header="Description" />
          <Column field="conditions" header="Conditions" />
          <Column 
            field="date_creation" 
            header="Date création" 
            body={dateCreationTemplate}
            sortable 
          />
          <Column 
            field="date_debut" 
            header="Début" 
            body={(row) => formatDate(row.date_debut)}
            sortable 
          />
          <Column 
            field="date_fin" 
            header="Fin" 
            body={(row) => formatDate(row.date_fin)}
            sortable 
          />
          <Column field="duree" header="Durée (jours)" sortable />
          <Column field="ecole_id" header="École ID" sortable />
        </DataTable>

        {/* Dialog Déclaration de Mission */}
        <Dialog
          header={
            <div className="flex align-items-center gap-2">
              <i className="pi pi-plus-circle text-primary text-xl"></i>
              <span className="font-bold text-xl text-900">Déclaration d'une Mission</span>
            </div>
          }
          visible={showDialog}
          style={{ width: '50vw', minWidth: '400px' }}
          className="shadow-5 border-round-2xl"
          footer={dialogFooter}
          onHide={() => setShowDialog(false)}
          draggable={false}
        >
          <div className="space-y-4">
            {/* Informations principales */}
            <Card className="shadow-1 border-round-lg">
              <div className="text-lg font-semibold text-900 mb-3 flex align-items-center gap-2">
                <i className="pi pi-info-circle text-primary"></i>
                Informations principales
              </div>
              <div className="grid">
                <div className="field col-12">
                  <label htmlFor="titre" className="font-medium text-900">Titre de la mission *</label>
                  <input
                    id="titre"
                    type="text"
                    className="p-inputtext p-component w-full mt-1"
                    value={newMission.titre}
                    onChange={(e) => setNewMission({...newMission, titre: e.target.value})}
                    placeholder="Ex: Soutien scolaire en mathématiques"
                  />
                </div>
                
                <div className="field col-12">
                  <label htmlFor="intervenant" className="font-medium text-900">Intervenant *</label>
                  <select
                    id="intervenant"
                    className="p-inputtext p-component w-full mt-1"
                    value={newMission.intervenant_id}
                    onChange={(e) => setNewMission({...newMission, intervenant_id: e.target.value})}
                  >
                    <option value="">Sélectionner un intervenant</option>
                    {intervenants.map((intervenant) => (
                      <option key={intervenant.id_intervenant} value={intervenant.id_intervenant}>
                        {intervenant.prenom_intervenant} {intervenant.nom_intervenant}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Durée de la mission */}
            <Card className="shadow-1 border-round-lg">
              <div className="text-lg font-semibold text-900 mb-3 flex align-items-center gap-2">
                <i className="pi pi-calendar text-primary"></i>
                Durée de la mission
              </div>
              <div className="grid">
                <div className="field col-12">
                  <label htmlFor="duree" className="font-medium text-900">Durée (jours) *</label>
                  <div className="p-inputgroup mt-1">
                    <button 
                      className="p-button p-button-outlined p-button-secondary"
                      onClick={() => handleDureeChange(Math.max(1, newMission.duree - 1))}
                      type="button"
                      style={{ minWidth: '2.5rem' }}
                    >
                      <i className="pi pi-minus"></i>
                    </button>
                    <input
                      id="duree"
                      type="number"
                      className="p-inputtext p-component text-center"
                      value={newMission.duree}
                      onChange={(e) => handleDureeChange(parseInt(e.target.value) || 1)}
                      min="1"
                      style={{ textAlign: 'center' }}
                    />
                    <button 
                      className="p-button p-button-outlined p-button-secondary"
                      onClick={() => handleDureeChange(newMission.duree + 1)}
                      type="button"
                      style={{ minWidth: '2.5rem' }}
                    >
                      <i className="pi pi-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Dates spécifiques - Section optionnelle */}
            <Card className={`shadow-1 border-round-lg transition-all transition-duration-300 ${showDates ? 'border-left-3 border-primary' : ''}`}>
              <div className="flex justify-content-between align-items-center mb-3 cursor-pointer" onClick={toggleDates}>
                <div className="flex align-items-center gap-2">
                  <i className="pi pi-clock text-primary"></i>
                  <span className="text-lg font-semibold text-900">Dates spécifiques</span>
                  <span className="text-sm text-500">(Optionnel)</span>
                </div>
                <button
                  type="button"
                  className={`p-button p-button-text p-button-plain ${showDates ? 'text-primary' : 'text-500'}`}
                  onClick={toggleDates}
                  style={{ width: '2rem', height: '2rem' }}
                >
                  <i className={`pi ${showDates ? 'pi-chevron-up' : 'pi-chevron-down'} text-sm`} />
                </button>
              </div>
              
              {showDates && (
                <div className="grid mt-3">
                  <div className="field col-6">
                    <label htmlFor="date_debut" className="font-medium text-900">Date de début</label>
                    <input
                      id="date_debut"
                      type="date"
                      className="p-inputtext p-component w-full mt-1"
                      value={newMission.date_debut}
                      onChange={(e) => handleDateChange('date_debut', e.target.value)}
                    />
                  </div>
                  <div className="field col-6">
                    <label htmlFor="date_fin" className="font-medium text-900">Date de fin</label>
                    <input
                      id="date_fin"
                      type="date"
                      className="p-inputtext p-component w-full mt-1"
                      value={newMission.date_fin}
                      onChange={(e) => handleDateChange('date_fin', e.target.value)}
                      min={newMission.date_debut}
                    />
                  </div>
                  {newMission.date_debut && newMission.date_fin && (
                    <div className="col-12 text-sm text-700 p-3 bg-blue-50 border-round mt-2">
                      <div className="flex align-items-center gap-2">
                        <i className="pi pi-info-circle text-blue-600"></i>
                        <span>Période: <strong>{formatDate(newMission.date_debut)}</strong> au <strong>{formatDate(newMission.date_fin)}</strong> ({newMission.duree} jour(s))</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Description et conditions */}
            <Card className="shadow-1 border-round-lg">
              <div className="text-lg font-semibold text-900 mb-3 flex align-items-center gap-2">
                <i className="pi pi-file-edit text-primary"></i>
                Détails supplémentaires
              </div>
              <div className="grid">
                <div className="field col-12">
                  <label htmlFor="description" className="font-medium text-900">Description</label>
                  <textarea
                    id="description"
                    className="p-inputtext p-component w-full mt-1"
                    rows={3}
                    value={newMission.descriptions_mission}
                    onChange={(e) => setNewMission({...newMission, descriptions_mission: e.target.value})}
                    placeholder="Description détaillée de la mission..."
                  />
                </div>

                <div className="field col-12">
                  <label htmlFor="conditions" className="font-medium text-900">Conditions</label>
                  <textarea
                    id="conditions"
                    className="p-inputtext p-component w-full mt-1"
                    rows={2}
                    value={newMission.conditions}
                    onChange={(e) => setNewMission({...newMission, conditions: e.target.value})}
                    placeholder="Conditions particulières de la mission..."
                  />
                </div>
              </div>
            </Card>
          </div>
        </Dialog>

        {/* Dialog Favoris */}
        <Dialog
          header="Intervenants favoris"
          visible={showFavoris}
          style={{ width: '40vw', minWidth: '400px' }}
          onHide={() => setShowFavoris(false)}
        >
          {favoris.length === 0 ? (
            <p>Aucun intervenant favori</p>
          ) : (
            <DataTable value={favoris} paginator rows={5} className="shadow-1 border-round-lg">
              <Column field="nom_intervenant" header="Nom" />
              <Column field="prenom_intervenant" header="Prénom" />
            </DataTable>
          )}
        </Dialog>
      </div>
    );
  };

  export default MissionTable;