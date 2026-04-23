import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { useAuth } from './AuthContext';

const AlertContext = createContext();

export const AlertProvider = ({ children, onAlert }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [alertStats, setAlertStats] = useState({
    total: 0, overdue: 0, upcoming: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchAlerts = useCallback(async (showToast) => {
    if (!user || user.role !== 'agent') return;
    try {
      setLoading(true);
      const res = await API.get('/alerts/my-alerts');
      setAlerts(res.data.alerts);
      setAlertStats({
        total: res.data.total,
        overdue: res.data.overdue,
        upcoming: res.data.upcoming,
      });

      if (showToast && res.data.total > 0) {
        if (res.data.overdue > 0) {
          onAlert?.({
            message: `${res.data.overdue} overdue follow-up — call now`,
            type: 'error',
            duration: 7000,
          });
        } else {
          onAlert?.({
            message: `${res.data.upcoming} follow-up pending for today`,
            type: 'followup',
            duration: 6000,
          });
        }
      }
    } catch (err) {
      console.error('Alert fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, onAlert]);

  useEffect(() => {
    fetchAlerts(true);
  }, [fetchAlerts]);

  // Refresh every 5 minutes
  useEffect(() => {
    if (!user || user.role !== 'agent') return;
    const interval = setInterval(() => fetchAlerts(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAlerts, user]);

  const dismissAlert = async (leadId) => {
    try {
      await API.put(`/alerts/dismiss/${leadId}`);
      setAlerts((prev) => prev.filter((a) => a.leadId !== leadId));
      setAlertStats((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      console.error('Dismiss error:', err);
    }
  };

  return (
    <AlertContext.Provider value={{
      alerts, alertStats, loading, fetchAlerts, dismissAlert,
    }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => useContext(AlertContext);