import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import {
  Text,
  Button,
  Card,
  useTheme,
  Divider,
  Icon,
} from "react-native-paper";
import { useDesign } from "../../../../contexts/designContext";
import { useTabs } from "../../../../contexts/tabContext";
import { useOverlay } from "../../../../contexts/overlayContext";
import Header from "../../../../components/header";
import ScrollTop from "../../../../components/scrollTop";
import RowTwo from "../../../../components/rowtwo";
import LeaveList from "../../../../components/leave/leaveList";
import { useLeave } from "../../../../hooks/useLeave";
import { useRouter } from "expo-router";

export default function Leave() {
  const theme = useTheme();
  const tokens = useDesign();
  const router = useRouter();
  const { setHideTabBar } = useTabs();
  const { alert } = useOverlay();
  const { stats } = useLeave();

  const scrollViewRef = useRef<ScrollView | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setHideTabBar(true);
    return () => setHideTabBar(false);
  }, []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    setShowScrollTop(offset > 300);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleAboutLeave = () => {
    alert({
      title: "Leave Policy",
      message: "• Please ensure you have discussed and obtained verbal approval from your manager before submitting.\n\n• Applications close to the payday cycle (after 20th) may only be reflected in the following month's payslip.\n\n• Emergency leaves must be supported by valid documentation upon return.",
      buttonText: "Got it"
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: tokens.spacing.lg,
          paddingBottom: tokens.spacing["3xl"],
          gap: tokens.spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Leave Management"
          subtitle="View balances and apply for leave"
          showBack
        />

        <RowTwo
          left={{
            icon: "clock-outline",
            label: "Pending Leave",
            value: stats.pending.toString(),
            color: "#F59E0B",
          }}
          right={{
            icon: "briefcase-outline",
            label: "Annual Balance",
            value: stats.annualBalance.toString(),
            color: "#10B981",
          }}
        />

        <View style={{ flexDirection: "row", gap: tokens.spacing.sm }}>
          <Button
            mode="outlined"
            onPress={handleAboutLeave}
            style={{
              flex: 1,
              borderRadius: tokens.radii.pill,
              borderColor: theme.colors.outline,
            }}
            icon="information-outline"
          >
            About
          </Button>
          
          <Button
            mode="contained"
            onPress={() => router.push("home/leave/apply")}
            style={{
              flex: 1.5,
              borderRadius: tokens.radii.pill,
            }}
            icon="plus"
          >
            Apply Leave
          </Button>
        </View>

        <LeaveList />
      </ScrollView>

      <ScrollTop visible={showScrollTop} onPress={scrollToTop} />
    </View>
  );
}
