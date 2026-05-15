import { Stack } from "expo-router";
import { DesignProvider } from "../contexts/designContext";
import { ThemeProvider } from "../contexts/themeContext";
import { OverlayProvider } from "../contexts/overlayContext";
import { AuthProvider } from "../contexts/authContext";
import { TokenProvider } from "../contexts/tokenContext";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import Head from "expo-router/head";
import {
  useFonts,
  SourceSansPro_400Regular,
  SourceSansPro_600SemiBold,
  SourceSansPro_700Bold,
} from "@expo-google-fonts/source-sans-pro";
import { useEffect } from "react";
import { View, Platform, useWindowDimensions } from "react-native";
import { useTheme } from "react-native-paper";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";
import { useOverlay } from "../contexts/overlayContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SourceSansPro_400Regular,
    SourceSansPro_600SemiBold,
    SourceSansPro_700Bold,
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
  const { isOverlayActive } = useOverlay();
  const { width } = useWindowDimensions();
  const isMobileWidth = width <= 500;

  useEffect(() => {
    if (Platform.OS === "web") {
      const color = isOverlayActive
        ? "#9c9ea0"
        : !isMobileWidth
          ? theme.colors.surfaceVariant
          : theme.colors.background;

      document.body.style.backgroundColor = color;

      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "theme-color");
        document.getElementsByTagName("head")[0].appendChild(meta);
      }
      // For mobile browsers, we still want theme-color to be the overlay color or the app background
      const metaColor = isOverlayActive ? "#9c9ea0" : theme.colors.background;
      meta.setAttribute("content", metaColor);
    }
  }, [theme.colors.background, theme.colors.surfaceVariant, isOverlayActive, isMobileWidth]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          Platform.OS === "web" && !isMobileWidth
            ? theme.colors.surfaceVariant
            : theme.colors.background,
        alignItems: "center",
      }}
    >
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </Head>
      <StatusBar style={theme.dark ? "light" : "dark"} />
      <SafeAreaView
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 500,
          backgroundColor: theme.colors.background,
          overflow: "hidden",
          ...(Platform.OS === "web" && {
            shadowColor: theme.colors.shadow,
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
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        />
      </SafeAreaView>
    </View>
  );
}
