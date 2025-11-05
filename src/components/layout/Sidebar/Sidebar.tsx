import React from 'react';
import { Sidebar as PrimeSidebar } from 'primereact/sidebar';
import { classNames } from 'primereact/utils';

interface SidebarProps {
  visible: boolean;
  onHide: () => void;
  onSelect: (section: string) => void;
  activeSection: string;
}

const Sidebar: React.FC<SidebarProps> = ({ visible, onHide, onSelect, activeSection }) => {
  const menuItems = [
    { label: 'Accueil', icon: 'pi pi-home', section: 'accueil' },
    { label: 'Missions', icon: 'pi pi-briefcase', section: 'missions' },
    { label: 'Mes Intervenants', icon: 'pi pi-star', section: 'intervenants' },
    { label: 'Factures', icon: 'pi pi-file', section: 'factures' },
    { label: 'Utilisateurs', icon: 'pi pi-users', section: 'utilisateurs' },
    { label: 'Paramètres', icon: 'pi pi-cog', section: 'parametres' },
    { 
      label: 'Support', 
      icon: 'pi pi-question-circle', 
      section: 'support',
      className: 'mt-auto' // Pour le pousser en bas
    },
  ];

  return (
    <PrimeSidebar visible={visible} onHide={onHide} className="w-15rem">
      <div className="flex flex-column h-full">
        <div className="flex align-items-center justify-content-center py-4 border-bottom-1 surface-border">
          <h2 className="text-900 font-bold m-0">Admin Panel</h2>
        </div>
        <div className="flex-grow-1 py-3">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => onSelect(item.section)}
              className={classNames(
                'flex align-items-center p-3 hover:surface-100 cursor-pointer border-round mb-2 transition-colors transition-duration-150',
                { 'bg-primary-50 text-primary-600 border-left-3 border-primary-500': activeSection === item.section }
              )}
            >
              <i className={classNames(
                item.icon, 
                'mr-3', 
                { 'text-primary-500': activeSection === item.section, 'text-600': activeSection !== item.section }
              )}></i>
              <span className={classNames(
                'font-medium',
                { 'text-primary-600': activeSection === item.section, 'text-900': activeSection !== item.section }
              )}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </PrimeSidebar>
  );
};

export default Sidebar;