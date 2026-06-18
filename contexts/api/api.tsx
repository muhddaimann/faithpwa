import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getValidToken } from '../tokenContext';
import { notifySessionExpired } from './session';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || '/api',
  timeout: 30000, // Increased to 30s
});

// Device context for the backend session/audit tables (auth_sessions).
// Static per app session, so set once rather than per request.
api.defaults.headers.common['X-Platform'] = Platform.OS;
api.defaults.headers.common['X-App-Version'] =
  Constants.expoConfig?.version ?? 'unknown';

api.interceptors.request.use(
  async (config) => {
    // getValidToken clears and skips an expired token so we never send one.
    const token = await getValidToken();
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
    // Session is dead server-side — kick the user out (de-duped in session).
    if (error?.response?.status === 401) {
      notifySessionExpired();
    }
    return Promise.reject(error);
  },
);

export default api;
