import { create } from "zustand";
import { getLeaveBalance } from "./balance";

type BalanceStore = {
  annualLeaveLeft: number;
  balanceLoading: boolean;
  isInitialized: boolean;
  fetchBalance: (force?: boolean) => Promise<void>;
  clear: () => void;
};

export const useBalanceStore = create<BalanceStore>((set, get) => ({
  annualLeaveLeft: 0,
  balanceLoading: false,
  isInitialized: false,
  fetchBalance: async (force = false) => {
    if (get().balanceLoading) return;
    if (get().isInitialized && !force) return;
    
    set({ balanceLoading: true });
    try {
      const month = new Date().toISOString().slice(0, 7);
      const res = await getLeaveBalance(month);
      if (!("error" in res)) {
        set({ annualLeaveLeft: res.balance, isInitialized: true });
      }
    } finally {
      set({ balanceLoading: false });
    }
  },

  clear: () =>
    set({ annualLeaveLeft: 0, balanceLoading: false, isInitialized: false }),
}));
