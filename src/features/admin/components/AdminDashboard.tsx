import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { classNames } from 'primereact/utils';
import type { AdminUser } from '../adminService';

// PrimeReact Components
import { Menubar } from 'primereact/menubar';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
// import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';
import { ProgressBar } from 'primereact/progressbar';
import { Chart } from 'primereact/chart';
// import { DataTable } from 'primereact/datatable';
// import { Column } from 'primereact/column';
import { Timeline } from 'primereact/timeline';
import { PanelMenu } from 'primereact/panelmenu';

// Icons
import {
    FaTachometerAlt,
    FaUsers,
    FaSchool,
    FaFileContract,
    FaMoneyBillWave,
    FaCheckCircle,
    FaTrophy,
    FaImages,
    // FaBell,
    // FaSignOutAlt,
    // FaBars,
    FaChevronUp,
    FaChevronDown,
    FaUserCheck,
    // FaChartLine
} from 'react-icons/fa';

interface AdminDashboardProps {
    admin: AdminUser;
    onLogout: () => void;
}

interface MenuItem {
    label: string;
    icon: React.ReactNode;
    items?: MenuItem[];
    command?: () => void;
}

interface StatCard {
    title: string;
    value: string;
    change: number;
    icon: React.ReactNode;
    color: string;
    subtitle: string;
}

interface Activity {
    id: number;
    title: string;
    time: string;
    icon: string;
    type: 'success' | 'info' | 'warn' | 'error';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onLogout }) => {
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [selectedKey, setSelectedKey] = useState('dashboard');
    const navigate = useNavigate();

    const menuItems: MenuItem[] = useMemo(() => [
        {
            label: 'Tableau de bord',
            icon: <FaTachometerAlt className="mr-2" />,
            command: () => handleMenuClick('dashboard')
        },
        {
            label: 'Gestion Utilisateurs',
            icon: <FaUsers className="mr-2" />,
            items: [
                {
                    label: 'Intervenants',
                    icon: <FaUserCheck className="mr-2" />,
                    command: () => handleMenuClick('users/intervenants')
                },
                {
                    label: 'Écoles',
                    icon: <FaSchool className="mr-2" />,
                    command: () => handleMenuClick('users/ecoles')
                }
            ]
        },
        {
            label: 'Missions',
            icon: <FaFileContract className="mr-2" />,
            command: () => handleMenuClick('missions')
        },
        {
            label: 'Finances',
            icon: <FaMoneyBillWave className="mr-2" />,
            items: [
                {
                    label: 'Factures',
                    icon: <FaFileContract className="mr-2" />,
                    command: () => handleMenuClick('finances/factures')
                },
                {
                    label: 'Paiements',
                    icon: <FaMoneyBillWave className="mr-2" />,
                    command: () => window.location.href = '/admin/paiements'
                }
            ]
        },
        {
            label: 'Validation Profils',
            icon: <FaCheckCircle className="mr-2" />,
            command: () => handleMenuClick('validation')
        },
        {
            label: 'Gestion Challenges',
            icon: <FaTrophy className="mr-2" />,
            command: () => handleMenuClick('challenges')
        },
        {
            label: 'Gestion Contenus',
            icon: <FaImages className="mr-2" />,
            command: () => handleMenuClick('content')
        }
    ], []);

    const stats: StatCard[] = useMemo(() => [
        {
            title: 'Intervenants',
            value: '1,248',
            change: 12.5,
            icon: <FaUsers size={24} />,
            color: 'bg-blue-500',
            subtitle: '+32 ce mois'
        },
        {
            title: 'Écoles',
            value: '86',
            change: 8.2,
            icon: <FaSchool size={24} />,
            color: 'bg-green-500',
            subtitle: '+5 ce mois'
        },
        {
            title: 'Missions Actives',
            value: '156',
            change: -2.1,
            icon: <FaFileContract size={24} />,
            color: 'bg-purple-500',
            subtitle: 'En cours'
        },
        {
            title: 'Revenus Mensuels',
            value: '45.8K€',
            change: 18.7,
            icon: <FaMoneyBillWave size={24} />,
            color: 'bg-orange-500',
            subtitle: '+7.2K€ vs mois dernier'
        }
    ], []);

    const recentActivities: Activity[] = useMemo(() => [
        { id: 1, title: 'Nouvel intervenant inscrit', time: 'Il y a 5 min', icon: 'pi pi-user-plus', type: 'success' },
        { id: 2, title: 'Paiement reçu - École ABC', time: 'Il y a 1h', icon: 'pi pi-dollar', type: 'info' },
        { id: 3, title: 'Mission #1234 complétée', time: 'Il y a 2h', icon: 'pi pi-check-circle', type: 'success' },
        { id: 4, title: '3 profils en attente de validation', time: 'Il y a 5h', icon: 'pi pi-exclamation-triangle', type: 'warn' },
        { id: 5, title: 'Nouveau challenge créé', time: 'Il y a 1 jour', icon: 'pi pi-trophy', type: 'info' }
    ], []);

    const chartData = useMemo(() => {
        return {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
            datasets: [
                {
                    label: 'Revenus (K€)',
                    data: [12, 19, 15, 25, 22, 30],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Missions',
                    data: [28, 35, 42, 38, 45, 52],
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        };
    }, []);

    const chartOptions = useMemo(() => {
        return {
            maintainAspectRatio: false,
            aspectRatio: 0.6,
            plugins: {
                legend: {
                    labels: {
                        color: '#6B7280'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#6B7280'
                    },
                    grid: {
                        color: '#E5E7EB'
                    }
                },
                y: {
                    ticks: {
                        color: '#6B7280'
                    },
                    grid: {
                        color: '#E5E7EB'
                    }
                }
            }
        };
    }, []);

    const handleMenuClick = (key: string) => {
        setSelectedKey(key);

        // Gestion de la navigation
        switch (key) {
            case 'finances/paiements':
                navigate('/admin/paiements');
                break;
            case 'dashboard':
                navigate('/admin/dashboard');
                break;
            case 'validation':
                navigate('/admin/intervenants/en-attente');
                break;
            // Ajoutez d'autres cas de navigation ici si nécessaire
            default:
                console.log(`Navigation vers: ${key}`);
        }
    };

    const getActivityIcon = (type: Activity['type']) => {
        const icons = {
            success: 'text-green-500',
            info: 'text-blue-500',
            warn: 'text-yellow-500',
            error: 'text-red-500'
        };
        return icons[type];
    };

    const renderDashboard = () => (
        <div className="p-4">
            <div className="flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
                    <p className="text-gray-600">Bienvenue, {admin.nom_admin}</p>
                </div>
                <div className="flex gap-2">
                    <Button icon="pi pi-download" label="Exporter" className="p-button-outlined" />
                    <Button icon="pi pi-refresh" label="Actualiser" />
                </div>
            </div>

            <Divider />

            {/* Stats Cards */}
            <div className="grid">
                {stats.map((stat, index) => (
                    <div key={index} className="col-12 md:col-6 lg:col-3">
                        <Card className="shadow-1 hover:shadow-3 transition-all transition-duration-300">
                            <div className="flex justify-content-between align-items-start mb-3">
                                <div className={classNames('p-3 border-round-lg text-white', stat.color)}>
                                    {stat.icon}
                                </div>
                                <div className="text-right">
                                    <span className={classNames('font-bold text-sm',
                                        stat.change >= 0 ? 'text-green-500' : 'text-red-500')}>
                                        {stat.change >= 0 ? <FaChevronUp className="mr-1" /> : <FaChevronDown className="mr-1" />}
                                        {Math.abs(stat.change)}%
                                    </span>
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-900 mb-1">{stat.value}</h2>
                            <p className="text-600 font-medium mb-2">{stat.title}</p>
                            <p className="text-sm text-500">{stat.subtitle}</p>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Charts and Activities */}
            <div className="grid mt-4">
                <div className="col-12 lg:col-8">
                    <Card title="Aperçu des performances" className="h-full">
                        <Chart type="line" data={chartData} options={chartOptions} height="300px" />
                    </Card>
                </div>
                <div className="col-12 lg:col-4">
                    <Card title="Activités récentes" className="h-full">
                        <Timeline
                            value={recentActivities}
                            content={(item: Activity) => (
                                <div className="flex flex-column">
                                    <span className="font-medium text-900">{item.title}</span>
                                    <small className="text-500">{item.time}</small>
                                </div>
                            )}
                            marker={(item: Activity) => (
                                <span className={classNames('flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle',
                                    getActivityIcon(item.type))}>
                                    <i className={item.icon}></i>
                                </span>
                            )}
                        />
                    </Card>
                </div>
            </div>

            {/* Quick Actions and Progress */}
            <div className="grid mt-4">
                <div className="col-12 lg:col-6">
                    <Card title="Actions rapides">
                        <div className="grid">
                            <div className="col-12 md:col-6 mb-3">
                                <Button
                                    icon="pi pi-check-circle"
                                    label="Valider profils"
                                    className="w-full p-button-outlined p-button-success justify-content-start"
                                    onClick={() => handleMenuClick('validation')}
                                />
                            </div>
                            <div className="col-12 md:col-6 mb-3">
                                <Button
                                    icon="pi pi-file"
                                    label="Voir missions"
                                    className="w-full p-button-outlined justify-content-start"
                                    onClick={() => handleMenuClick('missions')}
                                />
                            </div>
                            <div className="col-12 md:col-6">
                                <Button
                                    icon="pi pi-dollar"
                                    label="Paiements"
                                    className="w-full p-button-outlined justify-content-start"
                                    onClick={() => handleMenuClick('finances/paiements')}
                                />
                            </div>
                            <div className="col-12 md:col-6">
                                <Button
                                    icon="pi pi-chart-line"
                                    label="Rapports"
                                    className="w-full p-button-outlined justify-content-start"
                                />
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 lg:col-6">
                    <Card title="Progression du mois">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-content-between mb-2">
                                    <span>Nouveaux utilisateurs</span>
                                    <span className="font-bold">75%</span>
                                </div>
                                <ProgressBar value={75} className="mb-3" />
                            </div>
                            <div>
                                <div className="flex justify-content-between mb-2">
                                    <span>Missions complétées</span>
                                    <span className="font-bold">60%</span>
                                </div>
                                <ProgressBar value={60} className="mb-3" />
                            </div>
                            <div>
                                <div className="flex justify-content-between mb-2">
                                    <span>Objectif revenus</span>
                                    <span className="font-bold">85%</span>
                                </div>
                                <ProgressBar value={85} />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );

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
            <Button
                icon="pi pi-bell"
                className="p-button-text p-button-plain relative"
                badge="5"
                badgeClassName="p-badge-danger"
            />
            <div className="flex align-items-center gap-2">
                <Avatar
                    icon="pi pi-user"
                    shape="circle"
                    image={admin.avatar}
                    className="mr-2"
                />
                <div className="hidden md:flex flex-column">
                    <span className="font-medium">{admin.nom_admin}</span>
                    <small className="text-500">Administrateur</small>
                </div>
            </div>
            <Button
                icon="pi pi-sign-out"
                className="p-button-text p-button-plain"
                tooltip="Déconnexion"
                tooltipOptions={{ position: 'bottom' }}
                onClick={onLogout}
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Menubar start={startContent} end={endContent} className="shadow-2 sticky top-0 z-5" />

            <div className="flex">
                {/* Sidebar */}
                {sidebarVisible && (
                    <div className="w-64 h-screen sticky top-0 bg-white shadow-2 z-4">
                        <div className="p-4 border-bottom-1 surface-border">
                            <h3 className="text-lg font-semibold text-900">Navigation</h3>
                        </div>
                        <PanelMenu model={menuItems} className="w-full border-none" />
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1">
                    {selectedKey === 'dashboard' ? renderDashboard() : (
                        <div className="p-4">
                            <div className="flex align-items-center justify-content-between mb-4">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {menuItems.find(item => item.label === selectedKey)?.label || selectedKey}
                                </h1>
                            </div>
                            <Divider />
                            <Card>
                                <div className="text-center py-8">
                                    <i className="pi pi-cog text-6xl text-500 mb-4"></i>
                                    <h3 className="text-xl font-semibold mb-2">Section en développement</h3>
                                    <p className="text-600">
                                        Le contenu de la section "{selectedKey}" sera disponible prochainement.
                                    </p>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;