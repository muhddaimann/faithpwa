import { Stack, useRouter, useSegments } from "expo-router";
import { DesignProvider } from "../contexts/designContext";
import { ThemeProvider } from "../contexts/themeContext";
import { OverlayProvider } from "../contexts/overlayContext";
import { AuthProvider, useAuth } from "../contexts/authContext";
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
  const [fontsLoaded, error] = useFonts({
    SourceSansPro_400Regular,
    SourceSansPro_600SemiBold,
    SourceSansPro_700Bold,
  });

  if (error) {
    console.error("Font loading error:", error);
  }

  return (
    <SafeAreaProvider>
      <DesignProvider>
        <ThemeProvider>
          <OverlayProvider>
            <TokenProvider>
              <AuthProvider>
                <AppContent fontsLoaded={fontsLoaded} />
              </AuthProvider>
            </TokenProvider>
          </OverlayProvider>
        </ThemeProvider>
      </DesignProvider>
    </SafeAreaProvider>
  );
}

function AppContent({ fontsLoaded }: { fontsLoaded: boolean }) {
  const theme = useTheme();
  const { isOverlayActive } = useOverlay();
  const { user, isLoading: isAuthLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobileWidth = width <= 500;

  // 1. Unified Navigation Guard
  useEffect(() => {
    if (isAuthLoading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === "(tabs)";

    if (!user && inAuthGroup) {
      // Redirect to login if trying to access private routes while logged out
      router.replace("/");
    } else if (user && !inAuthGroup) {
      // Redirect to home if trying to access login while already authenticated
      router.replace("/(tabs)/home");
    }
  }, [user, isAuthLoading, segments, fontsLoaded]);

  // 2. Hide Splash Screen only when EVERYTHING is ready
  useEffect(() => {
    if (fontsLoaded && !isAuthLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isAuthLoading]);

  // 3. Web & PWA specific logic
  useEffect(() => {
    if (Platform.OS === "web") {
      // Disable native overscroll refresh/rubber-banding
      document.body.style.overscrollBehavior = "none";
      document.documentElement.style.overscrollBehavior = "none";

      // Register Service Worker for PWA
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('SW registered: ', registration);
          }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
        });
      }

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
      const metaColor = isOverlayActive ? "#9c9ea0" : theme.colors.background;
      meta.setAttribute("content", metaColor);
    }
  }, [theme.colors.background, theme.colors.surfaceVariant, isOverlayActive, isMobileWidth]);

  // Prevent rendering the stack until auth state is determined to avoid layout flashes
  if (!fontsLoaded || isAuthLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
        }}
      />
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          Platform.OS === "web" && !isMobileWidth
            ? theme.colors.surfaceVariant
            : theme.colors.background,
        alignItems: "center",
        // @ts-ignore - overscrollBehavior is supported on web
        overscrollBehavior: "none",
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
