import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Bell, CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  showSuccess: (title: string, message: string, persistent?: boolean) => void;
  showError: (title: string, message: string, persistent?: boolean) => void;
  showWarning: (title: string, message: string, persistent?: boolean) => void;
  showInfo: (title: string, message: string, persistent?: boolean) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  requestPermission: () => Promise<boolean>;
  showPushNotification: (title: string, message: string, options?: NotificationOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if browser supports notifications
    if ('Notification' in window) {
      setPermissionGranted(Notification.permission === 'granted');
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get('/notifications');
      const mappedNotifications: Notification[] = response.data.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type.toLowerCase() as any, // Map INFO -> info
        timestamp: new Date(n.createdAt),
        read: n.isRead,
        persistent: true
      }));
      setNotifications(mappedNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    // In a real app with socket.io, we would listen for new notifications here
    // and append them to the list
  }, [fetchNotifications]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(), // This will be temporary until we refresh or if we implement optimistic updates properly with backend response
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    return newNotification;
  }, []);

  const showSuccess = useCallback((title: string, message: string, persistent = false) => {
    const notification = addNotification({ title, message, type: 'success', persistent });

    toast({
      title: (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          {title}
        </div>
      ),
      description: message,
      className: "border-green-200 bg-green-50 text-green-900",
    });

    return notification;
  }, [addNotification]);

  const showError = useCallback((title: string, message: string, persistent = true) => {
    const notification = addNotification({ title, message, type: 'error', persistent });

    toast({
      title: (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          {title}
        </div>
      ),
      description: message,
      className: "border-red-200 bg-red-50 text-red-900",
      variant: "destructive",
    });

    return notification;
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string, persistent = false) => {
    const notification = addNotification({ title, message, type: 'warning', persistent });

    toast({
      title: (
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          {title}
        </div>
      ),
      description: message,
      className: "border-yellow-200 bg-yellow-50 text-yellow-900",
    });

    return notification;
  }, [addNotification]);

  const showInfo = useCallback((title: string, message: string, persistent = false) => {
    const notification = addNotification({ title, message, type: 'info', persistent });

    toast({
      title: (
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-500" />
          {title}
        </div>
      ),
      description: message,
      className: "border-blue-200 bg-blue-50 text-blue-900",
      variant: "destructive",
    });

    return notification;
  }, [addNotification]);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );

    try {
      await api.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );

    try {
      await api.put('/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  const removeNotification = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.filter(notification => notification.id !== id));

    try {
      await api.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, []);

  const clearAll = useCallback(async () => {
    // Optimistic update
    setNotifications([]);

    try {
      await api.delete('/notifications');
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermissionGranted(true);
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setPermissionGranted(granted);
      return granted;
    }

    return false;
  }, []);

  const showPushNotification = useCallback((title: string, message: string, options: NotificationOptions = {}) => {
    if (!permissionGranted || !('Notification' in window)) {
      return;
    }

    const notification = new Notification(title, {
      body: message,
      icon: '/favicon.png',
      badge: '/favicon.png',
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  }, [permissionGranted]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    requestPermission,
    showPushNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}