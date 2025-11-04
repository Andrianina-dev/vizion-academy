import type { ReactNode } from 'react';
import React, { useState } from 'react';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import Sidebar from '../Sidebar/Sidebar';
import { NotificationBell } from '../../Notifications/NotificationBell';

interface DashboardLayoutProps {
  children: ReactNode;
  onSelect: (section: string) => void;
  activeSection: string;
  intervenantId: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, onSelect, activeSection, intervenantId }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const start = (
    <div className="flex align-items-center">
      <Button 
        icon="pi pi-bars" 
        className="mr-3 p-button-text" 
        onClick={() => setSidebarVisible(true)} 
      />
      <span className="text-900 font-bold text-xl">Dashboard</span>
    </div>
  );

  const end = (
    <div className="flex align-items-center gap-2">
      <NotificationBell intervenantId={intervenantId} />
      <Button icon="pi pi-user" className="p-button-text" />
    </div>
  );

  return (
    <div className="min-h-screen surface-ground">
      <Menubar start={start} end={end} className="shadow-2 mb-4" />
      
      <Sidebar 
        visible={sidebarVisible} 
        onHide={() => setSidebarVisible(false)}
        onSelect={(section) => {
          onSelect(section);
          setSidebarVisible(false); // fermer le menu après le clic
        }}
        activeSection={activeSection}
      />

      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
