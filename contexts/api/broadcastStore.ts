import { create } from 'zustand';
import { getActiveBroadcasts, type Broadcast } from './broadcast';

interface BroadcastStore {
  broadcasts: Broadcast[];
  loading: boolean;
  error: string | null;
  selectedBroadcast: Broadcast | null;
  fetchBroadcasts: () => Promise<void>;
  setBroadcast: (broadcast: Broadcast) => void;
  clearSelected: () => void;
  clearAll: () => void;
}

export const useBroadcastStore = create<BroadcastStore>((set) => ({
  broadcasts: [],
  loading: false,
  error: null,
  selectedBroadcast: null,

  fetchBroadcasts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getActiveBroadcasts();
      if (response && response.status === 'success' && response.data) {
        set({ broadcasts: response.data, error: null });
      } else {
        set({ error: response?.message || 'Failed to fetch broadcasts.' });
      }
    } catch (e: any) {
      set({ error: e?.message || 'An unexpected error occurred.' });
    } finally {
      set({ loading: false });
    }
  },

  setBroadcast: (broadcast) => set({ selectedBroadcast: broadcast }),
  clearSelected: () => set({ selectedBroadcast: null }),
  clearAll: () => set({ broadcasts: [], selectedBroadcast: null, error: null, loading: false }),
}));
