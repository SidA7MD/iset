// =====================================================

// frontend/src/api/alertApi.js
import axios from './axios.config';

export const alertApi = {
  getAlerts: async (acknowledged = null) => {
    const response = await axios.get('/alerts', {
      params: acknowledged !== null ? { acknowledged } : {},
    });
    return response.data;
  },

  acknowledgeAlert: async (alertId) => {
    const response = await axios.put(`/alerts/${alertId}/acknowledge`);
    return response.data;
  },

  getDeviceAlerts: async (MAC) => {
    const response = await axios.get(`/alerts/device/${MAC}`);
    return response.data;
  },
};
