import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getToken } from './tokenContext';
import { useOverlay } from './overlayContext';
import { login, logout as apiLogout } from './api/auth';
import { useStaffStore } from './api/staffStore';

type AuthContextType = {
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: (force?: boolean) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { fetchStaff, clear: clearStaff, staff } = useStaffStore();
  const { confirm, toast, showLoader, hideLoader } = useOverlay();

  useEffect(() => {
    const loadSession = async () => {
      showLoader("Initializing session...");
      try {
        const token = await getToken();
        if (token) {
          await fetchStaff();
          // We can check if fetchStaff succeeded by looking at the store state
          // but for now, we'll assume if there's a token we try to load.
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
  }, [fetchStaff]);

  const signIn = async (username: string, password: string) => {
    showLoader("Authenticating...");
    
    try {
      const result = await login({ username, password });
      
      if (result.status === "success") {
        await fetchStaff();
        hideLoader();
        toast({
          message: "Welcome back!",
          variant: "success",
        });
        return true;
      } else {
        hideLoader();
        toast({
          message: result.message || "Invalid username or password.",
          variant: "error",
        });
        return false;
      }
    } catch (e: any) {
      hideLoader();
      toast({
        message: "An error occurred during sign in.",
        variant: "error",
      });
      return false;
    }
  };

  const performSignOut = useCallback(async () => {
    showLoader("Logging you out...");
    try {
      await apiLogout();
      clearStaff();
      hideLoader();
      toast({ 
        message: 'Successfully logged out.', 
        variant: 'success' 
      });
    } catch (e) {
      hideLoader();
      console.error('Failed to logout', e);
      toast({ 
        message: 'Could not complete sign out.', 
        variant: 'error' 
      });
    }
  }, [clearStaff, toast, showLoader, hideLoader]);

  const signOut = useCallback((force = false) => {
    if (force) {
      performSignOut();
      return;
    }

    confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to log out?',
      confirmText: 'Log Out',
      cancelText: 'Cancel',
      isDestructive: true,
      onConfirm: performSignOut,
    });
  }, [confirm, performSignOut]);

  return (
    <AuthContext.Provider value={{ isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
