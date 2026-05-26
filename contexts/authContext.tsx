import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToken } from './tokenContext';
import { useOverlay } from './overlayContext';
import { login as apiLogin } from './api/auth';

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
  if (!context) throw new Error('useAuth must be used within AuthProvider');
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
  const { confirm, toast, showLoader, hideLoader } = useOverlay();

  useEffect(() => {
    const loadSession = async () => {
      showLoader("Initializing session...");
      try {
        const token = await getToken();
        if (token) {
          // In a real app, we would verify the token or fetch the profile here
          // For now, if we have a token, we'll assume the user is logged in
          setUser(DUMMY_USER); 
        }
      } catch (e) {
        console.error("Failed to load session", e);
      } finally {
        setTimeout(() => {
          hideLoader();
          setIsLoading(false);
        }, 800);
      }
    };
    loadSession();
  }, []);

  const signIn = async (username: string, password: string) => {
    showLoader("Authenticating...");
    
    try {
      const response = await apiLogin({ username, password });

      if (response.status === 'success') {
        setUser({
          username,
          name: 'Staff Member', // The login API doesn't return the name yet
          staffId: response.staff_id?.toString() || 'N/A',
          designation: 'Staff',
          avatarText: username.substring(0, 2).toUpperCase(),
        });
        
        hideLoader();
        toast({
          message: `Welcome back!`,
          variant: "success",
        });
        return true;
      } else {
        hideLoader();
        toast({
          message: response.message || "Invalid username or password.",
          variant: "error",
        });
        return false;
      }
    } catch (error) {
      hideLoader();
      toast({
        message: "Network error. Please check your connection.",
        variant: "error",
      });
      return false;
    }
  };

  const performSignOut = useCallback(async () => {
    showLoader("Logging you out...");
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await deleteToken();
      setUser(null);
      hideLoader();
      toast({ 
        message: 'Successfully logged out. See you soon!', 
        variant: 'success' 
      });
    } catch (e) {
      hideLoader();
      console.error('Failed to delete session', e);
      toast({ 
        message: 'Could not complete sign out. Please try again.', 
        variant: 'error' 
      });
    }
  }, [deleteToken, toast, showLoader, hideLoader]);

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
