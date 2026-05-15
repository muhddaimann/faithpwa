import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Platform } from "react-native";
import { useTheme } from "react-native-paper";
import { OverlayAlert } from "../components/overlay/alert";
import { OverlayConfirm } from "../components/overlay/confirm";
import { OverlayToast, ToastVariant } from "../components/overlay/toast";
import { OverlayModal } from "../components/overlay/modal";
import { OverlaySheet } from "../components/overlay/sheet";
import { OverlayLoader } from "../components/overlay/loader";

type AlertOptions = {
  title: string;
  message: string;
  buttonText?: string;
  onPress?: () => void;
};

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isDestructive?: boolean;
};

type ToastOptions = {
  message: string;
  duration?: number;
  variant?: ToastVariant;
  icon?: string;
};

type ModalOptions = {
  content: React.ReactNode;
  onDismiss?: () => void;
  dismissable?: boolean;
};

type SheetOptions = {
  title?: string;
  content: React.ReactNode;
  onDismiss?: () => void;
};

type OverlayContextType = {
  // Alert
  alert: (options: AlertOptions) => void;
  // Confirm
  confirm: (options: ConfirmOptions) => void;
  // Toast
  toast: (options: ToastOptions | string) => void;
  // Modal
  showModal: (options: ModalOptions) => void;
  hideModal: () => void;
  // Sheet
  showSheet: (options: SheetOptions) => void;
  hideSheet: () => void;
  // Loader
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  isLoading: boolean;
  isRefreshing: boolean;
  isOverlayActive: boolean;
  performRefresh: (
    task: () => Promise<void>,
    message?: string,
  ) => Promise<void>;
};

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  // Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertOptions | null>(null);

  // Confirm State
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmOptions | null>(
    null,
  );

  // Toast State
  const [toastVisible, setToastVisible] = useState(false);
  const [toastConfig, setToastConfig] = useState<ToastOptions | null>(null);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalOptions | null>(null);

  // Sheet State
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetConfig, setSheetConfig] = useState<SheetOptions | null>(null);

  // Loader State
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState<string | undefined>(
    undefined,
  );

  const isOverlayActive =
    alertVisible ||
    confirmVisible ||
    modalVisible ||
    sheetVisible ||
    isLoading;

  useEffect(() => {
    if (Platform.OS === "web") {
      // Prevent background scrolling when overlay is active
      document.body.style.overflow = isOverlayActive ? "hidden" : "auto";
    }
  }, [isOverlayActive]);

  const alert = useCallback((options: AlertOptions) => {
    setAlertConfig(options);
    setAlertVisible(true);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    setConfirmConfig(options);
    setConfirmVisible(true);
  }, []);

  const toast = useCallback((options: ToastOptions | string) => {
    if (typeof options === "string") {
      setToastConfig({ message: options });
    } else {
      setToastConfig(options);
    }
    setToastVisible(true);
  }, []);

  const showModal = useCallback((options: ModalOptions) => {
    setModalConfig(options);
    setModalVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setModalVisible(false);
    modalConfig?.onDismiss?.();
  }, [modalConfig]);

  const showSheet = useCallback((options: SheetOptions) => {
    setSheetConfig(options);
    setSheetVisible(true);
  }, []);

  const hideSheet = useCallback(() => {
    setSheetVisible(false);
    sheetConfig?.onDismiss?.();
  }, [sheetConfig]);

  const showLoader = useCallback((msg?: string) => {
    setLoaderMessage(msg);
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
  }, []);

  const performRefresh = useCallback(
    async (task: () => Promise<void>, msg: string = "Refreshing...") => {
      setIsRefreshing(true);
      showLoader(msg);
      const refreshTimeout = setTimeout(() => setIsRefreshing(false), 0);

      try {
        await task();
      } finally {
        clearTimeout(refreshTimeout);
        hideLoader();
        setIsRefreshing(false);
      }
    },
    [showLoader, hideLoader],
  );

  const handleAlertClose = () => {
    setAlertVisible(false);
    alertConfig?.onPress?.();
  };

  const handleConfirmAction = () => {
    setConfirmVisible(false);
    confirmConfig?.onConfirm();
  };

  const handleConfirmCancel = () => {
    setConfirmVisible(false);
    confirmConfig?.onCancel?.();
  };

  return (
    <OverlayContext.Provider
      value={{
        alert,
        confirm,
        toast,
        showModal,
        hideModal,
        showSheet,
        hideSheet,
        showLoader,
        hideLoader,
        isLoading,
        isRefreshing,
        isOverlayActive,
        performRefresh,
      }}
    >
      {children}

      <OverlayAlert
        visible={alertVisible}
        title={alertConfig?.title}
        message={alertConfig?.message}
        buttonText={alertConfig?.buttonText}
        onClose={handleAlertClose}
      />

      <OverlayConfirm
        visible={confirmVisible}
        title={confirmConfig?.title}
        message={confirmConfig?.message}
        confirmText={confirmConfig?.confirmText}
        cancelText={confirmConfig?.cancelText}
        onConfirm={handleConfirmAction}
        onCancel={handleConfirmCancel}
        isDestructive={confirmConfig?.isDestructive}
      />

      <OverlayModal
        visible={modalVisible}
        content={modalConfig?.content}
        onDismiss={hideModal}
        dismissable={modalConfig?.dismissable}
      />

      <OverlaySheet
        visible={sheetVisible}
        title={sheetConfig?.title}
        content={sheetConfig?.content}
        onDismiss={hideSheet}
      />

      <OverlayToast
        visible={toastVisible}
        message={toastConfig?.message || ""}
        onDismiss={() => setToastVisible(false)}
        duration={toastConfig?.duration}
        variant={toastConfig?.variant}
        icon={toastConfig?.icon}
      />

      <OverlayLoader visible={isLoading} message={loaderMessage} />
    </OverlayContext.Provider>
  );
}

export const useOverlay = () => {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error("useOverlay must be used within an OverlayProvider");
  }
  return context;
};
