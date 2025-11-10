// =====================================================

// frontend/src/api/sensorDataApi.js
import axios from './axios.config';

export const sensorDataApi = {
  getLatest: async (MAC) => {
    const response = await axios.get(`/sensor-data/${MAC}/latest`);
    return response.data;
  },

  getHistory: async (MAC, start, end, limit = 100) => {
    const response = await axios.get(`/sensor-data/${MAC}/history`, {
      params: { start, end, limit },
    });
    return response.data;
  },

  getStatistics: async (MAC, start, end) => {
    const response = await axios.get(`/sensor-data/${MAC}/stats`, {
      params: { start, end },
    });
    return response.data;
  },
};
