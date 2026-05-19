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
import SectionHeader from "../../../components/section";
import { useRouter } from "expo-router";
import { useAuth } from "../../../hooks/useAuth";
import AttendanceCard from "../../../components/attendance/attendanceCard";
import NewsflashCarousel from "../../../components/newsflash/newsflashCarousel";
import RowTwo from "../../../components/rowtwo";

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
    setShowScrollTop(offset > 200);
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
        <AttendanceCard />

        <SectionHeader
          icon="calendar-check"
          title="Leave"
          subtitle="Manage leave applications"
          actionLabel="See All"
          actionRoute="home/leave"
        />

        <RowTwo
          left={{
            icon: "clock-outline",
            label: "Pending Leave",
            value: "0",
            color: "#F59E0B",
          }}
          right={{
            icon: "briefcase-outline",
            label: "Annual Balance",
            value: "0",
            color: "#10B981",
          }}
        />

        <NewsflashCarousel />

        <SectionHeader
          icon="door-sliding"
          title="Room Booking"
          subtitle="Reserve meeting rooms"
          actionLabel="See All"
          actionRoute="home/room"
        />

        <RowTwo
          left={{
            icon: "door-open",
            label: "Active Booking",
            value: "0",
            color: "#3B82F6",
          }}
          right={{
            icon: "history",
            label: "Booking History",
            value: "0",
            color: "#8B5CF6",
          }}
        />
      </ScrollView>

      <ScrollTop visible={showScrollTop} onPress={scrollToTop} />
    </View>
  );
}
