import React, { createContext, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

type TokenContextType = {
  getToken: () => Promise<string | null>;
  saveToken: (token: string) => Promise<void>;
  deleteToken: () => Promise<void>;
};

const TokenContext = createContext<TokenContextType | undefined>(undefined);

const TOKEN_KEY = 'user_token';
const isWeb = Platform.OS === 'web';

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) throw new Error('useToken must be used within a TokenProvider');
  return context;
};

export const getToken = async () => {
  try {
    if (isWeb) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to get token', e);
    return null;
  }
};

export const saveToken = async (token: string) => {
  try {
    if (isWeb) {
      localStorage.setItem(TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to save token', e);
  }
};

export const deleteToken = async () => {
  try {
    if (isWeb) {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to delete token', e);
  }
};

export const TokenProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <TokenContext.Provider value={{ getToken, saveToken, deleteToken }}>
      {children}
    </TokenContext.Provider>
  );
};
