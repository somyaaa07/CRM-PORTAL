import {
  createContext, useContext,
  useState, useEffect, useCallback,
} from 'react';
import API from '../api/axios';
import { useAuth } from './AuthContext';

const AdminAlertContext = createContext();

export const AdminAlertProvider = ({ children }) => {
  const { user } = useAuth();

  const [metaAlerts, setMetaAlerts]   = useState(null);
  const [loading, setLoading]         = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchMetaAlerts = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    try {
      setLoading(true);
      const res = await API.get('/alerts/meta-leads-alert');
      setMetaAlerts(res.data);
      setLastChecked(new Date());
    } catch (err) {
      console.error('Meta alert error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMetaAlerts();
  }, [fetchMetaAlerts]);

  // Har 2 min mein refresh
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const interval = setInterval(fetchMetaAlerts, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchMetaAlerts, user]);

  return (
    <AdminAlertContext.Provider value={{
      metaAlerts,
      loading,
      lastChecked,
      fetchMetaAlerts,
    }}>
      {children}
    </AdminAlertContext.Provider>
  );
};

export const useAdminAlerts = () => useContext(AdminAlertContext);