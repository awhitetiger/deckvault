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

export const binderService = {
  getBinders: async () => {
    const res = await api.get('/api/v1/binders');
    return res.data.binders;
  },

  createBinder: async (name: string, description?: string, cover_color?: string) => {
    const res = await api.post('/api/v1/binders', { name, description, cover_color });
    return res.data.binder;
  },

  deleteBinder: async (id: string) => {
    await api.delete(`/api/v1/binders/${id}`);
  },

  getBinderCards: async (binderId: string) => {
    const res = await api.get(`/api/v1/binders/${binderId}/cards`);
    return res.data.cards;
  },

  addCardToBinder: async (
    binderId: string,
    cardId: string,
    condition: string,
    quantity: number,
    acquisitionPrice?: number,
    rarity?: string,
    setCode?: string,
    edition?: string,
  ) => {
    const res = await api.post(`/api/v1/binders/${binderId}/cards`, {
      card_id: cardId,
      condition,
      quantity,
      acquisition_price: acquisitionPrice,
      rarity,
      set_code: setCode,
      edition: edition || 'unlimited',
    });
    return res.data.binder_card;
  },

  updateBinder: async (id: string, data: { name?: string; cover_color?: string; sleeve_style?: string }) => {
  const res = await api.patch(`/api/v1/binders/${id}`, data);
  return res.data.binder;
  },

  removeCard: async (binderId: string, binderCardId: string) => {
    await api.delete(`/api/v1/binders/${binderId}/cards/${binderCardId}`);
  },

  reorderCards: async (binderId: string, cards: { id: string; page: number; slot: number }[]) => {
    await api.patch(`/api/v1/binders/${binderId}/reorder`, { cards });
  },
};

export const cardService = {
  search: async (query: string, page = 1) => {
    const res = await api.get(`/api/v1/cards/search?q=${query}&page=${page}&limit=20`);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/api/v1/cards/${id}`);
    return res.data;
  },
};