// =====================================================

// frontend/src/api/userApi.js
import axios from './axios.config';

export const userApi = {
  getAllUsers: async (page = 1, limit = 50) => {
    const response = await axios.get('/users', { params: { page, limit } });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await axios.get(`/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await axios.put(`/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await axios.delete(`/users/${userId}`);
    return response.data;
  },

  assignDevices: async (userId, devices) => {
    const response = await axios.post(`/users/${userId}/assign-devices`, { devices });
    return response.data;
  },

  removeDevice: async (userId, MAC) => {
    const response = await axios.delete(`/users/${userId}/devices/${MAC}`);
    return response.data;
  },

  getUserDevices: async (userId) => {
    const response = await axios.get(`/users/${userId}/devices`);
    return response.data;
  },
};
