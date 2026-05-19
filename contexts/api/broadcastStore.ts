import { create } from "zustand";
import { getActiveBroadcasts, acknowledgeBroadcast } from "./broadcast";

export interface Broadcast {
  ID: number;
  BroadcastType: string;
  BroadcastPriority: string;
  NewsName: string;
  Description: string;
  StartDate: string;
  EndDate: string;
  Content: string;
  CreatedBy: string;
  CreatedDateTime: string;
  Acknowledged: number;
}

interface BroadcastStore {
  broadcasts: Broadcast[];
  selectedBroadcast: Broadcast | null;
  loading: boolean;
  isInitialized: boolean;

  fetchBroadcasts: (force?: boolean) => Promise<void>;
  setBroadcasts: (data: Broadcast[]) => void;
  setBroadcast: (broadcast: Broadcast) => void;
  clearBroadcast: () => void;

  acknowledge: (id: number) => Promise<{ success: boolean; message?: string }>;
  markAcknowledged: (id: number) => void;
  clear: () => void;
}

export const useBroadcastStore = create<BroadcastStore>((set, get) => ({
  broadcasts: [],
  selectedBroadcast: null,
  loading: false,
  isInitialized: false,

  fetchBroadcasts: async (force = false) => {
    set({ loading: true });
    try {
      const res = await getActiveBroadcasts();
      if (res?.status === "success" && res.data) {
        set({ broadcasts: res.data, isInitialized: true });
      }
    } finally {
      set({ loading: false });
    }
  },

  acknowledge: async (id: number) => {
    try {
      const res = await acknowledgeBroadcast(id);
      if (res?.status === "success") {
        get().markAcknowledged(id);
        return { success: true };
      }
      return { success: false, message: res?.message || "Failed to acknowledge" };
    } catch (e) {
      return { success: false, message: "Error acknowledging broadcast" };
    }
  },

  setBroadcasts: (data) => set({ broadcasts: data }),

  setBroadcast: (broadcast) => set({ selectedBroadcast: broadcast }),

  clearBroadcast: () => set({ selectedBroadcast: null }),

  markAcknowledged: (id) =>
    set((state) => ({
      broadcasts: state.broadcasts.map((b) =>
        b.ID === id ? { ...b, Acknowledged: 1 } : b,
      ),
      selectedBroadcast:
        state.selectedBroadcast?.ID === id
          ? { ...state.selectedBroadcast, Acknowledged: 1 }
          : state.selectedBroadcast,
    })),

  clear: () => set({ broadcasts: [], selectedBroadcast: null, isInitialized: false, loading: false }),
}));
