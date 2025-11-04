// import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import NotificationBell from '../../Notifications/NotificationBell';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import type { MenuItem } from 'primereact/menuitem';

interface DashboardIntervenantLayoutProps {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  facturesCount?: number;
  paiementsCount?: number;
  userInfo?: {
    id?: string;
    name: string;
    role: string;
    avatar?: string;
  };
  headerActions?: ReactNode;
  intervenantId?: string;
}

const DashboardIntervenantLayout: React.FC<DashboardIntervenantLayoutProps> = ({
  children,
  activeSection,
  onSectionChange,
  facturesCount = 0,
  paiementsCount = 0,
  userInfo = { name: 'Expert STEM', role: 'Intervenant Vizion Academy' },
  intervenantId
}) => {
  // Menu items pour la sidebar
  const menuItems: MenuItem[] = [
    {
      label: 'Tableau de Bord',
      icon: 'pi pi-home',
      command: () => onSectionChange('dashboard'),
      className: activeSection === 'dashboard' ? 'bg-gray-100' : '',
      template: (item, options) => (
        <a className={`${options.className} ${activeSection === 'dashboard' ? 'bg-gray-100' : ''}`} 
           onClick={() => onSectionChange('dashboard')}>
          {item.icon && <span className={options.iconClassName}></span>}
          <span className={options.labelClassName}>{item.label}</span>
        </a>
      )
    },
    {
      label: 'Factures',
      icon: 'pi pi-file-pdf',
      className: activeSection === 'factures' ? 'bg-gray-100' : '',
      template: (item, options) => (
        <a className={`${options.className} ${activeSection === 'factures' ? 'bg-gray-100' : ''}`} 
           onClick={() => onSectionChange('factures')}>
          {item.icon && <span className={options.iconClassName}></span>}
          <span className={options.labelClassName}>{item.label}</span>
          {facturesCount > 0 && <Badge value={facturesCount} className="ml-2" />}
        </a>
      )
    },
    {
      label: 'Missions',
      icon: 'pi pi-briefcase',
      items: [
        {
          label: 'Missions en cours',
          icon: 'pi pi-clock',
          command: () => onSectionChange('missions-cours')
        },
        {
          label: 'Missions réalisées',
          icon: 'pi pi-check-circle',
          command: () => onSectionChange('missions-realisees')
        },
        {
          label: 'Planning',
          icon: 'pi pi-calendar',
          command: () => onSectionChange('planning')
        }
      ]
    },
    {
      label: 'Paiements',
      icon: 'pi pi-euro',
      className: activeSection === 'paiements' ? 'bg-gray-100' : '',
      template: (item, options) => (
        <a className={`${options.className} ${activeSection === 'paiements' ? 'bg-gray-100' : ''}`} 
           onClick={() => onSectionChange('paiements')}>
          {item.icon && <span className={options.iconClassName}></span>}
          <span className={options.labelClassName}>{item.label}</span>
          {paiementsCount > 0 && <Badge value={paiementsCount} className="ml-2" />}
        </a>
      )
    },
    {
      label: 'Déclarations',
      icon: 'pi pi-chart-bar',
      className: activeSection === 'declarations' ? 'bg-gray-100' : '',
      command: () => onSectionChange('declarations')
    },
    {
      label: 'Profil',
      icon: 'pi pi-user',
      className: activeSection === 'profil' ? 'bg-gray-100' : '',
      command: () => onSectionChange('profil')
    },
    {
      label: 'Documents',
      icon: 'pi pi-folder',
      className: activeSection === 'documents' ? 'bg-gray-100' : '',
      command: () => onSectionChange('documents')
    },
    {
      separator: true
    },
    {
      label: 'Paramètres',
      icon: 'pi pi-cog',
      className: activeSection === 'parametres' ? 'bg-gray-100' : '',
      command: () => onSectionChange('parametres')
    },
    {
      label: 'Support',
      icon: 'pi pi-question-circle',
      className: activeSection === 'support' ? 'bg-gray-100' : '',
      command: () => onSectionChange('support')
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Vizion Academy</h1>
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
              action: { className: 'hover:bg-gray-100 rounded-lg transition-colors duration-200' },
              submenuHeader: { className: 'hidden' }
            }}
          />
        </div>
      </div>

      {/* Contenu Principal */}
      <div className="flex-1 overflow-auto">
        {/* Header Mobile */}
        <div className="lg:hidden p-4 bg-white shadow-sm border-b border-gray-200">
          <div className="flex justify-content-between align-items-center">
            <div className="flex align-items-center gap-3">
              <Button 
                icon="pi pi-bars" 
                className="p-button-text p-0"
                onClick={() => {}}
              />
              <span className="font-bold text-lg">Tableau de Bord</span>
            </div>
            <Avatar 
              icon={userInfo.avatar ? undefined : 'pi pi-user'}
              image={userInfo.avatar}
              size="normal"
              className="bg-gradient-to-r from-blue-500 to-purple-600"
              shape="circle"
              title={`${userInfo.name} - ${userInfo.role}`}
            />
          </div>
        </div>

        <div className="flex align-items-center justify-content-between w-full px-4 py-2 bg-white border-bottom-1 border-200">
          <div className="flex align-items-center">
            <i className="pi pi-bars text-700 mr-3 text-xl cursor-pointer" onClick={() => {}} />
            <span className="text-900 font-semibold text-lg">Tableau de bord</span>
          </div>
          
          <div className="flex align-items-center">
            <NotificationBell intervenantId={userInfo?.id || intervenantId || ''} />
            <Menu model={menuItems} popup ref={null} id="popup_menu" />
            <Avatar 
              icon={userInfo.avatar ? undefined : 'pi pi-user'}
              image={userInfo.avatar}
              className="ml-3 cursor-pointer"
              shape="circle"
              onClick={() => {}}
              title={`${userInfo.name} - ${userInfo.role}`}
            />
          </div>
        </div>

        {/* Contenu des enfants */}
        {children}
      </div>
    </div>
  );
};

export default DashboardIntervenantLayout;
