import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.1.220:3000';

export const api = axios.create({
  baseURL: API_URL,
});

// Attach access token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: async (email: string, username: string, password: string) => {
    const res = await api.post('/api/v1/auth/register', { email, username, password });
    return res.data;
  },

  login: async (email: string, password: string) => {
    const res = await api.post('/api/v1/auth/login', { email, password });
    return res.data;
  },

  logout: async (refreshToken: string) => {
    await api.post('/api/v1/auth/logout', { refreshToken });
  },
};