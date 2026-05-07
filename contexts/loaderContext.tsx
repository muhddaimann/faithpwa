import React, { createContext, useContext, useState, useCallback } from "react";
import { OverlayLoader } from "../components/loader";

type LoaderContextType = {
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  isLoading: boolean;
  isRefreshing: boolean;
  performRefresh: (task: () => Promise<void>, message?: string) => Promise<void>;
};

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const showLoader = useCallback((msg?: string) => {
    setMessage(msg);
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
  }, []);

  const performRefresh = useCallback(async (task: () => Promise<void>, msg: string = "Refreshing...") => {
    setIsRefreshing(true);
    showLoader(msg);
    const refreshTimeout = setTimeout(() => setIsRefreshing(false), 500);

    try {
      await task();
    } finally {
      clearTimeout(refreshTimeout);
      hideLoader();
      setIsRefreshing(false);
    }
  }, [showLoader, hideLoader]);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, isLoading, isRefreshing, performRefresh }}>
      {children}
      <OverlayLoader visible={isLoading} message={message} />
    </LoaderContext.Provider>
  );
}

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
};
