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
  useTheme,
} from "react-native-paper";
import { useDesign } from "../../../../contexts/designContext";
import { useTabs } from "../../../../contexts/tabContext";
import { useOverlay } from "../../../../contexts/overlayContext";
import Header from "../../../../components/header";
import ScrollTop from "../../../../components/scrollTop";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AttendanceOverview from "../../../../components/attendance/attendaceOverview";
import AttendanceInsight from "../../../../components/attendance/attendaceInsight";
import { useAttendance } from "../../../../hooks/useAttendance";

export default function Attendance() {
  const theme = useTheme();
  const tokens = useDesign();
  const { setHideTabBar } = useTabs();
  const { toast, performRefresh } = useOverlay();
  const { refreshAttendance } = useAttendance();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [view, setView] = useState<"Weekly" | "Monthly">("Weekly");

  useEffect(() => {
    setHideTabBar(true);
    return () => setHideTabBar(false);
  }, []);

  const handleRefresh = async () => {
    await performRefresh(async () => {
      await refreshAttendance();
      toast({
        message: "Attendance logs updated",
        variant: "success",
      });
    }, "Updating Logs...");
  };

  const toggleClock = () => {
    const action = isClockedIn ? "Clock Out" : "Clock In";
    confirm({
      title: `${action}?`,
      message: `Are you sure you want to ${action.toLowerCase()} at ${new Date().toLocaleTimeString()}?`,
      confirmText: action,
      onConfirm: () => {
        const now = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        if (!isClockedIn) {
          setClockInTime(now);
          setIsClockedIn(true);
          toast({ message: `Clocked in at ${now}`, variant: "success" });
        } else {
          setIsClockedIn(false);
          setClockInTime(null);
          toast({ message: `Clocked out at ${now}`, variant: "info" });
        }
      },
    });
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    setShowScrollTop(offset > 300);
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
          flexGrow: 1,
          paddingHorizontal: tokens.spacing.lg,
          paddingBottom: tokens.spacing["3xl"],
          gap: tokens.spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Attendance"
          subtitle="Track your daily presence"
          showBack
          rightSlot={
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.colors.surfaceVariant,
                borderRadius: 999,
                padding: 3,
                gap: 2,
                borderWidth: 1,
                borderColor: `${theme.colors.outline}20`,
              }}
            >
              {[
                {
                  key: "Weekly",
                  icon: "view-week-outline",
                  label: "Weekly",
                },
                {
                  key: "Monthly",
                  icon: "calendar-blank-outline",
                  label: "Monthly",
                },
              ].map((item) => {
                const active = view === item.key;

                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => setView(item.key as "Weekly" | "Monthly")}
                    activeOpacity={0.8}
                    style={{
                      height: 36,
                      paddingHorizontal: active ? 14 : 10,
                      borderRadius: 999,
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                      backgroundColor: active
                        ? theme.colors.primary
                        : "transparent",
                    }}
                  >
                    {active ? (
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: theme.colors.onPrimary,
                        }}
                      >
                        {item.label}
                      </Text>
                    ) : (
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={18}
                        color={theme.colors.onSurfaceVariant}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          }
        />
        <AttendanceOverview view={view} />
        <AttendanceInsight />
      </ScrollView>

      <ScrollTop visible={showScrollTop} onPress={scrollToTop} />
    </View>
  );
}
