import React, { useRef, useState } from "react";
import {
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useDesign } from "../../../contexts/designContext";
import ScrollTop from "../../../components/scrollTop";
import { useTabs } from "../../../contexts/tabContext";
import Head from "../../../components/head";
import { useRouter } from "expo-router";
import { useAuth } from "../../../contexts/authContext";

export default function Home() {
  const theme = useTheme();
  const tokens = useDesign();
  const router = useRouter();
  const { user } = useAuth();
  const { onScroll } = useTabs();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    setShowScrollTop(offset > 300);
    onScroll(offset);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: tokens.spacing.md,
          paddingBottom: tokens.spacing["3xl"],
          paddingHorizontal: tokens.spacing.lg,
          gap: tokens.spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Head
          greeting="Good Morning"
          username={user?.name || "User"}
          designation={user?.designation || ""}
          avatarText={user?.avatarText || "U"}
          onNotificationPress={() => router.push("home/newsflash")}
        />
      </ScrollView>

      <ScrollTop visible={showScrollTop} onPress={scrollToTop} />
    </View>
  );
}
