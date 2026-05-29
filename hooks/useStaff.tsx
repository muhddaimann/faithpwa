import { useEffect, useCallback } from 'react';
import { useStaffStore } from '../contexts/api/staffStore';
import { useOverlay } from '../contexts/overlayContext';
import { useRouter } from 'expo-router';
import { StaffResponse } from '../contexts/api/staff';

export const useStaff = () => {
  const { 
    staff, 
    loading, 
    error, 
    fetchStaff, 
    updateStaff: apiUpdateStaff, 
    clear 
  } = useStaffStore();

  const { showLoader, hideLoader, toast } = useOverlay();
  const router = useRouter();

  // Automatically fetch staff if not already loaded
  useEffect(() => {
    if (!staff && !loading && !error) {
      fetchStaff();
    }
  }, [staff, loading, error, fetchStaff]);

  const updateProfile = useCallback(async (data: Partial<StaffResponse>) => {
    showLoader("Updating profile...");
    try {
      const res = await apiUpdateStaff(data);
      hideLoader();

      if (res.success) {
        router.back();
        // Beat for transition to finish
        setTimeout(() => {
          toast({
            message: "Profile updated successfully!",
            variant: "success",
          });
        }, 100);
      } else {
        toast({
          message: res.error || "Failed to update profile.",
          variant: "error",
        });
      }
      return res;
    } catch (e) {
      hideLoader();
      toast({
        message: "An unexpected error occurred.",
        variant: "error",
      });
      return { success: false, error: "Unexpected error" };
    }
  }, [apiUpdateStaff, showLoader, hideLoader, toast, router]);

  return {
    staff,
    loading,
    error,
    refreshStaff: fetchStaff,
    updateStaff: updateProfile,
    clearStaff: clear,
    // Helper to get a display name
    displayName: staff?.nick_name || staff?.by_name || staff?.first_name || 'Staff Member',
    // Welcome message helper
    welcomeMessage: `Welcome back, ${staff?.nick_name || staff?.by_name || staff?.first_name || 'Staff'}`,
    // Helper for avatar initials
    initials: staff?.initials || staff?.first_name?.substring(0, 1).toUpperCase() || 'S',
  };
};
