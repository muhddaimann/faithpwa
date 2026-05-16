import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { useToken } from './tokenContext';
import { useOverlay } from './overlayContext';

type User = {
  username: string;
  name: string;
  staffId: string;
  designation: string;
  avatarText: string;
};

type AuthContextType = {
  user: User | null;
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

const DUMMY_USER: User = {
  username: 'user',
  name: 'Aiman Hakim',
  staffId: 'CS1024',
  designation: 'Customer Service Executive',
  avatarText: 'AH',
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { getToken, saveToken, deleteToken } = useToken();
  const { alert, confirm, toast, showLoader, hideLoader } = useOverlay();

  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedUsername = await getToken();
        if (savedUsername === DUMMY_USER.username) {
          setUser(DUMMY_USER);
        }
      } catch (e) {
        console.error('Failed to load session', e);
      } finally {
        // Add a small delay for smoother transition
        setTimeout(() => setIsLoading(false), 500);
      }
    };
    loadSession();
  }, []);

  const signIn = async (username: string, password: string) => {
    showLoader("Signing you in...");
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (username === DUMMY_USER.username && password === '123') {
      try {
        await saveToken(username);
        setUser(DUMMY_USER);
        hideLoader();
        toast({ message: `Success! Welcome back, ${DUMMY_USER.name}.`, variant: 'success' });
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
