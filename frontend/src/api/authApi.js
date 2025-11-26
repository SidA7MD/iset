// frontend/src/api/authApi.js
import axios from './axios.config';

export const authApi = {
  login: async (credentials) => {
    try {
      console.log('🌐 Calling login API with:', credentials);

      // Handle both object and separate parameters
      const payload = credentials.identifier
        ? { username: credentials.identifier, password: credentials.password }
        : credentials;

      console.log('📤 Sending payload:', payload);

      const response = await axios.post('/auth/login', payload);

      console.log('📥 Login API response:', response.data);

      return response.data;
    } catch (error) {
      console.error('❌ Login API error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: async () => {
    const response = await axios.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await axios.get('/auth/me');
    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post('/auth/register', userData);
    return response.data;
  },
};
