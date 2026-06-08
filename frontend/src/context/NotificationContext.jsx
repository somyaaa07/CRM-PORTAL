import {
  createContext, useContext,
  useState, useEffect, useCallback,
} from 'react';
import API from '../api/axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await API.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Notification fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // First load
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Har 1 min mein refresh
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchNotifications, 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications, user]);

  // Notification read karo
  const markAsRead = async (notificationId) => {
    try {
      await API.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
             prev.filter((n) => n.id !== notificationId)  // ← ye change karo

      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  // Saari read karo
  const markAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
         setNotifications([]); 
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);