import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Badge } from 'primereact/badge';
import { OverlayPanel } from 'primereact/overlaypanel';
import type { OverlayPanel as OverlayPanelType } from 'primereact/overlaypanel';
import { Bell } from 'lucide-react';
import './NotificationBell.css';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { fetchNotifications, marquerCommeLue, marquerToutesCommeLues } from '../../services/notificationService';

interface Notification {
  id_notification: string;
  type_notification: string;
  messages: string;
  lu: boolean;
  date_creation: string;
}

interface NotificationBellProps {
  intervenantId: string;
  onUnreadCountChange?: (count: number) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ intervenantId, onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const op = useRef<OverlayPanelType | null>(null);
  const toast = useRef<Toast>(null);

  // Formater la date
  const formatDate = useCallback((dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date inconnue';
    }
  }, []);

  // Récupérer l'icône en fonction du type de notification
  const getNotificationIcon = useCallback((type: string) => {
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
        return 'pi pi-bell text-gray-500';
    }
  }, []);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    try {
      await marquerCommeLue(notificationId);
      
      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(n => 
          n.id_notification === notificationId ? { ...n, lu: true } : n
        )
      );
      
      // Mettre à jour le compteur de notifications non lues
      const newUnreadCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newUnreadCount);
      
      // Notifier le composant parent du changement
      if (onUnreadCountChange) {
        onUnreadCountChange(newUnreadCount);
      }
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de marquer la notification comme lue',
        life: 3000
      });
    }
  }, [intervenantId, unreadCount, onUnreadCountChange]);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (unreadCount === 0) return;
    
    try {
      await marquerToutesCommeLues(intervenantId, 'intervenant');
      
      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(n => ({ ...n, lu: true }))
      );
      
      // Mettre à jour le compteur de notifications non lues
      setUnreadCount(0);
      
      // Notifier le composant parent du changement
      if (onUnreadCountChange) {
        onUnreadCountChange(0);
      }
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de marquer toutes les notifications comme lues',
        life: 3000
      });
    }
  }, [intervenantId, unreadCount, onUnreadCountChange]);

  // Charger les notifications au montage et quand l'ID de l'intervenant change
  useEffect(() => {
    if (intervenantId) {
      loadNotifications();
      // Rafraîchir les notifications toutes les 5 minutes
      const interval = setInterval(loadNotifications, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [intervenantId, onUnreadCountChange]);

  // Mettre à jour le compteur de notifications non lues
  useEffect(() => {
    const unread = notifications.filter(n => !n.lu).length;
    setUnreadCount(unread);
    // Appeler la fonction de rappel si elle est fournie
    if (onUnreadCountChange) {
      onUnreadCountChange(unread);
    }
  }, [notifications, onUnreadCountChange]);

  // Fonction pour charger les notifications
  const loadNotifications = useCallback(async () => {
    if (!intervenantId) return;
    
    setLoading(true);
    try {
      console.log('Chargement des notifications pour l\'intervenant:', intervenantId);
      const response = await fetchNotifications({
        user_id: intervenantId,
        user_type: 'intervenant',
        sort_by: 'date_creation',
        sort_order: 'desc',
        unread_only: false
      });
      
      console.log('Réponse des notifications:', response);
      
      if (response && response.data) {
        setNotifications(response.data);
        const unread = response.data.filter(n => !n.lu).length;
        setUnreadCount(unread);
        onUnreadCountChange?.(unread);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de charger les notifications',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  }, [intervenantId, onUnreadCountChange]);

  return (
    <div className="notification-bell relative">
      <Toast ref={toast} position="top-right" />
      
      <Button 
        type="button" 
        icon={<Bell size={20} className="text-gray-600" />}
        rounded 
        text 
        severity="secondary"
        onClick={(e) => {
          op.current?.toggle(e);
          loadNotifications(); // Rafraîchir les notifications à chaque ouverture
        }}
        className="p-overlay-badge relative hover:bg-gray-100"
        aria-label="Notifications"
        tooltip="Voir les notifications"
        tooltipOptions={{ position: 'bottom' }}
      >
        {unreadCount > 0 && (
          <Badge 
            value={unreadCount > 9 ? '9+' : unreadCount} 
            severity="danger" 
            className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center"
            style={{ fontSize: '0.65rem' }}
          />
        )}
      </Button>
      
      <OverlayPanel 
        ref={op} 
        className="w-80 max-h-96 overflow-y-auto shadow-lg border border-gray-200"
        showCloseIcon
        id="notification-panel"
        dismissable
        onHide={() => {
          // Rafraîchir les notifications lors de la fermeture
          fetchNotifications({
            user_id: intervenantId,
            user_type: 'intervenant',
            sort_by: 'date_creation',
            sort_order: 'desc'
          });
        }}
      >
        <div className="sticky top-0 bg-white z-10 pt-2 px-3 pb-1 border-b border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <h5 className="font-bold text-lg m-0 text-gray-800">Notifications</h5>
            <Button 
              label="Tout marquer comme lu" 
              size="small" 
              text 
              disabled={unreadCount === 0}
              onClick={markAllAsRead}
              className="p-button-text p-button-sm text-primary"
              aria-label="Marquer toutes les notifications comme lues"
            />
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-6">
              <i className="pi pi-spin pi-spinner text-2xl text-primary mb-2"></i>
              <p className="text-gray-500">Chargement des notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-6">
              <i className="pi pi-bell-slash text-3xl text-gray-300 mb-2"></i>
              <p className="text-gray-500">Aucune notification pour le moment</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id_notification} 
                className={`p-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer ${
                  !notification.lu ? 'bg-blue-50' : ''
                }`}
                onClick={(e) => !notification.lu && markAsRead(notification.id_notification, e)}
              >
                <div className="flex items-start">
                  <i 
                    className={`${getNotificationIcon(notification.type_notification)} mt-1 mr-3 text-xl`}
                    aria-hidden="true"
                  ></i>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 mb-1 leading-tight">
                      {notification.messages}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(notification.date_creation)}
                    </p>
                  </div>
                  {!notification.lu && (
                    <span 
                      className="w-2 h-2 rounded-full bg-blue-500 mt-2 ml-2 flex-shrink-0"
                      aria-label="Non lue"
                    ></span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-3 py-2 text-center">
            <Button 
              label="Tout marquer comme lu" 
              size="small" 
              text 
              disabled={unreadCount === 0}
              onClick={markAllAsRead}
              className="w-full justify-center"
              icon="pi pi-check"
              iconPos="right"
            />
          </div>
        )}
      </OverlayPanel>
    </div>
  );
};

export default NotificationBell;
