// frontend/src/hooks/useAlerts.js
import { useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { alertApi } from '../api/alertApi';
import { DeviceDataContext } from '../contexts/DeviceDataContext';

export const useAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);

  // Make DeviceDataContext optional
  const deviceDataContext = useContext(DeviceDataContext);
  const realtimeAlerts = deviceDataContext?.alerts || [];

  const fetchAlerts = useCallback(async (acknowledged = null) => {
    try {
      setLoading(true);
      const response = await alertApi.getAlerts(acknowledged);
      setAlerts(response.data.alerts);

      const unacked = response.data.alerts.filter((a) => !a.acknowledged).length;
      setUnacknowledgedCount(unacked);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  const acknowledgeAlert = useCallback(async (alertId) => {
    try {
      await alertApi.acknowledgeAlert(alertId);

      setAlerts((prev) =>
        prev.map((alert) =>
          alert._id === alertId
            ? { ...alert, acknowledged: true, acknowledgedAt: new Date() }
            : alert
        )
      );

      setUnacknowledgedCount((prev) => Math.max(0, prev - 1));
      toast.success('Alert acknowledged');
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  }, []);

  const getDeviceAlerts = useCallback(async (MAC) => {
    try {
      const response = await alertApi.getDeviceAlerts(MAC);
      return response.data.alerts;
    } catch (error) {
      console.error('Error fetching device alerts:', error);
      return [];
    }
  }, []);

  // Merge realtime alerts with fetched alerts
  useEffect(() => {
    if (realtimeAlerts.length > 0) {
      setAlerts((prev) => {
        const existingIds = new Set(prev.map((a) => a._id));
        const newAlerts = realtimeAlerts.filter((a) => !existingIds.has(a._id));
        return [...newAlerts, ...prev];
      });

      const newUnacked = realtimeAlerts.filter((a) => !a.acknowledged).length;
      setUnacknowledgedCount((prev) => prev + newUnacked);
    }
  }, [realtimeAlerts]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    unacknowledgedCount,
    fetchAlerts,
    acknowledgeAlert,
    getDeviceAlerts,
  };
};
