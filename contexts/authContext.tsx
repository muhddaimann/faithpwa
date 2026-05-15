import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { useToken } from './tokenContext';
import { useOverlay } from './overlayContext';

type AuthContextType = {
  user: string | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: (force?: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { getToken, saveToken, deleteToken } = useToken();
  const { alert, confirm, toast, showLoader, hideLoader } = useOverlay();

  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedUser = await getToken();
        if (savedUser) {
          setUser(savedUser);
        }
      } catch (e) {
        console.error('Failed to load session', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const signIn = async (username: string, password: string) => {
    showLoader("Signing you in...");
    await new Promise(resolve => setTimeout(resolve, 800));

    if (username === 'user' && password === '123') {
      try {
        await saveToken(username);
        setUser(username);
        hideLoader();
        toast({ message: `Success! Welcome back, ${username}.`, variant: 'success' });
        router.replace('/(tabs)/home');
        return true;
      } catch (e) {
        hideLoader();
        alert({ 
          title: 'System Error', 
          message: 'Secure storage failed. Please check your device settings.' 
        });
        return false;
      }
    } else {
      hideLoader();
      alert({ 
        title: 'Login Failed', 
        message: 'Invalid username or password. Please try again.' 
      });
      return false;
    }
  };

  const performSignOut = useCallback(async () => {
    showLoader("Logging you out...");
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      await deleteToken();
      setUser(null);
      hideLoader();
      router.replace('/');
    } catch (e) {
      hideLoader();
      console.error('Failed to delete session', e);
      alert({ 
        title: 'Error', 
        message: 'Could not complete sign out. Please try again.' 
      });
    }
  }, [deleteToken, alert, showLoader, hideLoader]);

  const signOut = useCallback((force = false) => {
    if (force) {
      performSignOut();
      return;
    }

    confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to log out of your account?',
      confirmText: 'Log Out',
      cancelText: 'Cancel',
      isDestructive: true,
      onConfirm: performSignOut,
    });
  }, [confirm, performSignOut]);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
