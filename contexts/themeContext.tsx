import React, { createContext, useContext, useMemo, useState } from "react";
import { View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { lightTheme, darkTheme } from "../constants/theme";

type Ctx = { isDark: boolean; toggle: () => void };
const ThemeCtx = createContext<Ctx>({ isDark: false, toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const insets = useSafeAreaInsets();
  
  const value = useMemo<Ctx>(
    () => ({ isDark, toggle: () => setIsDark((v) => !v) }),
    [isDark]
  );

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeCtx.Provider value={value}>
      <PaperProvider theme={theme}>
        <StatusBar
          style={isDark ? "light" : "dark"}
          backgroundColor={theme.colors.background}
        />
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          {children}
        </View>
      </PaperProvider>
    </ThemeCtx.Provider>
  );
}

export const useAppTheme = () => useContext(ThemeCtx);
