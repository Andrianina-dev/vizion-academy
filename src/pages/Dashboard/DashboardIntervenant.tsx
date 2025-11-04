import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { Avatar } from 'primereact/avatar';

import DashboardIntervenantLayout from '../../components/layout/DashboardIntervenantLayout/DashboardIntervenantLayout';
import FactureListIntervenant from '../../components/FactureListIntervenant';
import PaiementsEnAttente from '../../components/Paiements/PaiementsEnAttente';
import ProfilPublic from '../../components/Profil/ProfilPublic';
import { getIntervenantConnecte } from '../../services/intervenantService';
import type { Facture } from '../../services/factureService';
import type { ProfilIntervenant } from '../../services/profilService';
import { fetchFactures } from '../../services/factureService';
import { fetchPaiementsEnAttente } from '../../services/paiementService';
import { fetchProfil } from '../../services/profilService';

interface DashboardStats {
  revenusMois: number;
  missionsEnCours: number;
  tauxOccupation: number;
  satisfaction: number;
}

interface MissionRealisee {
  ecole: string;
  date: string;
  tauxHoraire: number;
  heures: number;
  intitule: string;
}

const DashboardIntervenant: React.FC = () => {
  // États pour la navigation
  const [activeSection, setActiveSection] = useState<string>('dashboard'); 
  
  // États pour les données
  const [factures, setFactures] = useState<Facture[]>([]);
  const [paiements, setPaiements] = useState<any[]>([]);
  const [intervenant, setIntervenant] = useState<{ prenom?: string; nom?: string } | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    revenusMois: 0,
    missionsEnCours: 0,
    tauxOccupation: 0,
    satisfaction: 0
  });
  
  // États de chargement
  const [loading, setLoading] = useState({
    factures: false,
    paiements: false,
    profil: false,
    stats: false
  });
  
  const [error, setError] = useState<string | null>(null);
  const toast = React.useRef<Toast>(null);
  
  // Récupérer l'intervenant connecté
  const intervenantId = intervenant?.id_intervenant;

  // Charger les données en fonction de la section active
  useEffect(() => {
    const loadData = async () => {
      if (!intervenantId) return;
      
      try {
        switch (activeSection) {
          case 'factures':
            setLoading(prev => ({ ...prev, factures: true }));
            const facturesData = await fetchFactures();
            setFactures(facturesData);
            break;
            
          case 'paiements':
            setLoading(prev => ({ ...prev, paiements: true }));
            const paiementsData = await fetchPaiementsEnAttente();
            setPaiements(paiementsData);
            break;
            
          case 'profil':
            setLoading(prev => ({ ...prev, profil: true }));
            const profilData = await fetchProfil();
            setIntervenant(profilData);
            break;
            
          case 'dashboard':
          default:
            // Charger les statistiques pour le tableau de bord
            setLoading(prev => ({ ...prev, stats: true }));
            // Ici vous pourriez ajouter un appel à un service de statistiques
            const dashboardStats = await fetchDashboardStats();
            setStats(dashboardStats);
            break;
        }
      } catch (err) {
        console.error(`Erreur lors du chargement des données pour ${activeSection}:`, err);
        setError('Une erreur est survenue lors du chargement des données');
        toast.current?.show({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les données',
          life: 3000
        });
      } finally {
        setLoading(prev => ({
          ...prev,
          factures: activeSection === 'factures' ? false : prev.factures,
          paiements: activeSection === 'paiements' ? false : prev.paiements,
          profil: activeSection === 'profil' ? false : prev.profil,
          stats: activeSection === 'dashboard' ? false : prev.stats
        }));
      }
    };
    
    loadData();
  }, [activeSection, intervenantId]);
  
  // Fonction pour simuler le chargement des statistiques (à remplacer par un vrai appel API)
  const fetchDashboardStats = async (): Promise<DashboardStats> => {
    // Simuler un appel API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          revenusMois: 980,
          missionsEnCours: 2,
          tauxOccupation: 75,
          satisfaction: 4.8
        });
      }, 500);
    });
  };
  
  // Gestion du changement de section
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setError(null);
  };
  
  // Fonction utilitaire pour le formatage des statuts
  const statutTemplate = (statut: string) => {
    type Severity = 'success' | 'warning' | 'info' | 'danger';
    const map: Record<string, { label: string; severity: Severity }> = {
      'payee': { label: 'Payée', severity: 'success' },
      'payé': { label: 'Payé', severity: 'success' },
      'en attente': { label: 'En attente', severity: 'warning' },
      'en validation': { label: 'En validation', severity: 'info' },
      'validé': { label: 'Validé', severity: 'success' },
      'bloqué': { label: 'Bloqué', severity: 'danger' },
    };
    
    const normalizedStatut = statut.toLowerCase();
    const s = map[normalizedStatut] || { label: statut, severity: 'info' as Severity };
    return <Tag value={s.label} severity={s.severity} className="text-xs font-semibold" />;
  };

  // Rendu du contenu en fonction de la section active
  const renderContent = () => {
    if (error) {
      return (
        <div className="p-4">
          <div className="p-4 border-round-md bg-red-50 text-red-800">
            <i className="pi pi-exclamation-triangle mr-2"></i>
            {error}
            <Button 
              label="Réessayer" 
              className="p-button-text p-button-sm ml-3" 
              onClick={() => handleSectionChange(activeSection)}
            />
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'factures':
        return (
          <div className="p-4">
            <div className="flex justify-content-between align-items-center mb-4">
              <h2 className="text-xl font-semibold">Mes factures</h2>
              <Button 
                label="Générer une facture" 
                icon="pi pi-plus" 
                className="p-button-outlined"
                onClick={() => {}}
              />
            </div>
            {loading.factures ? (
              <div className="card">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} width="100%" height="4rem" className="mb-2" />
                ))}
              </div>
            ) : (
              <FactureListIntervenant />
            )}
          </div>
        );

      case 'paiements':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Paiements en attente</h2>
            {loading.paiements ? (
              <div className="card">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} width="100%" height="6rem" className="mb-3" />
                ))}
              </div>
            ) : (
              <PaiementsEnAttente 
                intervenantId={intervenantId} 
                className="mb-4" 
              />
            )}
          </div>
        );

      case 'profil':
        return (
          <div className="p-4">
            {loading.profil ? (
              <div className="card">
                <Skeleton width="100%" height="20rem" />
              </div>
            ) : (
              <ProfilPublic className="mb-4" />
            )}
          </div>
        );

      case 'dashboard':
      default:
        return (
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
            
            {/* Cartes de statistiques */}
            <div className="grid">
              <div className="col-12 md:col-6 lg:col-3">
                <Card className="shadow-1 mb-4">
                  <div className="flex justify-content-between align-items-center">
                    <div>
                      <span className="block text-500 font-medium mb-1">Revenus du mois</span>
                      {loading.stats ? (
                        <Skeleton width="6rem" height="2rem" />
                      ) : (
                        <div className="text-900 font-medium text-xl">
                          {stats.revenusMois.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </div>
                      )}
                    </div>
                    <div className="bg-blue-100 p-3 border-round" style={{ borderRadius: '50%' }}>
                      <i className="pi pi-euro text-blue-500 text-xl"></i>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="col-12 md:col-6 lg:col-3">
                <Card className="shadow-1 mb-4">
                  <div className="flex justify-content-between align-items-center">
                    <div>
                      <span className="block text-500 font-medium mb-1">Missions en cours</span>
                      {loading.stats ? (
                        <Skeleton width="4rem" height="2rem" />
                      ) : (
                        <div className="text-900 font-medium text-xl">{stats.missionsEnCours}</div>
                      )}
                    </div>
                    <div className="bg-green-100 p-3 border-round" style={{ borderRadius: '50%' }}>
                      <i className="pi pi-briefcase text-green-500 text-xl"></i>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="col-12 md:col-6 lg:col-3">
                <Card className="shadow-1 mb-4">
                  <div className="flex flex-column">
                    <span className="block text-500 font-medium mb-2">Taux d'occupation</span>
                    {loading.stats ? (
                      <Skeleton width="100%" height="1.5rem" />
                    ) : (
                      <>
                        <div className="text-900 font-medium text-xl mb-2">{stats.tauxOccupation}%</div>
                        <ProgressBar 
                          value={stats.tauxOccupation} 
                          showValue={false} 
                          style={{ height: '6px' }} 
                        />
                      </>
                    )}
                  </div>
                </Card>
              </div>
              
              <div className="col-12 md:col-6 lg:col-3">
                <Card className="shadow-1 mb-4">
                  <div className="flex justify-content-between align-items-center">
                    <div>
                      <span className="block text-500 font-medium mb-1">Satisfaction</span>
                      {loading.stats ? (
                        <Skeleton width="4rem" height="2rem" />
                      ) : (
                        <div className="flex align-items-center">
                          <span className="text-900 font-medium text-xl mr-2">{stats.satisfaction}</span>
                          <i className="pi pi-star-fill text-yellow-500"></i>
                        </div>
                      )}
                    </div>
                    <div className="bg-yellow-100 p-3 border-round" style={{ borderRadius: '50%' }}>
                      <i className="pi pi-star text-yellow-500 text-xl"></i>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            
            {/* Dernières factures */}
            <div className="grid">
              <div className="col-12 xl:col-8">
                <Card title="Dernières factures" className="shadow-1 mb-4">
                  {loading.factures ? (
                    <div className="card">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} width="100%" height="4rem" className="mb-2" />
                      ))}
                    </div>
                  ) : factures.length > 0 ? (
                    <div className="border-round border-1 surface-border">
                      {factures.slice(0, 3).map((facture, index) => (
                        <div 
                          key={facture.id_facture} 
                          className={`p-3 border-bottom-1 surface-border flex justify-content-between align-items-center ${
                            index % 2 === 0 ? 'bg-gray-50' : ''
                          }`}
                        >
                          <div>
                            <div className="font-medium">{facture.titre_mission}</div>
                            <div className="text-500 text-sm">{facture.nom_ecole}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {facture.montant_calcule?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </div>
                            <div className="text-500 text-sm">
                              {new Date(facture.date_creation).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 text-500">
                      Aucune facture disponible
                    </div>
                  )}
                  <div className="mt-3 text-right">
                    <Button 
                      label="Voir toutes les factures" 
                      className="p-button-text" 
                      onClick={() => handleSectionChange('factures')}
                    />
                  </div>
                </Card>
              </div>
              
              {/* Prochain paiement */}
              <div className="col-12 xl:col-4">
                <Card title="Prochain paiement" className="shadow-1 mb-4">
                  {loading.paiements ? (
                    <div className="card">
                      <Skeleton width="100%" height="6rem" />
                    </div>
                  ) : paiements.length > 0 ? (
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {paiements[0]?.montant?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </div>
                      <div className="mb-3">
                        <span className="text-500">Prévu pour le </span>
                        <span className="font-medium">
                          {new Date(paiements[0]?.date_estimee).toLocaleDateString('fr-FR', { 
                            day: 'numeric', 
                            month: 'long' 
                          })}
                        </span>
                      </div>
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {paiements[0]?.motif || 'Régularisation'}
                      </span>
                      <div className="mt-4">
                        <Button 
                          label="Voir les détails" 
                          className="p-button-outlined p-button-sm"
                          onClick={() => handleSectionChange('paiements')}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4 text-500">
                      Aucun paiement en attente
                    </div>
                  )}
                </Card>
                
                {/* Profil rapide */}
                <Card title="Mon profil" className="shadow-1">
                  {loading.profil ? (
                    <div className="flex flex-column align-items-center">
                      <Skeleton shape="circle" size="5rem" className="mb-3" />
                      <Skeleton width="8rem" height="1.5rem" className="mb-2" />
                      <Skeleton width="12rem" height="1rem" className="mb-3" />
                      <Skeleton width="100%" height="2.5rem" />
                    </div>
                  ) : (
                    <div className="flex flex-column align-items-center">
                      <Avatar 
                        icon="pi pi-user" 
                        size="xlarge" 
                        shape="circle" 
                        className="mb-3 bg-blue-100 text-blue-600"
                        image={intervenant?.photo_url}
                      />
                      <h3 className="text-xl font-medium mb-1">
                        {intervenant?.prenom} {intervenant?.nom}
                      </h3>
                      <p className="text-500 mb-4">{intervenant?.domaines?.[0] || 'Intervenant'}</p>
                      <Button 
                        label="Compléter mon profil" 
                        icon="pi pi-user-edit" 
                        className="p-button-outlined"
                        onClick={() => handleSectionChange('profil')}
                      />
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <DashboardIntervenantLayout 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        facturesCount={factures.filter(f => f.statut === 'en attente').length}
        paiementsCount={paiements.length}
        userInfo={{
          name: intervenant ? `${intervenant.prenom} ${intervenant.nom}` : 'Intervenant',
          role: 'Intervenant Vizion Academy',
          avatar: intervenant?.photo_url || undefined
        }}
      >
        {renderContent()}
      </DashboardIntervenantLayout>
    </>
  );
};

export default DashboardIntervenant;