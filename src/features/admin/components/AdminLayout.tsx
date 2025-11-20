import React, { useMemo, useState } from 'react';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { PanelMenu } from 'primereact/panelmenu';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface MenuItem {
    label: string;
    icon?: React.ReactNode;
    items?: MenuItem[];
    command?: () => void;
}

interface AdminLayoutProps {
    children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const navigate = useNavigate();
    const { admin, logout } = useAuth();

    const handleMenuClick = (key: string) => {
        switch (key) {
            case 'dashboard':
                navigate('/admin/dashboard');
                break;
            case 'users/intervenants':
                navigate('/admin/intervenants/tous');
                break;
            case 'users/ecoles':
                console.log('Navigate to: users/ecoles');
                break;
            case 'missions':
                console.log('Navigate to: missions');
                break;
            case 'finances/factures':
                console.log('Navigate to: finances/factures');
                break;
            case 'finances/paiements':
                navigate('/admin/paiements');
                break;
            case 'validation':
                console.log('Navigate to: validation');
                break;
            case 'challenges':
                console.log('Navigate to: challenges');
                break;
            case 'content':
                console.log('Navigate to: content');
                break;
            default:
                console.log(`Navigation vers: ${key}`);
        }
    };

    const menuItems: MenuItem[] = useMemo(() => [
        {
            label: 'Tableau de bord',
            icon: <i className="pi pi-chart-bar mr-2" />,
            command: () => handleMenuClick('dashboard')
        },
        {
            label: 'Gestion Utilisateurs',
            icon: <i className="pi pi-users mr-2" />,
            items: [
                {
                    label: 'Intervenants',
                    icon: <i className="pi pi-user mr-2" />,
                    command: () => handleMenuClick('users/intervenants')
                },
                {
                    label: 'Écoles',
                    icon: <i className="pi pi-building mr-2" />,
                    command: () => handleMenuClick('users/ecoles')
                }
            ]
        },
        {
            label: 'Missions',
            icon: <i className="pi pi-file mr-2" />,
            command: () => handleMenuClick('missions')
        },
        {
            label: 'Finances',
            icon: <i className="pi pi-wallet mr-2" />,
            items: [
                {
                    label: 'Factures',
                    icon: <i className="pi pi-file mr-2" />,
                    command: () => handleMenuClick('finances/factures')
                },
                {
                    label: 'Paiements',
                    icon: <i className="pi pi-credit-card mr-2" />,
                    command: () => handleMenuClick('finances/paiements')
                }
            ]
        },
        {
            label: 'Validation Profils',
            icon: <i className="pi pi-check-circle mr-2" />,
            command: () => handleMenuClick('validation')
        },
        {
            label: 'Gestion Challenges',
            icon: <i className="pi pi-star mr-2" />,
            command: () => handleMenuClick('challenges')
        },
        {
            label: 'Gestion Contenus',
            icon: <i className="pi pi-images mr-2" />,
            command: () => handleMenuClick('content')
        }
    ], []);

    const startContent = (
        <div className="flex align-items-center">
            <Button
                icon="pi pi-bars"
                className="p-button-text p-button-plain mr-3"
                onClick={() => setSidebarVisible(!sidebarVisible)}
            />
            <div className="flex align-items-center">
                <i className="pi pi-star-fill text-blue-500 text-2xl mr-2"></i>
                <span className="text-xl font-bold text-900">Vizion Academy</span>
            </div>
        </div>
    );

    const endContent = (
        <div className="flex align-items-center gap-3">
            <div className="flex align-items-center gap-2">
                <Avatar
                    icon="pi pi-user"
                    shape="circle"
                    image={admin?.avatar}
                    className="mr-2"
                />
                <div className="hidden md:flex flex-column">
                    <span className="font-medium">{admin?.nom_admin}</span>
                    <small className="text-500">Administrateur</small>
                </div>
            </div>
            <Button
                icon="pi pi-sign-out"
                className="p-button-text p-button-plain"
                tooltip="Déconnexion"
                tooltipOptions={{ position: 'bottom' }}
                onClick={logout}
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Menubar start={startContent} end={endContent} className="shadow-2 sticky top-0 z-5" />

            <div className="flex">
                {sidebarVisible && (
                    <div className="w-64 h-screen sticky top-0 bg-white shadow-2 z-4">
                        <div className="p-4 border-bottom-1 surface-border">
                            <h3 className="text-lg font-semibold text-900">Navigation</h3>
                        </div>
                        <PanelMenu model={menuItems as any} className="w-full border-none" />
                    </div>
                )}

                <div className="flex-1 p-4">
                    {children || <Outlet />}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
