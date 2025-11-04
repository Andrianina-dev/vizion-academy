import React, { useState, useEffect, useRef } from 'react';
import { Badge } from 'primereact/badge';
import { OverlayPanel } from 'primereact/overlaypanel';
import type { OverlayPanel as OverlayPanelType } from 'primereact/overlaypanel';
import { Bell } from 'lucide-react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import axios from 'axios';

interface Notification {
  id_notification: string;
  type_notification: string;
  messages: string;
  lu: boolean;
  date_creation: string;
}

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const op = useRef<OverlayPanelType | null>(null);
  const toast = useRef<Toast>(null);

  // Récupérer les notifications
  const fetchNotifications = async () => {
    const intervenantId = localStorage.getItem('intervenantId');
    if (!intervenantId) {
      console.error('ID intervenant non trouvé');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/intervenants/${intervenantId}/notifications`
      );
      
      if (response.data.success) {
        setNotifications(response.data.data);
        const unread = response.data.data.filter((n: Notification) => !n.lu).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de charger les notifications',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (id: string) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/notifications/${id}/marquer-lue`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(n => 
          n.id_notification === id ? { ...n, lu: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/notifications/tout-marquer-lu`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(n => ({ ...n, lu: true }))
      );
      setUnreadCount(0);
      
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Récupérer l'icône en fonction du type de notification
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'facture_generee':
        return 'pi pi-file-pdf text-red-500';
      case 'paiement_valide':
        return 'pi pi-check-circle text-green-500';
      case 'profil_accepte':
        return 'pi pi-check text-green-500';
      case 'profil_rejete':
        return 'pi pi-times-circle text-red-500';
      case 'mission_confirmee':
        return 'pi pi-send text-blue-500';
      default:
        return 'pi pi-bell';
    }
  };

  // Charger les notifications au montage du composant
  useEffect(() => {
    fetchNotifications();
    
    // Récupérer les nouvelles notifications toutes les minutes
    const interval = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <Toast ref={toast} />
      
      <Button 
        type="button" 
        icon={<Bell size={20} />}
        rounded 
        text 
        severity="secondary"
        onClick={(e) => {
          op.current?.toggle(e);
          if (unreadCount > 0) {
            markAllAsRead();
          }
        }}
        className="p-overlay-badge relative"
      >
        {unreadCount > 0 && (
          <Badge value={unreadCount} severity="danger" className="absolute -top-1 -right-1" />
        )}
      </Button>
      
      <OverlayPanel 
        ref={op} 
        className="w-80 max-h-96 overflow-y-auto"
        showCloseIcon
        id="overlay_panel"
      >
        <div className="flex justify-between items-center mb-3">
          <h5 className="font-bold m-0">Notifications</h5>
          <Button 
            label="Tout marquer comme lu" 
            size="small" 
            text 
            disabled={unreadCount === 0}
            onClick={markAllAsRead}
          />
        </div>
        
        {loading ? (
          <div className="text-center p-4">
            <i className="pi pi-spin pi-spinner"></i> Chargement...
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            Aucune notification
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => (
              <div 
                key={notification.id_notification} 
                className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.lu ? 'bg-blue-50' : ''}`}
                onClick={() => markAsRead(notification.id_notification)}
              >
                <div className="flex items-start">
                  <i className={`${getNotificationIcon(notification.type_notification)} mt-1 mr-3`}></i>
                  <div className="flex-1">
                    <p className="text-sm mb-1">{notification.messages}</p>
                    <p className="text-xs text-gray-500">{formatDate(notification.date_creation)}</p>
                  </div>
                  {!notification.lu && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-2"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </OverlayPanel>
    </div>
  );
};

export default NotificationBell;
