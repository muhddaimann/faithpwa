import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DesignProvider } from "../contexts/designContext";
import { ThemeProvider } from "../contexts/themeContext";
import { OverlayProvider } from "../contexts/overlayContext";
import { AuthProvider } from "../contexts/authContext";
import { TokenProvider } from "../contexts/tokenContext";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useEffect } from "react";
import { View, Platform } from "react-native";
import { useTheme } from "react-native-paper";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <DesignProvider>
        <ThemeProvider>
          <OverlayProvider>
            <TokenProvider>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </TokenProvider>
          </OverlayProvider>
        </ThemeProvider>
      </DesignProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Platform.OS === "web" ? theme.colors.surfaceVariant : theme.colors.background,
        alignItems: "center",
      }}
    >
      <View
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 500,
          backgroundColor: theme.colors.background,
          ...(Platform.OS === "web" && {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: theme.colors.outlineVariant,
          }),
        }}
      >
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        />
      </View>
    </View>
  );
}
