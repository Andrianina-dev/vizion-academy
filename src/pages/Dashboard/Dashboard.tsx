import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import MissionTable from '../../components/MissionTable';
import ListeIntervenantsFavoris from '../../components/FavorisIntervenant'; // Ajout de l'import
// import FactureList from '../../components/FactureList';
import Collaborateur from '../Dashboard/DashboardEcole';
import { getEcoleConnectee } from '../../services/ecoleService'; // Import du service

interface Ecole {
  id_ecole: string;
  nom_ecole: string;
  email: string;
  telephone: string;
  adresse: string;
  date_creation: string;
}

const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('accueil');
  const [ecole, setEcole] = useState<Ecole | null>(null);

  useEffect(() => {
    // Récupérer l'école connectée au chargement du composant
    const ecoleConnectee = getEcoleConnectee();
    setEcole(ecoleConnectee);
  }, []);

  return (
    <DashboardLayout
      onSelect={(section) => setActiveSection(section)}
      activeSection={activeSection}
    >
      {activeSection === 'accueil' && (
        <div className="text-center">
          <h1 className="text-4xl font-bold text-900 mb-3">
            Bienvenue {ecole ? `à ${ecole.nom_ecole}` : 'sur le dashboard'}
          </h1>
          <p className="text-lg text-600 mb-4">
            Gestion centralisée de votre établissement scolaire
          </p>
          
          {/* Carte d'information de l'école */}
          {ecole && (
            <div className="bg-white shadow-2 p-4 border-round-lg max-w-30rem mx-auto">
              <div className="flex align-items-center justify-content-center mb-3">
                <i className="pi pi-building text-3xl text-primary mr-3"></i>
                <h2 className="text-2xl font-semibold text-900 m-0">
                  {ecole.nom_ecole}
                </h2>
              </div>
              
              <div className="grid text-left">
                <div className="col-6">
                  <p className="flex align-items-center mb-2">
                    <i className="pi pi-id-card text-primary mr-2"></i>
                    <strong>ID: </strong>
                    <span className="ml-2 text-color-secondary">{ecole.id_ecole}</span>
                  </p>
                  <p className="flex align-items-center mb-2">
                    <i className="pi pi-envelope text-primary mr-2"></i>
                    <strong>Email: </strong>
                    <span className="ml-2 text-color-secondary">{ecole.email}</span>
                  </p>
                </div>
                <div className="col-6">
                  <p className="flex align-items-center mb-2">
                    <i className="pi pi-phone text-primary mr-2"></i>
                    <strong>Téléphone: </strong>
                    <span className="ml-2 text-color-secondary">{ecole.telephone}</span>
                  </p>
                  <p className="flex align-items-center mb-2">
                    <i className="pi pi-calendar text-primary mr-2"></i>
                    <strong>Membre depuis: </strong>
                    <span className="ml-2 text-color-secondary">
                      {new Date(ecole.date_creation).toLocaleDateString('fr-FR')}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {activeSection === 'missions' && <MissionTable />}
      {activeSection === 'intervenants' && ecole && <ListeIntervenantsFavoris ecoleId={ecole.id_ecole} />} {/* Ajout de la section Intervenants */}
      {activeSection === 'factures' && <Collaborateur />}
    </DashboardLayout>
  );
};

export default Dashboard;