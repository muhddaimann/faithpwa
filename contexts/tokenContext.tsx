import React, { createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TokenContextType = {
  getToken: () => Promise<string | null>;
  saveToken: (token: string) => Promise<void>;
  deleteToken: () => Promise<void>;
};

const TokenContext = createContext<TokenContextType | undefined>(undefined);

const TOKEN_KEY = 'user_token';

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) throw new Error('useToken must be used within a TokenProvider');
  return context;
};

// Standalone functions for use outside of components
export const getStoredToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to get token', e);
    return null;
  }
};

export const storeToken = async (token: string, expiration?: number) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    if (expiration) {
      await AsyncStorage.setItem(`${TOKEN_KEY}_expiration`, expiration.toString());
    }
  } catch (e) {
    console.error('Failed to save token', e);
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to delete token', e);
  }
};

export const TokenProvider = ({ children }: { children: React.ReactNode }) => {
  const getToken = getStoredToken;
  const saveToken = storeToken;
  const deleteToken = removeToken;

  return (
    <TokenContext.Provider value={{ getToken, saveToken, deleteToken }}>
      {children}
    </TokenContext.Provider>
  );
};
