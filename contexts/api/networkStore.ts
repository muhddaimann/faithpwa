import { create } from "zustand";

interface NetworkState {
  isConnected: boolean | null;
  setIsConnected: (isConnected: boolean | null) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isConnected: true, // Assume connected initially to avoid premature blocking
  setIsConnected: (isConnected: boolean | null) => set({ isConnected }),
}));
