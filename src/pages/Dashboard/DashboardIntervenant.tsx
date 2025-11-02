import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { ProgressBar } from 'primereact/progressbar';
import { Sidebar } from 'primereact/sidebar';
import { Menu } from 'primereact/menu';
import type { MenuItem } from 'primereact/menuitem';

import FactureListIntervenant from '../../components/FactureListIntervenant';
import PaiementsEnAttente from '../../components/Paiements/PaiementsEnAttente';
import DeclarationActivites from '../../components/Paiements/DeclarationActivites';
const API_URL = import.meta.env.VITE_API_URL;

const DashboardIntervenant: React.FC = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [paiements, setPaiements] = useState<any[]>([]);

  React.useEffect(() => {
    if (activeSection === 'factures') {
      const raw = localStorage.getItem('intervenant_connecte');
      const interv = raw ? JSON.parse(raw) : null;
      const id = interv?.id_intervenant || '(inconnu)';
      console.log(`[DashboardIntervenant] Factures -> POST ${API_URL}/api/factures/intervenant/${id}/generate-latest`);
      console.log(`[DashboardIntervenant] Factures -> GET  ${API_URL}/api/factures/intervenant/${id}`);
    }
  }, [activeSection]);

  React.useEffect(() => {
    if (activeSection !== 'paiements') return;
    const raw = localStorage.getItem('intervenant_connecte');
    const interv = raw ? JSON.parse(raw) : null;
    const id = interv?.id_intervenant;
    if (!id) return;
    console.log(`[DashboardIntervenant] Paiements -> GET ${API_URL}/api/paiements/intervenant/${id}/pending`);
    fetch(`${API_URL}/api/paiements/intervenant/${id}/pending`, { credentials: 'include' })
      .then(r => r.json())
      .then(j => {
        if (j && j.success) setPaiements(Array.isArray(j.data) ? j.data : []);
        else setPaiements([]);
      })
      .catch(() => setPaiements([]));
  }, [activeSection]);

  // Données statiques (mock)
  const factures = [
    { id: 'FAC-2025-001', statut: 'payee', montant: 420, date: '2025-10-01' },
    { id: 'FAC-2025-002', statut: 'en attente', montant: 260, date: '2025-10-07' },
    { id: 'FAC-2025-003', statut: 'en validation', montant: 320, date: '2025-10-15' },
  ];

  const paiementsEnAttente = [
    { virement: 'VIR-8841', dateEstimee: '2025-11-05', motif: '-', montant: 260 },
    { virement: 'VIR-8842', dateEstimee: '2025-11-12', motif: 'Validation facture', montant: 320 },
  ];

  const missionsRealisees = [
    { ecole: 'Lycée Lumière', date: '2025-10-03', tauxHoraire: 40, heures: 6, intitule: 'Atelier IA' },
    { ecole: 'Collège Victor Hugo', date: '2025-10-10', tauxHoraire: 45, heures: 4, intitule: 'Robotique' },
  ];

  const [profil, setProfil] = useState({
    photoUrl: '',
    bio: 'Intervenant passionné par les STEM et la pédagogie active.',
    competences: 'IA, Robotique, Arduino',
    disponibilite: 'Hebdomadaire',
    documents: 'CV.pdf, Diplôme.pdf'
  });

  // Menu items pour la sidebar
  const menuItems: MenuItem[] = [
    {
      label: 'Tableau de Bord',
      icon: 'pi pi-home',
      command: () => setActiveSection('dashboard')
    },
    {
      label: 'Factures',
      icon: 'pi pi-file-pdf',
      template: (item, options) => (
        <a className={options.className} onClick={options.onClick}>
          {item.icon && <span className={options.iconClassName}></span>}
          <span className={options.labelClassName}>{item.label}</span>
          <Badge value={factures.length} className="ml-2" />
        </a>
      ),
      command: () => setActiveSection('factures')
    },
    {
      label: 'Missions',
      icon: 'pi pi-briefcase',
      items: [
        {
          label: 'Missions en cours',
          icon: 'pi pi-clock',
          command: () => setActiveSection('missions-cours')
        },
        {
          label: 'Missions réalisées',
          icon: 'pi pi-check-circle',
          command: () => setActiveSection('missions-realisees')
        },
        {
          label: 'Planning',
          icon: 'pi pi-calendar',
          command: () => setActiveSection('planning')
        }
      ]
    },
    {
      label: 'Paiements',
      icon: 'pi pi-euro',
      template: (item, options) => (
        <a className={options.className} onClick={options.onClick}>
          {item.icon && <span className={options.iconClassName}></span>}
          <span className={options.labelClassName}>{item.label}</span>
          <Badge value={paiements.length} className="ml-2" />
        </a>
      ),
      command: () => setActiveSection('paiements')
    },
    {
      label: 'Déclarations',
      icon: 'pi pi-chart-bar',
      command: () => setActiveSection('declarations')
    },
    {
      label: 'Profil',
      icon: 'pi pi-user',
      command: () => setActiveSection('profil')
    },
    {
      label: 'Documents',
      icon: 'pi pi-folder',
      command: () => setActiveSection('documents')
    },
    {
      separator: true
    },
    {
      label: 'Paramètres',
      icon: 'pi pi-cog',
      command: () => setActiveSection('parametres')
    },
    {
      label: 'Support',
      icon: 'pi pi-question-circle',
      command: () => setActiveSection('support')
    }
  ];

  const statutTemplate = (statut: string) => {
    const map: Record<string, { label: string; severity: 'success' | 'warning' | 'info' }> = {
      'payee': { label: 'Payée', severity: 'success' },
      'en attente': { label: 'En attente', severity: 'warning' },
      'en validation': { label: 'En validation', severity: 'info' },
    };
    const s = map[statut] || { label: statut, severity: 'info' };
    return <Tag value={s.label} severity={s.severity} className="text-xs font-semibold" />;
  };

  // Statistiques
  const stats = {
    revenusMois: 980,
    missionsEnCours: 2,
    tauxOccupation: 75,
    satisfaction: 4.8
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar Desktop */}
      <div className="hidden lg:block w-80 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex align-items-center gap-3">
            <Avatar 
              icon="pi pi-graduation-cap" 
              size="large" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg" 
              shape="circle" 
            />
            <div>
              <div className="font-bold text-gray-900">Vizion Academy</div>
              <div className="text-sm text-gray-500">Espace Intervenant</div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Menu 
            model={menuItems} 
            className="border-none w-full"
            pt={{
              root: { className: 'border-none' },
              menuitem: { className: 'mb-1' },
              icon: { className: 'text-gray-600' },
              label: { className: 'text-gray-700 font-medium' },
              action: { className: 'hover:bg-gray-100 rounded-lg transition-colors duration-200' }
            }}
          />
        </div>

      </div>

      {/* Contenu Principal */}
      <div className="flex-1 overflow-auto">
        {activeSection === 'declarations' ? (
          <div className="p-4 md:p-6">
            <Card title="Déclaration d'Activités" className="shadow-sm">
              <DeclarationActivites />
            </Card>
          </div>
        ) : activeSection === 'dashboard' ? (
          <div className="p-4 md:p-6">
            <FactureListIntervenant />
          </div>
        ) : activeSection === 'paiements' ? (
          <div className="p-4 md:p-6">
            <PaiementsEnAttente 
              intervenantId={localStorage.getItem('intervenant_connecte') ? JSON.parse(localStorage.getItem('intervenant_connecte')!).id_intervenant : null}
              className="mb-4"
            />
          </div>
        ) : (
          <>
        {/* Header Mobile avec bouton menu */}
        <div className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="p-4 flex align-items-center justify-content-between">
            <div className="flex align-items-center gap-3">
              <Button 
                icon="pi pi-bars" 
                className="p-button-text p-button-sm"
                onClick={() => setSidebarVisible(true)}
              />
              <div>
                <div className="font-bold text-gray-900">Vizion Academy</div>
                <div className="text-sm text-gray-500">Intervenant</div>
              </div>
            </div>
            <Avatar 
              icon="pi pi-user" 
              size="normal" 
              className="bg-gradient-to-r from-blue-500 to-purple-600" 
              shape="circle" 
            />
          </div>
        </div>

        <div className="p-4 md:p-6">
          {/* Header Desktop */}
          <div className="mb-6 hidden lg:block">
            <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord</h1>
                <p className="text-gray-600">Bienvenue dans votre espace intervenant Vizion Academy</p>
              </div>
              <div className="flex align-items-center gap-3">
                <Avatar 
                  icon="pi pi-user" 
                  size="large" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg" 
                  shape="circle" 
                />
                <div>
                  <div className="font-semibold text-gray-900">Expert STEM</div>
                  <div className="text-sm text-gray-500">Intervenant Vizion Academy</div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques Rapides */}
          <div className="grid mb-6">
            <div className="col-12 md:col-3">
              <Card className="shadow-sm border-1 border-200 hover:shadow-md transition-all duration-300">
                <div className="flex justify-content-between align-items-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">€{stats.revenusMois}</div>
                    <div className="text-sm text-gray-500">Revenus ce mois</div>
                  </div>
                  <div className="p-3 bg-blue-100 border-round-lg">
                    <i className="pi pi-euro text-blue-600 text-xl"></i>
                  </div>
                </div>
              </Card>
            </div>
            <div className="col-12 md:col-3">
              <Card className="shadow-sm border-1 border-200 hover:shadow-md transition-all duration-300">
                <div className="flex justify-content-between align-items-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.missionsEnCours}</div>
                    <div className="text-sm text-gray-500">Missions en cours</div>
                  </div>
                  <div className="p-3 bg-green-100 border-round-lg">
                    <i className="pi pi-briefcase text-green-600 text-xl"></i>
                  </div>
                </div>
              </Card>
            </div>
            <div className="col-12 md:col-3">
              <Card className="shadow-sm border-1 border-200 hover:shadow-md transition-all duration-300">
                <div className="flex justify-content-between align-items-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.tauxOccupation}%</div>
                    <div className="text-sm text-gray-500">Taux d'occupation</div>
                  </div>
                  <div className="p-3 bg-orange-100 border-round-lg">
                    <i className="pi pi-chart-line text-orange-600 text-xl"></i>
                  </div>
                </div>
              </Card>
            </div>
            <div className="col-12 md:col-3">
              <Card className="shadow-sm border-1 border-200 hover:shadow-md transition-all duration-300">
                <div className="flex justify-content-between align-items-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.satisfaction}/5</div>
                    <div className="text-sm text-gray-500">Satisfaction</div>
                  </div>
                  <div className="p-3 bg-purple-100 border-round-lg">
                    <i className="pi pi-star text-purple-600 text-xl"></i>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="grid">
            {/* Colonne Gauche */}
            <div className="col-12 lg:col-8">
              {/* Factures */}
              <Card 
                title={
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-file-pdf text-blue-500"></i>
                    <span>Factures Générées</span>
                    <Badge value={factures.length} className="ml-2 bg-blue-500" />
                  </div>
                }
                className="shadow-sm mb-4"
              >
                <div className="grid">
                  {factures.map((f) => (
                    <div key={f.id} className="col-12 md:col-6 lg:col-4 mb-3">
                      <div className="p-4 border-round-xl border-1 surface-100 hover:surface-200 transition-all duration-300">
                        <div className="flex justify-content-between align-items-start mb-3">
                          <div className="font-semibold text-gray-900">{f.id}</div>
                          {statutTemplate(f.statut)}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-2">{f.montant} €</div>
                        <div className="text-sm text-gray-500 mb-3">Échéance: {f.date}</div>
                        <Button 
                          icon="pi pi-download" 
                          label="Télécharger" 
                          className="p-button-outlined p-button-sm w-full" 
                          onClick={() => alert(`Téléchargement ${f.id}.pdf`)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Missions Réalisées */}
              <Card 
                title={
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-briefcase text-green-500"></i>
                    <span>Missions Réalisées</span>
                  </div>
                }
                className="shadow-sm mb-4"
              >
                <div className="space-y-3">
                  {missionsRealisees.map((m, idx) => (
                    <div key={idx} className="p-4 border-round-xl border-1 surface-100 hover:surface-200 transition-all duration-300">
                      <div className="flex justify-content-between align-items-start mb-3">
                        <div>
                          <div className="font-semibold text-gray-900 text-lg">{m.intitule}</div>
                          <div className="text-sm text-gray-500">{m.ecole}</div>
                        </div>
                        <Tag value={`${m.tauxHoraire}€/h`} severity="info" />
                      </div>
                      <div className="grid">
                        <div className="col-6">
                          <div className="text-sm text-gray-500">Date</div>
                          <div className="font-medium">{m.date}</div>
                        </div>
                        <div className="col-6">
                          <div className="text-sm text-gray-500">Volume horaire</div>
                          <div className="font-medium">{m.heures} heures</div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-top-1 surface-300">
                        <div className="text-sm text-gray-500">Revenu généré</div>
                        <div className="font-bold text-lg text-green-600">{m.tauxHoraire * m.heures} €</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Déclaration d'activité */}
              <Card 
                title={
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-chart-bar text-orange-500"></i>
                    <span>Déclaration d'Activité</span>
                  </div>
                }
                className="shadow-sm"
              >
                <DeclarationActivites />
              </Card>
            </div>

            {/* Colonne Droite */}
            <div className="col-12 lg:col-4">
              {/* Paiements en attente */}
              <Card 
                title={
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-clock text-yellow-500"></i>
                    <span>Paiements en Attente</span>
                    <Badge value={paiementsEnAttente.length} className="ml-2 bg-yellow-500" />
                  </div>
                }
                className="shadow-sm mb-4"
              >
                <div className="space-y-4">
                  {paiementsEnAttente.map((p) => (
                    <div key={p.virement} className="p-4 border-round-xl border-1 surface-100">
                      <div className="flex justify-content-between align-items-center mb-2">
                        <div className="font-semibold text-gray-900">{p.virement}</div>
                        <div className="text-lg font-bold text-green-600">{p.montant} €</div>
                      </div>
                      <div className="text-sm text-gray-500 mb-3">Date estimée: {p.dateEstimee}</div>
                      <ProgressBar value={60} className="h-2 mb-3" />
                      <div className="text-xs text-gray-500">En cours de traitement</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Notifications */}
              <Card 
                title={
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-bell text-purple-500"></i>
                    <span>Notifications Récentes</span>
                  </div>
                }
                className="shadow-sm mb-4"
              >
                <div className="space-y-3">
                  <div className="flex align-items-start gap-3 p-3 border-round-lg bg-blue-50 border-1 border-blue-200">
                    <i className="pi pi-file-pdf text-blue-500 mt-1"></i>
                    <div>
                      <div className="font-medium text-gray-900">Nouvelle facture générée</div>
                      <div className="text-sm text-gray-600">FAC-2025-003 est disponible</div>
                    </div>
                  </div>
                  <div className="flex align-items-start gap-3 p-3 border-round-lg bg-green-50 border-1 border-green-200">
                    <i className="pi pi-check-circle text-green-500 mt-1"></i>
                    <div>
                      <div className="font-medium text-gray-900">Paiement validé</div>
                      <div className="text-sm text-gray-600">VIR-8840 a été traité</div>
                    </div>
                  </div>
                  <div className="flex align-items-start gap-3 p-3 border-round-lg bg-yellow-50 border-1 border-yellow-200">
                    <i className="pi pi-user-edit text-yellow-500 mt-1"></i>
                    <div>
                      <div className="font-medium text-gray-900">Profil mis à jour</div>
                      <div className="text-sm text-gray-600">Vos modifications ont été sauvegardées</div>
                    </div>
                  </div>
                  <div className="flex align-items-start gap-3 p-3 border-round-lg bg-purple-50 border-1 border-purple-200">
                    <i className="pi pi-briefcase text-purple-500 mt-1"></i>
                    <div>
                      <div className="font-medium text-gray-900">Nouvelle mission</div>
                      <div className="text-sm text-gray-600">Atelier IA confirmé</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Profil Rapide */}
              <Card 
                title={
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-user-edit text-gray-500"></i>
                    <span>Profil Public</span>
                  </div>
                }
                className="shadow-sm"
              >
                <div className="space-y-4">
                  <div className="text-center">
                    <Avatar 
                      icon="pi pi-user" 
                      size="xlarge" 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg mb-3" 
                      shape="circle" 
                    />
                    <div className="font-semibold text-gray-900">Expert STEM</div>
                    <div className="text-sm text-gray-500">Intervenant Vizion Academy</div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                    <InputTextarea 
                      rows={3} 
                      value={profil.bio} 
                      onChange={(e) => setProfil({ ...profil, bio: e.target.value })} 
                      className="w-full text-sm"
                    />
                  </div>

                  <div className="grid">
                    <div className="col-12">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Compétences</label>
                      <InputText 
                        value={profil.competences} 
                        onChange={(e) => setProfil({ ...profil, competences: e.target.value })} 
                        className="w-full text-sm"
                      />
                    </div>
                  </div>

                  <Button 
                    label="Mettre à jour le profil" 
                    icon="pi pi-save" 
                    className="w-full bg-gray-800 border-gray-800 hover:bg-gray-900 shadow-lg"
                    onClick={() => alert('Profil enregistré')}
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Sidebar Mobile */}
      <Sidebar 
        visible={sidebarVisible} 
        onHide={() => setSidebarVisible(false)}
        className="w-80"
        position="left"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex align-items-center gap-3">
            <Avatar 
              icon="pi pi-graduation-cap" 
              size="large" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg" 
              shape="circle" 
            />
            <div>
              <div className="font-bold text-gray-900">Vizion Academy</div>
              <div className="text-sm text-gray-500">Espace Intervenant</div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Menu 
            model={menuItems} 
            className="border-none w-full"
          />
        </div>

      </Sidebar>
    </div>
  );
};

export default DashboardIntervenant;