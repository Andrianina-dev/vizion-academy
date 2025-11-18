import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { Badge } from 'primereact/badge';
import { Skeleton } from 'primereact/skeleton';
import { Ripple } from 'primereact/ripple';
import { Divider } from 'primereact/divider';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { NotificationBell } from '../../components/Notifications/NotificationBell';

// Services
import { getIntervenantConnecte } from '../../services/intervenantService';

// Composants
import PageHeader from "../../components/PageHeader";
import FactureListIntervenant from '../../components/FactureListIntervenant';
import PaiementsEnAttente from '../../components/Paiements/PaiementsEnAttente';
import DeclarationActivites from '../../components/Paiements/DeclarationActivites';
import ProfilPublic from '../../components/Profil/ProfilPublic';

// Styles PrimeReact
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

interface DashboardIntervenantProps { }

interface DashboardStats {
  facturesEnAttente: number;
  facturesPayees: number;
  montantAttente: number;
  notificationsNonLues: number;
  missionsEnCours: number;
}

const DashboardIntervenant: React.FC<DashboardIntervenantProps> = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [intervenant, setIntervenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mettre à jour le compteur de notifications non lues dans les stats
  useEffect(() => {
    if (unreadCount >= 0) {
      setStats(prev => ({
        ...prev,
        notificationsNonLues: unreadCount
      }));
    }
  }, [unreadCount]);

  // Statistiques pour le tableau de bord
  const [stats, setStats] = useState<DashboardStats>({
    facturesEnAttente: 2,
    facturesPayees: 5,
    montantAttente: 1850,
    notificationsNonLues: 3,
    missionsEnCours: 4
  });

  // Charger l'intervenant connecté
  useEffect(() => {
    const loadIntervenant = async () => {
      setLoading(true);
      try {
        const intervenantConnecte = getIntervenantConnecte();
        setIntervenant(intervenantConnecte);

        // Simuler un chargement asynchrone
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mettre à jour le compteur de notifications non lues
        if (intervenantConnecte?.id_intervenant) {
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_API_URL}/api/notifications/intervenant/${intervenantConnecte.id_intervenant}`,
              {
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                }
              }
            );

            if (response.data?.success && Array.isArray(response.data.data)) {
              const unread = response.data.data.filter((n: any) => !n.lu).length;
              setUnreadCount(unread);
            }
          } catch (error) {
            console.error('Erreur lors du chargement des notifications:', error);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIntervenant();
  }, []);

  // Cartes de statistiques
  const StatCard = ({
    title,
    value,
    subtitle,
    color = 'blue',
    icon,
    loading = false
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    color?: string;
    icon?: string;
    loading?: boolean;
  }) => {
    const colorClasses: { [key: string]: string } = {
      blue: 'bg-blue-50 border-blue-200 text-blue-600',
      green: 'bg-green-50 border-green-200 text-green-600',
      purple: 'bg-purple-50 border-purple-200 text-purple-600',
      orange: 'bg-orange-50 border-orange-200 text-orange-600',
      red: 'bg-red-50 border-red-200 text-red-600'
    };

    if (loading) {
      return (
        <Card className="h-full">
          <div className="flex align-items-start">
            <Skeleton shape="circle" size="3rem" className="mr-3"></Skeleton>
            <div className="flex-1">
              <Skeleton width="60%" className="mb-2"></Skeleton>
              <Skeleton width="40%" className="mb-2"></Skeleton>
              <Skeleton width="80%"></Skeleton>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className={`h-full border-1 ${colorClasses[color]}`}>
        <div className="flex align-items-start">
          {icon && (
            <Avatar
              icon={icon}
              size="large"
              className={`mr-3 ${colorClasses[color].replace('50', '100').replace('200', '300')}`}
            />
          )}
          <div className="flex-1">
            <div className="text-2xl font-bold mb-1">{value}</div>
            <div className="text-lg font-medium mb-2">{title}</div>
            <div className="text-sm text-gray-600">{subtitle}</div>
          </div>
        </div>
      </Card>
    );
  };

  // En-tête personnalisé pour les onglets
  const CustomTabHeader = ({
    title,
    icon,
    badge,
    active
  }: {
    title: string;
    icon: string;
    badge?: number;
    active: boolean;
  }) => (
    <div className="flex align-items-center gap-2 p-3 relative">
      <i className={`pi ${icon} ${active ? 'text-primary' : 'text-gray-600'}`}></i>
      <span className={active ? 'font-medium text-primary' : 'text-gray-700'}>
        {title}
      </span>
      {badge && badge > 0 && (
        <Badge
          value={badge}
          className="ml-2"
          size="normal"
          severity="danger"
        />
      )}
      <Ripple />
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-intervenant p-4">
        <PageHeader
          title="Tableau de bord intervenant"
          subtitle="Chargement..."
          breadcrumb={[
            { title: 'Accueil', path: '/' },
            { title: 'Tableau de bord' }
          ]}
        />
        <div className="grid mt-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="col-12 md:col-6 lg:col-3">
              <Card>
                <Skeleton width="100%" height="120px"></Skeleton>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-intervenant p-4">
      <PageHeader
        title={`Bonjour, ${intervenant?.prenom || 'Intervenant'}`}
        subtitle="Gérez vos missions, factures et paiements en un seul endroit"
        breadcrumb={[
          { title: 'Accueil', path: '/' },
          { title: 'Tableau de bord' }
        ]}
      />

      {/* Section Statistiques */}
      <div className="grid mt-4">
        <div className="col-12 md:col-6 lg:col-3">
          <StatCard
            title="Factures en attente"
            value={stats.facturesEnAttente}
            subtitle="En attente de paiement"
            color="orange"
            icon="pi pi-file-pdf"
            loading={loading}
          />
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <StatCard
            title="Factures payées"
            value={stats.facturesPayees}
            subtitle="Paiements complétés"
            color="green"
            icon="pi pi-check-circle"
            loading={loading}
          />
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <StatCard
            title="Montant en attente"
            value={new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.montantAttente)}
            subtitle="Total à recevoir"
            color="purple"
            icon="pi pi-euro"
            loading={loading}
          />
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <StatCard
            title="Missions en cours"
            value={stats.missionsEnCours}
            subtitle="Activités actuelles"
            color="blue"
            icon="pi pi-briefcase"
            loading={loading}
          />
        </div>
      </div>

      {/* Onglets Principaux */}
      <Card className="mt-4 shadow-2">
        <TabView
          activeIndex={activeTab}
          onTabChange={(e) => setActiveTab(e.index)}
          panelContainerClassName="p-3"
        >
          {/* Tableau de Bord */}
          <TabPanel
            header={
              <CustomTabHeader
                title="Tableau de bord"
                icon="pi pi-home"
                active={activeTab === 0}
              />
            }
          >
            <div className="grid">
              <div className="col-12 lg:col-8">
                <Card
                  title="Dernières factures"
                  subTitle="Vos factures récentes"
                  className="h-full"
                >
                  <FactureListIntervenant />
                </Card>
              </div>
              <div className="col-12 lg:col-4">
                <Card
                  title="Notifications récentes"
                  subTitle={`${stats.notificationsNonLues} non lues`}
                  className="h-full"
                >
                  <div className="flex flex-column gap-3">
                    <div className="flex align-items-center gap-3 p-3 border-round cursor-pointer hover:surface-100 transition-duration-150">
                      <Avatar icon="pi pi-file-pdf" size="normal" shape="circle" />
                      <div className="flex-1">
                        <div className="font-medium">Nouvelle facture</div>
                        <div className="text-sm text-gray-600">Il y a 2 heures</div>
                      </div>
                      <Tag value="Non lu" severity="danger" />
                    </div>
                    <Divider />
                    <div className="flex align-items-center gap-3 p-3 border-round cursor-pointer hover:surface-100 transition-duration-150">
                      <Avatar icon="pi pi-check-circle" size="normal" shape="circle" />
                      <div className="flex-1">
                        <div className="font-medium">Paiement confirmé</div>
                        <div className="text-sm text-gray-600">Il y a 1 jour</div>
                      </div>
                    </div>
                    <Divider />
                    <div className="flex align-items-center gap-3 p-3 border-round cursor-pointer hover:surface-100 transition-duration-150">
                      <Avatar icon="pi pi-bell" size="normal" shape="circle" />
                      <div className="flex-1">
                        <div className="font-medium">Mission mise à jour</div>
                        <div className="text-sm text-gray-600">Il y a 2 jours</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabPanel>

          {/* Factures */}
          <TabPanel
            header={
              <CustomTabHeader
                title="Factures"
                icon="pi pi-file-pdf"
                badge={stats.facturesEnAttente}
                active={activeTab === 1}
              />
            }
          >
            <FactureListIntervenant />
          </TabPanel>

          {/* Paiements */}
          <TabPanel
            header={
              <CustomTabHeader
                title="Paiements"
                icon="pi pi-euro"
                active={activeTab === 2}
              />
            }
          >
            <PaiementsEnAttente
              intervenantId={intervenant?.id_intervenant || null}
            />
          </TabPanel>

          {/* Notifications */}
          <TabPanel
            header={
              <CustomTabHeader
                title="Notifications"
                icon="pi pi-bell"
                badge={stats.notificationsNonLues}
                active={activeTab === 3}
              />
            }
          >
            <Card>
              <div className="flex justify-content-between align-items-center mb-4">
                <div>
                  <h4 className="text-xl font-semibold m-0">Mes notifications</h4>
                  <p className="text-gray-600 m-0 mt-2">
                    Restez informé de vos activités et paiements
                  </p>
                </div>
                {stats.notificationsNonLues > 0 && (
                  <Tag
                    value={`${stats.notificationsNonLues} non lue${stats.notificationsNonLues > 1 ? 's' : ''}`}
                    severity="warning"
                  />
                )}
              </div>

              <div className="notification-container">
                <NotificationBell
                  userId={intervenant?.id_intervenant}
                  userType="intervenant"
                  onUnreadCountChange={setUnreadCount}
                />
              </div>
            </Card>
          </TabPanel>

          {/* Déclaration d'activité */}
          <TabPanel
            header={
              <CustomTabHeader
                title="Déclaration"
                icon="pi pi-clipboard"
                active={activeTab === 4}
              />
            }
          >
            <DeclarationActivites />
          </TabPanel>

          {/* Profil */}
          <TabPanel
            header={
              <CustomTabHeader
                title="Mon profil"
                icon="pi pi-user"
                active={activeTab === 5}
              />
            }
          >
            <ProfilPublic />
          </TabPanel>
        </TabView>
      </Card>
    </div>
  );
};

export default DashboardIntervenant;