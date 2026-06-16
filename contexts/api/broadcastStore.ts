import { create } from 'zustand';
import { getActiveBroadcasts, acknowledgeBroadcast, type Broadcast } from './broadcast';

interface BroadcastStore {
  broadcasts: Broadcast[];
  loading: boolean;
  error: string | null;
  selectedBroadcast: Broadcast | null;
  fetchBroadcasts: () => Promise<void>;
  setBroadcast: (broadcast: Broadcast) => void;
  clearSelected: () => void;
  clearAll: () => void;
  acknowledge: (id: number) => Promise<boolean>;
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

  acknowledge: async (id) => {
    const response = await acknowledgeBroadcast(id);
    const ok = !!response && response.status === 'success';
    if (ok) {
      set((state) => ({
        broadcasts: state.broadcasts.map((b) =>
          b.ID === id ? { ...b, Acknowledged: 1 } : b,
        ),
      }));
    }
    return ok;
  },
}));
