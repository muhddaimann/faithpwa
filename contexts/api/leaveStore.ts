import { create } from "zustand";
import { getLeave, addLeave, withdrawLeave } from "./leave";
import { transformLeave, type LeaveItem } from "../../constants/leave";

export type StoreActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

type LeaveStore = {
  leaves: LeaveItem[];
  loading: boolean;
  submitting: boolean;
  submissionError: string | null;
  fetchLeaves: () => Promise<void>;
  addNewLeave: (formData: FormData) => Promise<StoreActionResponse>;
  withdraw: (id: number) => Promise<StoreActionResponse>;
  clear: () => void;
};

export const useLeaveStore = create<LeaveStore>((set, get) => ({
  leaves: [],
  loading: false,
  submitting: false,
  submissionError: null,

  fetchLeaves: async () => {
    set({ loading: true });
    try {
      const data = await getLeave();
      const formatted = data.map(transformLeave);
      set({ leaves: formatted });
    } catch (e) {
      console.error("Error fetching leaves:", e);
    } finally {
      set({ loading: false });
    }
  },

  addNewLeave: async (formData) => {
    set({ submitting: true, submissionError: null });
    try {
      const res = await addLeave(formData);
      if (res.leave_id) {
        await get().fetchLeaves();
        return { success: true, message: res.message };
      }
      set({
        submissionError: res.message || "Failed to add leave application.",
      });
      return {
        success: false,
        error: res.message || "Failed to add leave application.",
      };
    } catch (e: any) {
      const errorMessage =
        e?.message || "An unexpected error occurred during submission.";
      set({ submissionError: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      set({ submitting: false });
    }
  },

  withdraw: async (id: number): Promise<StoreActionResponse> => {
    set({ submitting: true, submissionError: null });
    try {
      const res = await withdrawLeave(id);
      if (res.error) {
        set({ submissionError: res.error });
        return { success: false, error: res.error };
      }
      await get().fetchLeaves();
      return { success: true, message: res.message };
    } catch (e: any) {
      const errorMessage =
        e?.message || "An unexpected error occurred during withdrawal.";
      set({ submissionError: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      set({ submitting: false });
    }
  },

  clear: () =>
    set({
      leaves: [],
      loading: false,
      submitting: false,
      submissionError: null,
    }),
}));
