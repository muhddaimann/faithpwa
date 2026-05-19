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
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    const isConnected = useNetworkStore.getState().isConnected;
    if (isConnected === false) {
      console.warn('[API Request] Blocked: No internet connection');
      return Promise.reject(new Error('No internet connection'));
    }

    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', {
      url: error.config?.url,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    if (error.response?.status === 401) {
      useSessionStore.getState().setExpired(true);
    }
    return Promise.reject(error);
  },
);

export default api;
