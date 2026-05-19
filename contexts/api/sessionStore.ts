import { create } from "zustand";

interface SessionState {
  isExpired: boolean;
  setExpired: (expired: boolean) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  isExpired: false,
  setExpired: (expired: boolean) => set({ isExpired: expired }),
}));
