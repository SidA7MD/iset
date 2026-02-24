// =====================================================

// frontend/src/api/deviceApi.js
import axios from './axios.config';

export const deviceApi = {
  // Admin operations
  getAllDevices: async () => {
    const response = await axios.get('/devices');
    return response.data;
  },

  createDevice: async ({ MAC, deviceName, location }) => {
    const response = await axios.post('/devices', { MAC, deviceName, location });
    return response.data;
  },

  updateDevice: async (MAC, updates) => {
    const response = await axios.put(`/devices/${MAC}`, updates);
    return response.data;
  },

  deleteDevice: async (MAC) => {
    const response = await axios.delete(`/devices/${MAC}`);
    return response.data;
  },

  assignDevice: async (MAC, userId) => {
    const response = await axios.post(`/devices/${MAC}/assign`, { userId });
    return response.data;
  },

  unassignDevice: async (MAC) => {
    const response = await axios.post(`/devices/${MAC}/unassign`);
    return response.data;
  },

  // User operations
  getMyDevices: async () => {
    const response = await axios.get('/devices/my-devices');
    return response.data;
  },

  getDeviceByMAC: async (MAC) => {
    const response = await axios.get(`/devices/${MAC}`);
    return response.data;
  },

  getDeviceStatus: async (MAC) => {
    const response = await axios.get(`/devices/${MAC}/status`);
    return response.data;
  },
};
