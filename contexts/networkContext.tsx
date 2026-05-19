import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useNetworkStore } from "./api/networkStore";
import { useOverlay } from "./overlayContext";

type NetworkContextType = {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
};

export const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
  const { toast } = useOverlay();
  const setStoreConnected = useNetworkStore((state) => state.setIsConnected);
  const wasOffline = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isActuallyConnected = state.isConnected && state.isInternetReachable !== false;
      
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
      setStoreConnected(state.isConnected);

      if (state.isConnected === false) {
        wasOffline.current = true;
        toast({
          message: "You are offline. Some features may not work.",
          variant: "error",
          duration: 5000,
        });
      } else if (state.isConnected === true && wasOffline.current) {
        wasOffline.current = false;
        toast({
          message: "You are back online!",
          variant: "success",
          duration: 3000,
        });
      }
    });

    return () => unsubscribe();
  }, [setStoreConnected, toast]);

  return (
    <NetworkContext.Provider value={{ isConnected, isInternetReachable }}>
      {children}
    </NetworkContext.Provider>
  );
};
