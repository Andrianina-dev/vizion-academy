import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';

interface NotificationItem {
    id_notification: string;
    type_notification: string;
    messages: string;
    lu: boolean;
    date_creation: string;
}

interface Props {
    ecoleId: string;
    limit?: number;
}

const NotificationsEcole: React.FC<Props> = ({ ecoleId, limit = 5 }) => {
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const apiUrl = import.meta.env.VITE_API_URL;
            const url = `${apiUrl}/api/notifications?user_id=${encodeURIComponent(ecoleId)}&user_type=ecole&per_page=${limit}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok || !data?.success) {
                throw new Error(data?.message || 'Erreur lors du chargement des notifications');
            }
            const list: NotificationItem[] = Array.isArray(data.data) ? data.data : [];
            setItems(list);
        } catch (e: any) {
            setError(e?.message || 'Erreur réseau');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (ecoleId) {
            fetchNotifications();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ecoleId]);

    return (
        <Card title={<div className="flex align-items-center gap-2"><i className="pi pi-bell" /> <span>Notifications</span></div>}>
            {loading && (
                <div className="text-center py-3">
                    <i className="pi pi-spin pi-spinner" />
                </div>
            )}
            {error && (
                <div className="p-3 bg-red-50 border-1 border-red-200 border-round text-red-700">
                    {error}
                </div>
            )}
            {!loading && !error && items.length === 0 && (
                <div className="text-600">Aucune notification pour le moment.</div>
            )}
            <div className="flex flex-column gap-3">
                {items.map((n) => (
                    <div key={n.id_notification} className="p-3 border-1 border-round border-gray-200 flex align-items-start gap-3">
                        <i className="pi pi-info-circle mt-1 text-primary" />
                        <div className="flex-1">
                            <div className="flex align-items-center justify-content-between">
                                <Tag
                                    value={n.type_notification.replace(/_/g, ' ').toUpperCase()}
                                    severity={n.type_notification.includes('PAIEMENT') ? 'success' : (n.lu ? 'info' : 'warning') as any}
                                    className="text-xs"
                                />
                                <span className="text-500 text-sm">{new Date(n.date_creation).toLocaleString('fr-FR')}</span>
                            </div>
                            <div className="mt-2 text-900">{n.messages}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-3 text-right">
                <Button icon="pi pi-refresh" label="Rafraîchir" className="p-button-text" onClick={fetchNotifications} disabled={loading} />
            </div>
        </Card>
    );
};

export default NotificationsEcole;
