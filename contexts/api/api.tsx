import axios from 'axios';
import { getToken } from '../tokenContext';
import { useSessionStore } from './sessionStore';
import { useNetworkStore } from './networkStore';

const api = axios.create({
  baseURL: 'https://endpoint.daythree.ai/faithMobile/routes',
  timeout: 5000,
});

api.interceptors.request.use(
  async (config) => {
    const isConnected = useNetworkStore.getState().isConnected;
    if (isConnected === false) {
      return Promise.reject(new Error('No internet connection'));
    }

    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useSessionStore.getState().setExpired(true);
    }
    return Promise.reject(error);
  },
);

export default api;
