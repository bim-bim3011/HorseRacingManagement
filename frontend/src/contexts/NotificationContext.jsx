import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../api/notificationApi';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { accessToken, isAuthenticated } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestToast, setLatestToast] = useState(null);
  
  const stompClient = useRef(null);

  // Load initial notifications when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setLatestToast(null);
    }
  }, [isAuthenticated]);

  // STOMP WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const connectStomp = () => {
      const client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        connectHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
        debug: (str) => {
          // console.log(str); // Uncomment for debugging WebSocket
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = () => {
        // Subscribe to user specific notifications queue
        client.subscribe('/user/queue/notifications', (message) => {
          if (message.body) {
            const newNotification = JSON.parse(message.body);
            handleNewNotification(newNotification);
          }
        });
      };

      client.onStompError = (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      };

      client.activate();
      stompClient.current = client;
    };

    connectStomp();

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [isAuthenticated, accessToken]);

  const loadInitialData = async () => {
    try {
      // First page of notifications
      const notifsPage = await getMyNotifications(0, 10);
      setNotifications(notifsPage.content || []);
      
      const unread = await getUnreadCount();
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleNewNotification = useCallback((newNotif) => {
    setNotifications(prev => [newNotif, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Trigger toast
    setLatestToast(newNotif);
    
    // Auto clear toast after 5 seconds
    setTimeout(() => {
      setLatestToast(prev => (prev?.id === newNotif.id ? null : prev));
    }, 5000);
  }, []);

  const clearToast = useCallback(() => {
    setLatestToast(null);
  }, []);

  const showToast = useCallback((title, content) => {
    const newNotif = { id: Date.now().toString(), title, content };
    setLatestToast(newNotif);
    setTimeout(() => {
      setLatestToast(prev => (prev?.id === newNotif.id ? null : prev));
    }, 5000);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    latestToast,
    clearToast,
    showToast,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    reloadNotifications: loadInitialData
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
