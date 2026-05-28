import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToken } from './tokenContext';
import { useOverlay } from './overlayContext';
import { login as apiLogin } from './api/auth';
import { useStaffStore } from './api/staffStore';
import { useBroadcastStore } from './api/broadcastStore';
import { StaffResponse } from './api/staff';

type AuthContextType = {
  user: Partial<StaffResponse> | null;
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Partial<StaffResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken, saveToken, deleteToken } = useToken();
  const { confirm, toast, showLoader, hideLoader } = useOverlay();
  const clearStaff = useStaffStore((state) => state.clear);
  const clearBroadcasts = useBroadcastStore((state) => state.clearAll);

  useEffect(() => {
    const loadSession = async () => {
      showLoader("Initializing session...");
      try {
        const token = await getToken();
        if (token) {
          // If we have a token, we consider the user authenticated.
          // Minimal user info to satisfy the UI until useStaff fetches full details.
          setUser({
            staff_no: '',
            first_name: 'User',
            designation_name: '',
            initials: 'U',
          });
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
        clearStaff(); // Clear staff data before new user logs in
        clearBroadcasts(); // Clear old broadcasts
        
        setUser({
          staff_id: response.staff_id,
          first_name: 'Staff',
          staff_no: '',
          designation_name: '',
          initials: 'S',
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
      clearStaff(); // Clear staff data on logout
      clearBroadcasts(); // Clear broadcasts on logout
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
  }, [deleteToken, toast, showLoader, hideLoader, clearStaff, clearBroadcasts]);

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
