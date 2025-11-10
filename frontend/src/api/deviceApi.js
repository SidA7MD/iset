// =====================================================

// frontend/src/api/deviceApi.js
import axios from './axios.config';

export const deviceApi = {
  getAllDevices: async () => {
    const response = await axios.get('/devices');
    return response.data;
  },

  getMyDevices: async () => {
    const response = await axios.get('/devices/my-devices');
    return response.data;
  },

  getDeviceByMAC: async (MAC) => {
    const response = await axios.get(`/devices/${MAC}`);
    return response.data;
  },

  updateDevice: async (MAC, updates) => {
    const response = await axios.put(`/devices/${MAC}`, updates);
    return response.data;
  },

  getDeviceStatus: async (MAC) => {
    const response = await axios.get(`/devices/${MAC}/status`);
    return response.data;
  },
};
