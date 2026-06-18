import React, { createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TokenContextType = {
  getToken: () => Promise<string | null>;
  saveToken: (token: string) => Promise<void>;
  deleteToken: () => Promise<void>;
};

const TokenContext = createContext<TokenContextType | undefined>(undefined);

const TOKEN_KEY = 'user_token';
const EXPIRATION_KEY = `${TOKEN_KEY}_expiration`;
const SESSION_KEY = `${TOKEN_KEY}_session`;

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) throw new Error('useToken must be used within a TokenProvider');
  return context;
};

export const getStoredToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to get token', e);
    return null;
  }
};

// true only when an expiration was stored and that time has passed.
export const isTokenExpired = async (): Promise<boolean> => {
  try {
    const exp = await AsyncStorage.getItem(EXPIRATION_KEY);
    if (!exp) return false;
    const expSeconds = Number(exp);
    if (!Number.isFinite(expSeconds)) return false;
    return Math.floor(Date.now() / 1000) >= expSeconds;
  } catch (e) {
    console.error('Failed to read token expiration', e);
    return false;
  }
};

// Returns the token only if it exists and hasn't expired; clears it otherwise.
export const getValidToken = async (): Promise<string | null> => {
  const token = await getStoredToken();
  if (!token) return null;
  if (await isTokenExpired()) {
    await removeToken();
    return null;
  }
  return token;
};

export const storeToken = async (token: string, expiration?: number) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    if (expiration) {
      await AsyncStorage.setItem(EXPIRATION_KEY, expiration.toString());
    }
  } catch (e) {
    console.error('Failed to save token', e);
  }
};

// The server-side session id (jti) returned at login — identifies "this device".
export const storeSessionId = async (sessionId: string) => {
  try {
    await AsyncStorage.setItem(SESSION_KEY, sessionId);
  } catch (e) {
    console.error('Failed to save session id', e);
  }
};

export const getStoredSessionId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(SESSION_KEY);
  } catch (e) {
    console.error('Failed to get session id', e);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, EXPIRATION_KEY, SESSION_KEY]);
  } catch (e) {
    console.error('Failed to delete token', e);
  }
};

export const TokenProvider = ({ children }: { children: React.ReactNode }) => {
  const getToken = getValidToken;
  const saveToken = storeToken;
  const deleteToken = removeToken;

  return (
    <TokenContext.Provider value={{ getToken, saveToken, deleteToken }}>
      {children}
    </TokenContext.Provider>
  );
};
